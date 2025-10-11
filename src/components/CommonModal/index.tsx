import React from 'react';
import { Modal, ModalProps, Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';

export interface CommonModalProps extends Omit<ModalProps, 'footer'> {
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  showFooter?: boolean;
  footerRender?: () => React.ReactNode;
  loading?: boolean;
  okButtonProps?: any;
  cancelButtonProps?: any;
}

const CommonModal: React.FC<CommonModalProps> = ({
  children,
  onOk,
  onCancel,
  okText,
  cancelText,
  showFooter = true,
  footerRender,
  loading = false,
  okButtonProps = {},
  cancelButtonProps = {},
  ...modalProps
}) => {
  const { t } = useTranslation();

  const handleOk = async () => {
    if (onOk) {
      try {
        await onOk();
      } catch (error) {
        console.error('Modal onOk error:', error);
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const renderFooter = () => {
    if (!showFooter) {
      return null;
    }

    if (footerRender) {
      return footerRender();
    }

    return (
      <Space>
        <Button
          onClick={handleCancel}
          {...cancelButtonProps}
        >
          {cancelText || t('common.cancel')}
        </Button>
        <Button
          type="primary"
          loading={loading}
          onClick={handleOk}
          {...okButtonProps}
        >
          {okText || t('common.confirm')}
        </Button>
      </Space>
    );
  };

  return (
    <Modal
      {...modalProps}
      onCancel={handleCancel}
      footer={renderFooter()}
      destroyOnClose
    >
      {children}
    </Modal>
  );
};

export default CommonModal;