import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
          <h2 className="text-2xl font-semibold">{t('error.pageNotFound', '页面未找到')}</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t('error.pageNotFoundDesc', '抱歉，您访问的页面不存在或已被移除')}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.goBack', '返回上页')}
          </Button>
          <Link to="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              {t('common.backToHome', '返回首页')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
