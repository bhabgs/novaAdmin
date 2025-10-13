import React from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes";

// 创建路由器
const router = createHashRouter(routes);

// 路由提供者组件
const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
export { router };
