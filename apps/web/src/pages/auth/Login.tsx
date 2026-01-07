import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { login } from '@/store/slices/authSlice';
import { cn } from '@/lib/utils';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(login({ username, password })).unwrap();
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">{t('login.title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">{t('login.username')}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('login.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full rounded-md bg-primary py-2 text-primary-foreground font-medium',
              'hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              loading && 'opacity-50 cursor-not-allowed',
            )}
          >
            {loading ? t('common.loading') : t('login.login')}
          </button>
        </form>
      </div>
    </div>
  );
}
