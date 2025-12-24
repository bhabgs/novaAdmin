import React from "react";
import { HashRouter } from "react-router-dom";
import DynamicRoutes from "./DynamicRoutes";

/**
 * 路由提供者组件
 * 使用 HashRouter + 动态路由
 */
const AppRouter: React.FC = () => {
  return (
    <HashRouter>
      <DynamicRoutes />
    </HashRouter>
  );
};

export default AppRouter;
