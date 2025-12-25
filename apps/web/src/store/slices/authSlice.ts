import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User, LoginResponse, ApiResponse } from "../../types";
import { LoginRequest } from "../../types";
import { tokenUtils, userUtils, clearAuth } from "../../utils/auth";
import {
  authControllerLogin,
  authControllerLogout,
  authControllerRefreshToken,
  authControllerGetUserInfo,
  authControllerChangePassword,
} from "../../api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: userUtils.getUser(),
  token: tokenUtils.getToken(),
  isAuthenticated: tokenUtils.hasToken() && !!userUtils.getUser(),
  loading: false,
  error: null,
};

// 异步登录action
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = (await authControllerLogin({
        body: credentials,
      })) as unknown as ApiResponse<LoginResponse>;

      // API 响应格式: { success, data, message, code }
      if (response.success) {
        const { user, token, refreshToken } = response.data;

        // 保存到localStorage
        tokenUtils.setToken(token);
        tokenUtils.setRefreshToken(refreshToken);
        userUtils.setUser(user);

        return response.data;
      } else {
        return rejectWithValue(response.message || "登录失败");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "登录失败";
      return rejectWithValue(errorMessage);
    }
  }
);

// 异步登出action
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await authControllerLogout();
    clearAuth();
    return null;
  } catch {
    // 即使API调用失败，也要清除本地存储
    clearAuth();
    return null;
  }
});

// 刷新token
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const refreshTokenValue = tokenUtils.getRefreshToken();
      if (!refreshTokenValue) {
        throw new Error("No refresh token available");
      }

      const response =
        (await authControllerRefreshToken()) as unknown as ApiResponse<{
          token: string;
        }>;
      if (response.success) {
        const { token } = response.data;
        tokenUtils.setToken(token);
        return { token };
      } else {
        return rejectWithValue(response.message || "Token刷新失败");
      }
    } catch (error: unknown) {
      clearAuth();
      const errorMessage =
        error instanceof Error ? error.message : "Token刷新失败";
      return rejectWithValue(errorMessage);
    }
  }
);

// 获取用户信息
export const fetchUserInfo = createAsyncThunk(
  "auth/fetchUserInfo",
  async (_, { rejectWithValue }) => {
    try {
      const response =
        (await authControllerGetUserInfo()) as unknown as ApiResponse<User>;
      if (response.success) {
        userUtils.setUser(response.data);
        return response.data;
      } else {
        return rejectWithValue(response.message || "获取用户信息失败");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "获取用户信息失败";
      return rejectWithValue(errorMessage);
    }
  }
);

// 修改密码
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    passwordData: {
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = (await authControllerChangePassword({
        body: passwordData,
      })) as unknown as ApiResponse<unknown>;
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || "修改密码失败");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "修改密码失败";
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      userUtils.setUser(action.payload);
    },
    updateUserInfo: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        userUtils.setUser(state.user);
      }
    },
  },
  extraReducers: (builder) => {
    // 登录
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // 登出
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // 刷新token
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // 获取用户信息
    builder
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
        }
      })
      .addCase(fetchUserInfo.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser, updateUserInfo } = authSlice.actions;
export default authSlice.reducer;
