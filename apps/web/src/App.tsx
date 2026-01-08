import { useEffect, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAppSelector, useAppDispatch } from './hooks/redux';
import { fetchMenus } from './store/slices/menuSlice';
import { generateRoutesFromMenus } from './utils/dynamicRoutes';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAppSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const dispatch = useAppDispatch();
  const { tree: menus } = useAppSelector((state) => state.menu);
  const { token } = useAppSelector((state) => state.auth);

  // 登录后加载菜单
  useEffect(() => {
    if (token) {
      dispatch(fetchMenus());
    }
  }, [token, dispatch]);

  // 根据菜单生成动态路由
  const dynamicRoutes = useMemo(() => {
    return generateRoutesFromMenus(menus);
  }, [menus]);

  return (
    <>
      <Toaster position="top-center" richColors closeButton />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          {/* 动态路由 */}
          {dynamicRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Routes>
    </>
  );
}
