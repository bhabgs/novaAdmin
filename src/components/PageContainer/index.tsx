import React from "react";
import { Breadcrumb, Card, Space, Button, Divider } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export interface BreadcrumbItem {
  title: string;
  path?: string;
}

export interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  breadcrumb?: BreadcrumbItem[];
  showBack?: boolean;
  extra?: React.ReactNode;
  loading?: boolean;
  ghost?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  breadcrumb = [],
  showBack = false,
  extra,
  loading = false,
  ghost = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate(-1);
  };

  const renderBreadcrumb = () => {
    if (breadcrumb.length === 0) return null;

    const items = breadcrumb.map((item) => ({
      title: item.path ? (
        <a onClick={() => navigate(item.path!)}>{item.title}</a>
      ) : (
        item.title
      ),
    }));

    return <Breadcrumb items={items} style={{ marginBottom: 16 }} />;
  };

  const renderHeader = () => {
    if (!title && !showBack && !extra) return null;

    return (
      <>
        {showBack && (
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{ marginRight: 8 }}
          >
            {t("common.back")}
          </Button>
        )}
        {title && (
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{title}</h2>
        )}
        {extra && <Space>{extra}</Space>}
        <Divider style={{ margin: "16px 0" }} />
      </>
    );
  };

  const content = (
    <>
      {renderBreadcrumb()}
      {renderHeader()}
      {children}
    </>
  );

  if (ghost) {
    return <div style={{ padding: 24 }}>{content}</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <Card loading={loading}>{content}</Card>
    </div>
  );
};

export default PageContainer;
