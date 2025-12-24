import React from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Switch,
  Select,
  Space,
  message,
} from "antd";
import { GlobalOutlined, LayoutOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateSettings } from "@/store/slices/settingsSlice";
import ThemeSettings from "@/components/ThemeSettings";
import PageContainer from "@/components/PageContainer";

const { Title, Text } = Typography;
const { Option } = Select;

const SystemSettings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { language, layout } = useAppSelector((state) => state.settings);
  const sidebarCollapsed = layout?.sidebarCollapsed || false;

  // 语言切换
  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    dispatch(updateSettings({ language: value }));
    message.success(t("settings.languageUpdateSuccess"));
  };

  // 侧边栏切换
  const handleSidebarChange = (checked: boolean) => {
    dispatch(updateSettings({ sidebarCollapsed: !checked }));
    message.success(t("settings.layoutUpdateSuccess"));
  };

  return (
    <PageContainer title={t("settings.systemSettings")} ghost>
      <Row gutter={[24, 24]}>
        {/* 主题设置 */}
        <Col span={24}>
          <ThemeSettings />
        </Col>

        {/* 语言设置 */}
        <Col span={24}>
          <Card variant="borderless">
            <Title level={4}>
              <GlobalOutlined style={{ marginRight: 8 }} />
              {t("settings.language")}
            </Title>
            <Row align="middle" justify="space-between">
              <Col>
                <Space direction="vertical" size={0}>
                  <Text strong>{t("settings.languageMode")}</Text>
                  <Text type="secondary">
                    {t("settings.languageDescription")}
                  </Text>
                </Space>
              </Col>
              <Col>
                <Select
                  value={language}
                  onChange={handleLanguageChange}
                  style={{ width: 120 }}
                >
                  <Option value="zh-CN">{t("settings.chinese")}</Option>
                  <Option value="en-US">{t("settings.english")}</Option>
                  <Option value="ar-SA">{t("settings.arabic")}</Option>
                </Select>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 布局设置 */}
        <Col span={24}>
          <Card variant="borderless">
            <Title level={4}>
              <LayoutOutlined style={{ marginRight: 8 }} />
              {t("settings.layout")}
            </Title>
            <Row align="middle" justify="space-between">
              <Col>
                <Space direction="vertical" size={0}>
                  <Text strong>{t("settings.sidebarMode")}</Text>
                  <Text type="secondary">
                    {t("settings.sidebarDescription")}
                  </Text>
                </Space>
              </Col>
              <Col>
                <Switch
                  checked={!sidebarCollapsed}
                  onChange={handleSidebarChange}
                  checkedChildren={t("settings.sidebarExpanded")}
                  unCheckedChildren={t("settings.sidebarCollapsed")}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default SystemSettings;
