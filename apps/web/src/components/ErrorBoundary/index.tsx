import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result, Typography } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Paragraph, Text } = Typography;

/** 错误边界文案配置 */
export interface ErrorBoundaryTexts {
  title?: string;
  subTitle?: string;
  reloadButton?: string;
  homeButton?: string;
  errorLabel?: string;
}

/** 默认文案 */
const defaultTexts: Required<ErrorBoundaryTexts> = {
  title: '页面出错了',
  subTitle: '抱歉，页面发生了一些错误。您可以尝试刷新页面或返回首页。',
  reloadButton: '刷新页面',
  homeButton: '返回首页',
  errorLabel: '错误信息（仅开发环境显示）:',
};

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** 自定义文案，支持国际化 */
  texts?: ErrorBoundaryTexts;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryInner extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // 调用外部错误处理回调
    this.props.onError?.(error, errorInfo);

    // 在开发环境打印错误信息
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, texts } = this.props;

    // 合并默认文案和自定义文案
    const mergedTexts = { ...defaultTexts, ...texts };

    if (hasError) {
      // 如果提供了自定义 fallback，使用它
      if (fallback) {
        return fallback;
      }

      // 默认错误 UI
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '24px',
            background: '#f5f5f5',
          }}
        >
          <Result
            status="error"
            title={mergedTexts.title}
            subTitle={mergedTexts.subTitle}
            extra={[
              <Button
                key="reload"
                type="primary"
                icon={<ReloadOutlined />}
                onClick={this.handleReload}
              >
                {mergedTexts.reloadButton}
              </Button>,
              <Button
                key="home"
                icon={<HomeOutlined />}
                onClick={this.handleGoHome}
              >
                {mergedTexts.homeButton}
              </Button>,
            ]}
          >
            {import.meta.env.DEV && error && (
              <div style={{ textAlign: 'left', marginTop: 24 }}>
                <Paragraph>
                  <Text strong style={{ fontSize: 16 }}>
                    {mergedTexts.errorLabel}
                  </Text>
                </Paragraph>
                <Paragraph>
                  <Text type="danger" code>
                    {error.name}: {error.message}
                  </Text>
                </Paragraph>
                {errorInfo && (
                  <Paragraph>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <pre
                        style={{
                          maxHeight: 200,
                          overflow: 'auto',
                          background: '#fafafa',
                          padding: 12,
                          borderRadius: 4,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                        }}
                      >
                        {errorInfo.componentStack}
                      </pre>
                    </Text>
                  </Paragraph>
                )}
              </div>
            )}
          </Result>
        </div>
      );
    }

    return children;
  }
}

/** 带国际化支持的 ErrorBoundary 包装组件 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback, onError }) => {
  const { t } = useTranslation();

  const texts: ErrorBoundaryTexts = {
    title: t('errorBoundary.title'),
    subTitle: t('errorBoundary.subTitle'),
    reloadButton: t('errorBoundary.reloadButton'),
    homeButton: t('errorBoundary.homeButton'),
    errorLabel: t('errorBoundary.errorLabel'),
  };

  return (
    <ErrorBoundaryInner texts={texts} fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundaryInner>
  );
};

export default ErrorBoundary;
