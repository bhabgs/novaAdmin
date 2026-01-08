import { useTranslation } from 'react-i18next';
import { Users, Shield, Building2, Menu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const stats = [
  { label: 'Users', value: '1,234', icon: Users, color: 'bg-blue-500' },
  { label: 'Roles', value: '12', icon: Shield, color: 'bg-green-500' },
  { label: 'Departments', value: '8', icon: Building2, color: 'bg-yellow-500' },
  { label: 'Menus', value: '45', icon: Menu, color: 'bg-purple-500' },
];

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('menu.dashboard')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-full p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-muted-foreground">User action {i}</span>
                    <span className="ml-auto text-muted-foreground">2 min ago</span>
                  </div>
                  {i < 5 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">2.0.0</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Environment</span>
                <span className="font-medium">Development</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database</span>
                <span className="font-medium">PostgreSQL</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cache</span>
                <span className="font-medium">Redis</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
