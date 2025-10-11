import React from "react";
import { Card, Button, Space } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components";

const IframeDemo: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const demoLinks = [
    {
      title: "Ant Design 官网",
      url: "https://ant.design/",
    },
    {
      title: "React 文档",
      url: "https://react.dev/",
    },
    {
      title: "TypeScript 文档",
      url: "https://www.typescriptlang.org/",
    },
    {
      title: "Vite 文档",
      url: "https://vitejs.dev/",
    },
  ];

  const handleOpenIframe = (title: string, url: string) => {
    // 使用 navigate 跳转到 iframe 页面，并传递参数
    navigate(
      `/iframe-view?url=${encodeURIComponent(url)}&title=${encodeURIComponent(
        title
      )}`
    );
  };

  return (
    <PageContainer title={t("menu.iframeViewer")} ghost>
      <Card bordered={false}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <h3>示例网站</h3>
            <p>以下是一些示例网站，您可以在 iframe 中打开它们：</p>
          </div>

          <Space wrap>
            {demoLinks.map((link) => (
              <Button
                key={link.url}
                type="primary"
                icon={<LinkOutlined />}
                onClick={() => handleOpenIframe(link.title, link.url)}
              >
                打开 {link.title}
              </Button>
            ))}
          </Space>

          <div style={{ marginTop: 24 }}>
            <h3>自定义 URL</h3>
            <p>您也可以通过编程方式打开任意 URL：</p>
            <pre
              style={{ background: "#f5f5f5", padding: 16, borderRadius: 4 }}
            >
              {`import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
const url = 'https://example.com';
const title = '示例网站';

navigate(\`/iframe-view?url=\${encodeURIComponent(url)}&title=\${encodeURIComponent(title)}\`);`}
            </pre>
          </div>
        </Space>
      </Card>
    </PageContainer>
  );
};

export default IframeDemo;
