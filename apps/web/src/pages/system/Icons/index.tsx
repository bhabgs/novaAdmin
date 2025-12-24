import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
  Button,
} from "antd";
import { CopyOutlined, DownOutlined } from "@ant-design/icons";
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

// 每次加载的图标数量
const ICONS_PER_PAGE = 100;

interface IconItem {
  name: string;
  component: React.ComponentType<{ style?: React.CSSProperties }>;
}

// 图标卡片组件 - 使用 React.memo 优化性能
interface IconCardProps {
  icon: IconItem;
  onCopy: (iconName: string) => void;
  t: (key: string) => string;
}

const IconCard: React.FC<IconCardProps> = React.memo(({ icon, onCopy, t }) => {
  const IconComponent = icon.component;

  return (
    <Card
      hoverable
      size="small"
      style={{
        textAlign: "center",
        cursor: "pointer",
        height: "100%",
      }}
      onClick={() => onCopy(icon.name)}
      bodyStyle={{
        padding: "16px 8px",
      }}
    >
      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        {React.createElement(IconComponent, {
          style: {
            fontSize: 32,
            color: "#1890ff",
          },
        })}
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
  );
});

IconCard.displayName = "IconCard";

// 防抖 hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const IconList: React.FC = () => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 300); // 300ms 防抖
  const [iconType, setIconType] = useState<"antd" | "iconfont">("antd");
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(ICONS_PER_PAGE);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 获取所有 Ant Design 图标
  const antdIcons = useMemo<IconItem[]>(() => {
    return Object.keys(AntdIcons)
      .filter(
        (key) =>
          !EXCLUDED_ICONS.includes(key) &&
          key !== key.toLowerCase() &&
          typeof (AntdIcons as unknown as Record<string, React.ComponentType>)[
            key
          ] === "object"
      )
      .map((name) => ({
        name,
        component: (
          AntdIcons as unknown as Record<
            string,
            React.ComponentType<{ style?: React.CSSProperties }>
          >
        )[name],
      }));
  }, []);

  // 模拟加载完成
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 过滤图标 - 使用防抖后的搜索文本
  const filteredIcons = useMemo(() => {
    if (!debouncedSearchText) return antdIcons;
    const lowerSearch = debouncedSearchText.toLowerCase();
    return antdIcons.filter((icon) =>
      icon.name.toLowerCase().includes(lowerSearch)
    );
  }, [antdIcons, debouncedSearchText]);

  // 只渲染前 N 个图标
  const visibleIcons = useMemo(() => {
    return filteredIcons.slice(0, displayCount);
  }, [filteredIcons, displayCount]);

  // 重置显示数量当搜索文本改变时
  useEffect(() => {
    setDisplayCount(ICONS_PER_PAGE);
  }, [debouncedSearchText]);

  // 加载更多
  const loadMore = useCallback(() => {
    setDisplayCount((prev) => Math.min(prev + ICONS_PER_PAGE, filteredIcons.length));
  }, [filteredIcons.length]);

  // 设置 IntersectionObserver 实现自动加载
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleIcons.length < filteredIcons.length) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, visibleIcons.length, filteredIcons.length]);

  // 复制图标名称 - 使用 useCallback 优化
  const handleCopy = useCallback(
    (iconName: string) => {
      navigator.clipboard
        .writeText(iconName)
        .then(() => {
          message.success(t("common.copySuccess", { text: iconName }));
        })
        .catch(() => {
          message.error(t("common.copyError"));
        });
    },
    [t]
  );

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
          <Spin spinning={true} size="large" tip="加载图标中...">
            <div style={{ minHeight: "400px" }} />
          </Spin>
        </Card>
      </PageContainer>
    );
  }

  const hasMore = visibleIcons.length < filteredIcons.length;

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
            {debouncedSearchText && (
              <Text type="secondary">
                {t("icons.filtered")}:{" "}
                <Text strong>{filteredIcons.length}</Text>
              </Text>
            )}
            {visibleIcons.length < filteredIcons.length && (
              <Text type="secondary">
                显示: <Text strong>{visibleIcons.length}</Text> / {filteredIcons.length}
              </Text>
            )}
          </Space>
        </Space>

        {/* 图标网格 - 使用 CSS Grid 优化性能，自动响应式 */}
        {iconType === "antd" ? (
          filteredIcons.length > 0 ? (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: "16px",
                  marginBottom: hasMore ? "24px" : 0,
                }}
              >
                {visibleIcons.map((icon) => (
                  <IconCard
                    key={icon.name}
                    icon={icon}
                    onCopy={handleCopy}
                    t={t}
                  />
                ))}
              </div>

              {/* 加载更多触发器 */}
              {hasMore && (
                <div
                  ref={loadMoreRef}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "24px 0",
                  }}
                >
                  <Button
                    type="primary"
                    icon={<DownOutlined />}
                    onClick={loadMore}
                    size="large"
                  >
                    加载更多 ({filteredIcons.length - visibleIcons.length} 个图标)
                  </Button>
                </div>
              )}
            </>
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
