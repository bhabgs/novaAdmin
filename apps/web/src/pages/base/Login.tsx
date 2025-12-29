import React, { useState, useEffect } from "react";
import { Form, Input, Button, Checkbox, Card, message, Spin } from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { login } from "@/store/slices/authSlice";

interface LoginForm {
  username: string;
  password: string;
  remember: boolean;
}

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { loading, error } = useAppSelector((state) => state.auth);
  const [rememberMe, setRememberMe] = useState(false);

  // 获取重定向路径
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  useEffect(() => {
    // 检查是否有保存的登录信息
    const savedUsername = localStorage.getItem("rememberedUsername");
    const savedRemember = localStorage.getItem("rememberMe") === "true";

    if (savedUsername && savedRemember) {
      form.setFieldsValue({
        username: savedUsername,
        remember: savedRemember,
      });
      setRememberMe(savedRemember);
    }
  }, [form]);

  useEffect(() => {
    if (error) {
      // 错误消息会在 handleSubmit 的 catch 中显示，这里不需要重复显示
      // 但为了确保错误被清除，我们可以在这里处理
    }
  }, [error]);

  const handleSubmit = async (values: LoginForm) => {
    try {
      const result = await dispatch(
        login({
          username: values.username,
          password: values.password,
        })
      ).unwrap();

      if (result) {
        // 处理记住我功能
        if (values.remember) {
          localStorage.setItem("rememberedUsername", values.username);
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberedUsername");
          localStorage.removeItem("rememberMe");
        }

        message.success("登录成功！");
        navigate(from, { replace: true });
      }
    } catch (error) {
      // 错误已在Redux中处理，通过useEffect显示错误消息
      // 不进行任何导航或刷新操作，只显示错误提示
      const errorMessage = error instanceof Error ? error.message : "登录失败，请检查用户名和密码";
      message.error(errorMessage);
    }
  };

  const handleRememberChange = (e: any) => {
    setRememberMe(e.target.checked);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card
          className="shadow-2xl border-0 rounded-2xl"
          bodyStyle={{ padding: "2rem" }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserOutlined className="text-2xl text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">欢迎回来</h1>
            <p className="text-gray-500">请登录您的账户</p>
          </div>

          <Spin spinning={loading}>
            <Form
              form={form}
              name="login"
              onFinish={handleSubmit}
              autoComplete="off"
              size="large"
              layout="vertical"
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: "请输入用户名！" },
                  { min: 3, message: "用户名至少3个字符！" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="请输入用户名"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: "请输入密码！" },
                  { min: 6, message: "密码至少6个字符！" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="请输入密码"
                  className="rounded-lg"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item>
                <div className="flex items-center justify-between">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox onChange={handleRememberChange}>记住我</Checkbox>
                  </Form.Item>
                  <Button
                    type="link"
                    className="p-0 text-blue-500 hover:text-blue-600"
                    onClick={() => message.info("请联系管理员重置密码")}
                  >
                    忘记密码？
                  </Button>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 border-0 hover:from-blue-600 hover:to-indigo-700 font-medium"
                  loading={loading}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </Spin>

        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          © 2024 NovaAdmin. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
