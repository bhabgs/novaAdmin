import React, { useState } from "react";
import {
  Modal,
  Upload,
  Button,
  message,
  Alert,
  Space,
  Checkbox,
  Typography,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { useTranslation } from "react-i18next";
import { post } from "@/utils/request";

const { Dragger } = Upload;
const { Text } = Typography;

interface I18nImportModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ module: string; key: string; error: string }>;
}

const I18nImportModal: React.FC<I18nImportModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [importDataFile, setImportDataFile] = useState<UploadFile | null>(null);
  const [modulesFile, setModulesFile] = useState<UploadFile | null>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleImportDataChange: UploadProps["onChange"] = (info) => {
    const file = info.fileList[0] || null;
    setImportDataFile(file);
  };

  const handleModulesChange: UploadProps["onChange"] = (info) => {
    const file = info.fileList[0] || null;
    setModulesFile(file);
  };

  // 读取 JSON 文件内容
  const readFileContent = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          resolve(content);
        } catch (error) {
          reject(new Error("文件格式错误，请上传有效的 JSON 文件"));
        }
      };
      reader.onerror = () => reject(new Error("文件读取失败"));
      reader.readAsText(file);
    });
  };

  const handleImport = async () => {
    if (!importDataFile || !importDataFile.originFileObj) {
      message.error("请选择导入数据文件");
      return;
    }

    setLoading(true);
    setImportResult(null);

    try {
      // 读取导入数据文件
      const items = await readFileContent(importDataFile.originFileObj);

      // 读取模块文件（如果提供）
      let modules = undefined;
      if (modulesFile && modulesFile.originFileObj) {
        modules = await readFileContent(modulesFile.originFileObj);
      }

      // 调用导入接口
      const response = await post<{
        success: boolean;
        data: ImportResult;
      }>("/nova-admin-api/i18n/import", {
        items,
        modules,
        overwrite,
      });

      if (response.success && response.data) {
        const result = response.data;
        setImportResult(result);
        message.success("导入完成");

        // 如果有成功导入的数据，触发刷新
        if (result.created > 0 || result.updated > 0) {
          onSuccess();
        }
      } else {
        message.error(response.message || "导入失败");
      }
    } catch (error) {
      console.error("Import error:", error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("导入失败，请检查文件格式和网络连接");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setImportDataFile(null);
    setModulesFile(null);
    setOverwrite(false);
    setImportResult(null);
    onCancel();
  };

  // 自定义上传组件（只选择文件，不实际上传）
  const uploadProps: UploadProps = {
    accept: ".json",
    beforeUpload: () => {
      // 阻止默认上传行为
      return false;
    },
    maxCount: 1,
    showUploadList: {
      showPreviewIcon: false,
      showRemoveIcon: true,
    },
  };

  return (
    <Modal
      title={t("i18n.importTitle") || "导入国际化配置"}
      open={visible}
      onCancel={handleCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t("common.cancel")}
        </Button>,
        <Button
          key="import"
          type="primary"
          loading={loading}
          onClick={handleImport}
          disabled={!importDataFile}
        >
          {t("i18n.import") || "导入"}
        </Button>,
      ]}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Alert
          message={t("i18n.importTip") || "导入说明"}
          description={
            t("i18n.importTipDescription") ||
            "请上传导入数据文件（import-data.json），可选择上传模块文件（modules.json）。"
          }
          type="info"
          showIcon
        />

        <div>
          <Text strong>{t("i18n.importDataFile") || "导入数据文件"}</Text>
          <Text type="secondary"> ({t("i18n.required") || "必填"})</Text>
          <Dragger
            {...uploadProps}
            onChange={handleImportDataChange}
            fileList={importDataFile ? [importDataFile] : []}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              {t("i18n.clickOrDragFile") || "点击或拖拽文件到此区域上传"}
            </p>
            <p className="ant-upload-hint">
              {t("i18n.supportJsonFormat") || "支持 JSON 格式文件"}
            </p>
          </Dragger>
        </div>

        <div>
          <Text strong>{t("i18n.modulesFile") || "模块文件"}</Text>
          <Text type="secondary"> ({t("i18n.optional") || "可选"})</Text>
          <Dragger
            {...uploadProps}
            onChange={handleModulesChange}
            fileList={modulesFile ? [modulesFile] : []}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              {t("i18n.clickOrDragFile") || "点击或拖拽文件到此区域上传"}
            </p>
            <p className="ant-upload-hint">
              {t("i18n.supportJsonFormat") || "支持 JSON 格式文件"}
            </p>
          </Dragger>
        </div>

        <Checkbox
          checked={overwrite}
          onChange={(e) => setOverwrite(e.target.checked)}
        >
          {t("i18n.overwriteExisting") || "覆盖已存在的数据"}
        </Checkbox>

        {importResult && (
          <Alert
            message={t("i18n.importResult") || "导入结果"}
            description={
              <Space direction="vertical" size="small">
                <div>
                  {t("i18n.created") || "创建"}:{" "}
                  <Text strong>{importResult.created}</Text>
                </div>
                <div>
                  {t("i18n.updated") || "更新"}:{" "}
                  <Text strong>{importResult.updated}</Text>
                </div>
                <div>
                  {t("i18n.skipped") || "跳过"}:{" "}
                  <Text strong>{importResult.skipped}</Text>
                </div>
                {importResult.errors.length > 0 && (
                  <div>
                    {t("i18n.errors") || "错误"}:{" "}
                    <Text type="danger">{importResult.errors.length}</Text>
                    <ul style={{ marginTop: 8, marginBottom: 0 }}>
                      {importResult.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>
                          {error.module}.{error.key}: {error.error}
                        </li>
                      ))}
                      {importResult.errors.length > 5 && <li>...</li>}
                    </ul>
                  </div>
                )}
              </Space>
            }
            type={importResult.errors.length > 0 ? "warning" : "success"}
            showIcon
          />
        )}
      </Space>
    </Modal>
  );
};

export default I18nImportModal;
