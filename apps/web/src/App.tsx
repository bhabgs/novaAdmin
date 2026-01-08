import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAppSelector } from './hooks/redux';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/dashboard';
import UserList from './pages/system/user';
import RoleList from './pages/system/role';
import DepartmentList from './pages/system/department';
import MenuList from './pages/system/menu';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAppSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
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
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="system/user" element={<UserList />} />
          <Route path="system/role" element={<RoleList />} />
          <Route path="system/department" element={<DepartmentList />} />
          <Route path="system/menu" element={<MenuList />} />
        </Route>
      </Routes>
    </>
  );
}
