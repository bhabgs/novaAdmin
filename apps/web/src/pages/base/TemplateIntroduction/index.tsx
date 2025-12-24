import React from "react";
import { PageContainer } from "@/components";
import { t } from "i18next";
import { Typography, Card, Space, Divider, Tag, List } from "antd";
import {
  CodeOutlined,
  SettingOutlined,
  ApiOutlined,
  GlobalOutlined,
  DeploymentUnitOutlined,
  PartitionOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

const TemplateIntroduction: React.FC = () => {
  // 关键特性列表（用于展示要点）
  const features = [
    "登录态与受保护路由、权限校验（基于角色/菜单）",
    "多语言与 RTL 支持（i18next）",
    "主题设置（浅/深色、主题色、圆角、布局）",
    "页签导航、面包屑与统一页面容器",
    "Ant Design 5 + Tailwind 实用样式",
    "Axios 请求封装 + MSW Mock",
    "常用业务模块示例：用户、角色、菜单、仪表盘等",
  ];

  // 技术栈（每项可点击，跳转到 iframe 页签并展示对应官网文档）
  const techs: { label: string; url: string }[] = [
    { label: "React 18", url: "https://react.dev/" },
    { label: "React Router 7", url: "https://reactrouter.com/" },
    { label: "TypeScript 5", url: "https://www.typescriptlang.org/" },
    { label: "Vite 6", url: "https://vitejs.dev/" },
    { label: "Ant Design 5", url: "https://ant.design/" },
    { label: "@ant-design/charts", url: "https://charts.ant.design/" },
    { label: "Redux Toolkit", url: "https://redux-toolkit.js.org/" },
    { label: "i18next", url: "https://www.i18next.com/" },
    { label: "react-i18next", url: "https://react.i18next.com/" },
    { label: "Axios", url: "https://axios-http.com/" },
    { label: "MSW", url: "https://mswjs.io/" },
    { label: "Tailwind CSS", url: "https://tailwindcss.com/" },
  ];

  const navigate = useNavigate();

  // 点击技术栈标签后，通过路由跳转到 iframe-view，并在 PageTabs 中以新标签页打开
  const openInIframe = (url: string, title: string) => {
    const target = `/iframe-view?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    navigate(target);
  };

  return (
    <PageContainer title={t("menu.templateIntroduction")} ghost>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* 概览 */}
        <Card>
          <Title level={3}>
            <FolderOpenOutlined /> NovaAdmin 架构概览
          </Title>
          <Paragraph>
            NovaAdmin 旨在作为企业级后台管理系统的前端基础脚手架，提供稳定的架构分层、通用组件、完善的权限与国际化支持，并兼顾良好的开发与扩展体验。
          </Paragraph>
          <Divider />
          <Title level={4}>
            <CodeOutlined /> 核心特性
          </Title>
          <List
            dataSource={features}
            renderItem={(item) => (
              <List.Item>
                <Text>- {item}</Text>
              </List.Item>
            )}
          />
          <Divider />
          <Title level={4}>
            <DeploymentUnitOutlined /> 技术栈（点击打开文档）
          </Title>
          <Space wrap>
            {techs.map((s) => (
              <Tag
                color="blue"
                key={s.label}
                style={{ cursor: "pointer" }}
                onClick={() => openInIframe(s.url, s.label)}
              >
                {s.label}
              </Tag>
            ))}
          </Space>
        </Card>

        {/* 路由与权限 */}
        <Card title={<Title level={4}><PartitionOutlined /> 路由与权限</Title>}>
          <Paragraph>
            - 受保护路由：在进入主布局前进行登录态校验，未登录跳转至登录页。
          </Paragraph>
          <Paragraph>
            - 权限校验：页面与操作级权限基于角色/菜单驱动，配合 PermissionWrapper 控制展示与交互。
          </Paragraph>
          <Paragraph>
            - 菜单驱动：由后端（或 Mock）返回菜单树，前端将可见菜单与路由表对齐，隐藏无权限页面。
          </Paragraph>
        </Card>

        {/* 状态管理 */}
        <Card title={<Title level={4}><SettingOutlined /> 状态管理（Redux Toolkit）</Title>}>
          <Paragraph>
            - 按模块切片（slice）划分，统一 reducer、actions 与异步 thunk，降低心智负担。
          </Paragraph>
          <Paragraph>
            - 设置项（语言、主题、布局）持久化到 localStorage，保证刷新与重启后的稳定性。
          </Paragraph>
          <Paragraph>
            - 类型化 hooks（useAppDispatch/useAppSelector）提供更友好的 TS 开发体验。
          </Paragraph>
        </Card>

        {/* 国际化与主题 */}
        <Card title={<Title level={4}><GlobalOutlined /> 国际化与主题</Title>}>
          <Paragraph>
            - i18next 管理多语言资源，支持 zh-CN / en-US / ar-SA，并可切换 RTL。
          </Paragraph>
          <Paragraph>
            - AntD 5 主题 Token：统一管理色彩、圆角与组件风格；ThemeSettings 面板一站式配置。
          </Paragraph>
        </Card>

        {/* 数据与 Mock */}
        <Card title={<Title level={4}><ApiOutlined /> 数据请求与 Mock</Title>}>
          <Paragraph>
            - Axios 拦截器统一处理 token、错误提示与响应格式；模块中使用统一 API 封装。
          </Paragraph>
          <Paragraph>
            - MSW 在开发阶段提供可用的前端 Mock，使页面组件与数据联动更顺畅，减少后端依赖。
          </Paragraph>
        </Card>

        {/* 组件基建 */}
        <Card title={<Title level={4}><CodeOutlined /> 组件基建与页面体验</Title>}>
          <Paragraph>
            - PageContainer 统一页面标题、操作区与内容；PageTabs 管理多页签导航与上下文菜单。
          </Paragraph>
          <Paragraph>
            - CommonTable/CommonForm/CommonModal 等通用组件降低重复开发，提高一致性与可维护性。
          </Paragraph>
        </Card>

        {/* 构建与部署 */}
        <Card title={<Title level={4}><DeploymentUnitOutlined /> 构建与部署</Title>}>
          <Paragraph>
            - 使用 Vite 进行高性能开发与构建，生产环境隐藏 source map，输出目录为 nova-admin。
          </Paragraph>
          <Paragraph>
            - 静态资源（如 README.md）通过插件复制至产物根目录，便于随产物交付文档。
          </Paragraph>
        </Card>

        {/* 扩展与优化建议 */}
        <Card title={<Title level={4}><FolderOpenOutlined /> 扩展与优化建议</Title>}>
          <Paragraph>
            - 路由懒加载与分包，减少首屏体积；长列表使用虚拟滚动提升性能。
          </Paragraph>
          <Paragraph>
            - 抽象接口层类型定义，协同后端通过 OpenAPI 自动生成类型，提升一致性与正确性。
          </Paragraph>
          <Paragraph>
            - 权限粒度细化到按钮/操作级别，结合设计系统完善交互与可见性控制。
          </Paragraph>
        </Card>
      </Space>
    </PageContainer>
  );
};

export default TemplateIntroduction;
