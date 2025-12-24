import React from 'react';
import { Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { runAllTests } from '@/utils/test';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleRunTests = async () => {
    message.loading('正在运行测试...', 0);
    
    try {
      const results = await runAllTests();
      message.destroy();
      
      if (Object.values(results).every(result => result === true)) {
        message.success('所有测试通过！系统运行正常');
      } else {
        message.warning('部分测试未通过，请查看控制台了解详情');
      }
    } catch (error) {
      message.destroy();
      message.error('测试运行失败，请查看控制台了解详情');
      console.error('Test execution failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">NovaAdmin</h1>
        <p className="text-gray-600 mb-6">通用后台管理系统</p>
        <div className="space-y-4">
          <Button 
            type="primary" 
            size="large" 
            block
            onClick={() => navigate('/login')}
          >
            进入系统
          </Button>
          <Button 
            size="large" 
            block
            onClick={() => navigate('/dashboard')}
          >
            直接访问仪表盘
          </Button>
          <Button 
            size="large" 
            block
            onClick={handleRunTests}
            className="border-green-500 text-green-500 hover:bg-green-50"
          >
            运行系统测试
          </Button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>测试账号：</p>
          <p>管理员：admin / 123456</p>
          <p>普通用户：user / 123456</p>
        </div>
      </Card>
    </div>
  );
};

export default Home;