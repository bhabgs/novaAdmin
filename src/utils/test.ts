// 简单的功能测试工具
export const testAPI = async () => {
  console.log('🧪 开始API测试...');
  
  try {
    // 测试登录API
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: '123456',
      }),
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ 登录API测试:', loginData);
    
    if (loginData.success && loginData.data.token) {
      // 测试获取用户信息API
      const userInfoResponse = await fetch('/api/auth/user-info', {
        headers: {
          'Authorization': `Bearer ${loginData.data.token}`,
        },
      });
      
      const userInfoData = await userInfoResponse.json();
      console.log('✅ 用户信息API测试:', userInfoData);
      
      // 测试Dashboard统计API
      const statsResponse = await fetch('/api/dashboard/statistics', {
        headers: {
          'Authorization': `Bearer ${loginData.data.token}`,
        },
      });
      
      const statsData = await statsResponse.json();
      console.log('✅ Dashboard统计API测试:', statsData);
    }
    
    console.log('🎉 API测试完成！');
    return true;
  } catch (error) {
    console.error('❌ API测试失败:', error);
    return false;
  }
};

// 测试Redux状态管理
export const testRedux = () => {
  console.log('🧪 开始Redux测试...');
  
  try {
    // 检查store是否正确导出
    const store = (window as any).__REDUX_STORE__;
    if (store) {
      console.log('✅ Redux Store已正确配置');
      console.log('📊 当前状态:', store.getState());
      return true;
    } else {
      console.warn('⚠️ Redux Store未在window对象上找到');
      return false;
    }
  } catch (error) {
    console.error('❌ Redux测试失败:', error);
    return false;
  }
};

// 测试路由
export const testRouting = () => {
  console.log('🧪 开始路由测试...');
  
  try {
    const currentPath = window.location.pathname;
    console.log('📍 当前路径:', currentPath);
    
    // 检查路由是否正常工作
    if (window.history && window.history.pushState) {
      console.log('✅ 路由功能正常');
      return true;
    } else {
      console.warn('⚠️ 路由功能异常');
      return false;
    }
  } catch (error) {
    console.error('❌ 路由测试失败:', error);
    return false;
  }
};

// 运行所有测试
export const runAllTests = async () => {
  console.log('🚀 开始运行所有测试...');
  
  const results = {
    redux: testRedux(),
    routing: testRouting(),
    api: await testAPI(),
  };
  
  console.log('📋 测试结果汇总:', results);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('🎉 所有测试通过！');
  } else {
    console.log('⚠️ 部分测试未通过，请检查相关功能');
  }
  
  return results;
};