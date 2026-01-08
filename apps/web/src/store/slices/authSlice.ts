import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authControllerLogin } from '@/api/services.gen';

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthState {
  token: string | null;
  user: {
    id: string;
    username: string;
    nickname?: string;
    avatar?: string;
  } | null;
  loading: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  loading: false,
};

export const login = createAsyncThunk('auth/login', async (credentials: LoginCredentials) => {
  const response = await authControllerLogin({ body: credentials });
  console.log(response);
  return response.data?.data || response.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.accessToken;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.accessToken);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
