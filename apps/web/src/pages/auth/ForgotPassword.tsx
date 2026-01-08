import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { KeyRound, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: 实现忘记密码逻辑
      console.log('Reset password for:', email);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟 API 调用
      setSubmitted(true);
    } catch (error) {
      console.error('Password reset failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Forgot Password Form */}
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardContent className="pt-12 pb-8 px-8">
            {!submitted ? (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-center mb-2">忘记密码？</h1>
                  <p className="text-center text-muted-foreground">
                    输入您的邮箱，我们将发送重置密码链接
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      邮箱地址
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-black hover:bg-black/90 text-white"
                    disabled={loading}
                  >
                    {loading ? '发送中...' : '发送重置链接'}
                  </Button>

                  <div className="flex justify-center mt-6">
                    <Link
                      to="/login"
                      className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      返回登录
                    </Link>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">邮件已发送！</h2>
                  <p className="text-muted-foreground mb-6">
                    我们已向 <span className="font-medium text-foreground">{email}</span>{' '}
                    发送了密码重置链接。
                    <br />
                    请查看您的邮箱并点击链接重置密码。
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    没有收到邮件？请检查垃圾邮件文件夹或{' '}
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-foreground hover:underline font-medium"
                    >
                      重新发送
                    </button>
                  </p>
                </div>
                <Link to="/login">
                  <Button className="w-full h-11 bg-black hover:bg-black/90 text-white">
                    返回登录
                  </Button>
                </Link>
              </div>
            )}
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
                <KeyRound className="h-8 w-8 text-neutral-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center text-sm text-muted-foreground">
        需要帮助？{' '}
        <Link to="/support" className="underline hover:text-foreground">
          联系客服
        </Link>
      </div>
    </div>
  );
}
