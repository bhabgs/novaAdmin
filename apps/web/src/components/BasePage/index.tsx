import React from 'react';
import { Card, Space, Button, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export interface BasePageProps {
  /** 页面标题 */
  title?: string;
  /** 右侧操作区域 */
  extra?: React.ReactNode;
  /** 是否显示返回按钮 */
  showBack?: boolean;
  /** 自定义返回路径，不设置则使用 navigate(-1) */
  backPath?: string;
  /** 页面内容 */
  children: React.ReactNode;
  /** 是否加载中 */
  loading?: boolean;
  /** 是否使用卡片包裹内容，默认 true */
  useCard?: boolean;
  /** 卡片样式 */
  cardStyle?: React.CSSProperties;
  /** 容器样式 */
  style?: React.CSSProperties;
  /** 标题左侧额外内容 */
  titleExtra?: React.ReactNode;
}

/**
 * 基础页面组件
 *
 * 提供统一的页面布局：标题 + 操作按钮 + 内容区域
 *
 * 使用示例:
 * ```tsx
 * <BasePage
 *   title="代码预览"
 *   showBack
 *   extra={
 *     <Space>
 *       <Button type="primary">生成代码</Button>
 *       <Button>下载</Button>
 *     </Space>
 *   }
 * >
 *   <div>页面内容</div>
 * </BasePage>
 * ```
 */
const BasePage: React.FC<BasePageProps> = ({
  title,
  extra,
  showBack = false,
  backPath,
  children,
  loading = false,
  useCard = true,
  cardStyle,
  style,
  titleExtra,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const renderHeader = () => {
    if (!title && !showBack && !extra && !titleExtra) return null;

    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            {showBack && (
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
              >
                {t('common.back')}
              </Button>
            )}
            {title && (
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{title}</h2>
            )}
            {titleExtra}
          </Space>
          {extra && <Space>{extra}</Space>}
        </div>
        <Divider style={{ margin: '16px 0' }} />
      </>
    );
  };

  const content = (
    <>
      {renderHeader()}
      {children}
    </>
  );

  if (!useCard) {
    return (
      <div style={{ padding: 24, ...style }}>
        {content}
      </div>
    );
  }

  return (
    <div style={{ padding: 24, ...style }}>
      <Card loading={loading} style={cardStyle}>
        {content}
      </Card>
    </div>
  );
};

export default BasePage;
