import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  Input,
  Row,
  Col,
  Space,
  Typography,
  message,
  Segmented,
  Tooltip,
  Empty,
  Spin,
} from "antd";
import { CopyOutlined } from "@ant-design/icons";
import * as AntdIcons from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import PageContainer from "@/components/PageContainer";

const { Search } = Input;
const { Text, Title } = Typography;

// 过滤掉非图标组件
const EXCLUDED_ICONS = [
  "createFromIconfontCN",
  "default",
  "getTwoToneColor",
  "setTwoToneColor",
];

interface IconItem {
  name: string;
  component: React.ComponentType;
}

const IconList: React.FC = () => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [iconType, setIconType] = useState<"antd" | "iconfont">("antd");
  const [loading, setLoading] = useState(true);

  // 获取所有 Ant Design 图标
  const antdIcons = useMemo<IconItem[]>(() => {
    return Object.keys(AntdIcons)
      .filter(
        (key) =>
          !EXCLUDED_ICONS.includes(key) &&
          key !== key.toLowerCase() &&
          typeof (AntdIcons as any)[key] === "object"
      )
      .map((name) => ({
        name,
        component: (AntdIcons as any)[name],
      }));
  }, []);

  // 模拟加载完成
  useEffect(() => {
    // 使用 setTimeout 让图标处理完成后再显示
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 过滤图标
  const filteredIcons = useMemo(() => {
    if (!searchText) return antdIcons;
    const lowerSearch = searchText.toLowerCase();
    return antdIcons.filter((icon) =>
      icon.name.toLowerCase().includes(lowerSearch)
    );
  }, [antdIcons, searchText]);

  // 复制图标名称
  const handleCopy = (iconName: string) => {
    navigator.clipboard
      .writeText(iconName)
      .then(() => {
        message.success(t("common.copySuccess", { text: iconName }));
      })
      .catch(() => {
        message.error(t("common.copyError"));
      });
  };

  // 渲染图标卡片
  const renderIconCard = (icon: IconItem) => {
    const IconComponent = icon.component;

    return (
      <Col xs={12} sm={8} md={6} lg={4} xl={3} key={icon.name}>
        <Card
          hoverable
          size="small"
          style={{
            textAlign: "center",
            cursor: "pointer",
          }}
          onClick={() => handleCopy(icon.name)}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <IconComponent
              style={{
                fontSize: 32,
                color: "#1890ff",
              }}
            />
            <Tooltip title={t("common.clickToCopy")}>
              <Text
                style={{
                  fontSize: 12,
                  display: "block",
                  wordBreak: "break-word",
                }}
                ellipsis
              >
                {icon.name}
              </Text>
            </Tooltip>
          </Space>
        </Card>
      </Col>
    );
  };

  // 渲染 Iconfont 占位
  const renderIconfontPlaceholder = () => {
    return (
      <Card>
        <Empty
          description={
            <Space direction="vertical" size="large">
              <Title level={4}>Iconfont 支持即将推出</Title>
              <Text type="secondary">
                您可以配置自定义 Iconfont 项目 URL，加载自定义图标库
              </Text>
            </Space>
          }
        />
      </Card>
    );
  };

  // 加载中状态
  if (loading) {
    return (
      <PageContainer title={t("icons.title")} ghost>
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <Spin size="large" tip="加载图标中..." />
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={t("icons.title")} ghost>
      <Card>
        {/* 搜索栏和类型切换 */}
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%", marginBottom: 24 }}
        >
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Search
                placeholder={t("icons.searchPlaceholder")}
                allowClear
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<CopyOutlined />}
              />
            </Col>
            <Col>
              <Segmented
                value={iconType}
                onChange={(value) => setIconType(value as "antd" | "iconfont")}
                options={[
                  {
                    label: "Ant Design Icons",
                    value: "antd",
                  },
                  {
                    label: "Iconfont (即将推出)",
                    value: "iconfont",
                    disabled: true,
                  },
                ]}
              />
            </Col>
          </Row>

          {/* 统计信息 */}
          <Space size="large">
            <Text type="secondary">
              {t("icons.total")}: <Text strong>{antdIcons.length}</Text>
            </Text>
            {searchText && (
              <Text type="secondary">
                {t("icons.filtered")}: <Text strong>{filteredIcons.length}</Text>
              </Text>
            )}
          </Space>
        </Space>

        {/* 图标网格 */}
        {iconType === "antd" ? (
          filteredIcons.length > 0 ? (
            <Row gutter={[16, 16]}>{filteredIcons.map(renderIconCard)}</Row>
          ) : (
            <Empty description={t("icons.noResults")} />
          )
        ) : (
          renderIconfontPlaceholder()
        )}
      </Card>
    </PageContainer>
  );
};

export default IconList;
