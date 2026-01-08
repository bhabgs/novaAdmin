import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('密码不匹配');
      return;
    }

    setLoading(true);
    try {
      // TODO: 实现注册逻辑
      console.log('Register:', formData);
      // 注册成功后跳转到登录页
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Register Form */}
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardContent className="pt-12 pb-8 px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-center mb-2">创建账户</h1>
              <p className="text-center text-muted-foreground">
                注册 NovaAdmin 管理账户
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  用户名
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="请输入用户名"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  邮箱
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  密码
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  确认密码
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-black hover:bg-black/90 text-white"
                disabled={loading}
              >
                {loading ? '注册中...' : '注册'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    或继续使用
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => console.log('Apple signup')}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => console.log('Google signup')}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => console.log('Meta signup')}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 3.667h-3.533v7.98H9.101z" />
                  </svg>
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                已有账户？{' '}
                <Link to="/login" className="text-foreground hover:underline font-medium">
                  立即登录
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Right Side - Decorative */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="relative w-96 h-96">
            {/* Decorative circles and icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-80 h-80 rounded-full border-2 border-dashed border-neutral-300" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full border-2 border-dashed border-neutral-300" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center shadow-lg">
                <UserPlus className="h-8 w-8 text-neutral-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center text-sm text-muted-foreground">
        点击注册即表示您同意我们的{' '}
        <Link to="/terms" className="underline hover:text-foreground">
          服务条款
        </Link>{' '}
        和{' '}
        <Link to="/privacy" className="underline hover:text-foreground">
          隐私政策
        </Link>
        。
      </div>
    </div>
  );
}
