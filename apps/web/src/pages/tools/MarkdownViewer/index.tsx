import React, { useState } from "react";
import { Card, Input, Button, Space, Select, Upload, message } from "antd";
import {
  FileTextOutlined,
  UploadOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import MarkdownViewer from "@/components/MarkdownViewer";
import type { UploadFile } from "antd/es/upload/interface";
import { PageContainer } from "@/components";
import { t } from "i18next";

const { TextArea } = Input;

const MarkdownViewerPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<"url" | "content" | "upload">("url");
  const [url, setUrl] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [displayUrl, setDisplayUrl] = useState<string>("");
  const [displayContent, setDisplayContent] = useState<string>("");

  // 预设的示例 Markdown 文件
  const presetFiles = [
    { label: "README.md", value: "/README.md" },
    { label: "GARFISH_INTEGRATION.md", value: "/GARFISH_INTEGRATION.md" },
    { label: "VERIFICATION_GUIDE.md", value: "/VERIFICATION_GUIDE.md" },
  ];

  const handleLoadUrl = () => {
    if (!url) {
      message.warning("请输入 Markdown 文件 URL");
      return;
    }
    setDisplayUrl(url);
    setDisplayContent("");
  };

  const handleLoadContent = () => {
    if (!content) {
      message.warning("请输入 Markdown 内容");
      return;
    }
    setDisplayContent(content);
    setDisplayUrl("");
  };

  const handleFileUpload = (file: UploadFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setContent(text);
      setDisplayContent(text);
      setDisplayUrl("");
      message.success("文件上传成功");
    };
    reader.readAsText(file as any);
    return false; // 阻止默认上传行为
  };

  const handlePresetSelect = (value: string) => {
    setUrl(value);
  };

  return (
    <PageContainer title={t("menu.markdownViewer")} ghost>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {/* 查看模式选择 */}
        <div>
          <div className="mb-2 font-medium">选择查看方式：</div>
          <Space>
            <Button
              type={viewMode === "url" ? "primary" : "default"}
              icon={<LinkOutlined />}
              onClick={() => setViewMode("url")}
            >
              通过 URL
            </Button>
            <Button
              type={viewMode === "content" ? "primary" : "default"}
              icon={<FileTextOutlined />}
              onClick={() => setViewMode("content")}
            >
              直接输入
            </Button>
            <Button
              type={viewMode === "upload" ? "primary" : "default"}
              icon={<UploadOutlined />}
              onClick={() => setViewMode("upload")}
            >
              上传文件
            </Button>
          </Space>
        </div>

        {/* URL 输入模式 */}
        {viewMode === "url" && (
          <div>
            <div className="mb-2 font-medium">Markdown 文件 URL：</div>
            <Space.Compact style={{ width: "100%" }}>
              <Select
                placeholder="选择预设文件"
                style={{ width: 200 }}
                onChange={handlePresetSelect}
                options={presetFiles}
              />
              <Input
                placeholder="输入 Markdown 文件的 URL 或路径"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onPressEnter={handleLoadUrl}
              />
              <Button type="primary" onClick={handleLoadUrl}>
                加载
              </Button>
            </Space.Compact>
          </div>
        )}

        {/* 直接输入模式 */}
        {viewMode === "content" && (
          <div>
            <div className="mb-2 font-medium">Markdown 内容：</div>
            <TextArea
              rows={6}
              placeholder="在此输入 Markdown 内容"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button type="primary" onClick={handleLoadContent} className="mt-2">
              预览
            </Button>
          </div>
        )}

        {/* 上传文件模式 */}
        {viewMode === "upload" && (
          <div>
            <div className="mb-2 font-medium">上传 Markdown 文件：</div>
            <Upload
              accept=".md,.markdown"
              beforeUpload={handleFileUpload}
              maxCount={1}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </div>
        )}
      </Space>

      {/* Markdown 预览区域 */}
      {(displayUrl || displayContent) && (
        <Card title="预览">
          <MarkdownViewer url={displayUrl} content={displayContent} />
        </Card>
      )}
    </PageContainer>
  );
};

export default MarkdownViewerPage;
