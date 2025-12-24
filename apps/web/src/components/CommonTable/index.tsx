import React from 'react';
import { Table, TableProps, Card, Space, Button, Tooltip } from 'antd';
import { ReloadOutlined, ColumnHeightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export interface CommonTableProps<T = any> extends Omit<TableProps<T>, 'title'> {
  title?: string;
  showRefresh?: boolean;
  showSizeChanger?: boolean;
  onRefresh?: () => void;
  toolbarRender?: () => React.ReactNode;
  headerTitle?: React.ReactNode;
}

const CommonTable: React.FC<CommonTableProps> = ({
  title,
  showRefresh = true,
  showSizeChanger = true,
  onRefresh,
  toolbarRender,
  headerTitle,
  pagination = {},
  ...tableProps
}) => {
  const { t } = useTranslation();

  const defaultPagination = {
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      t('common.total', { count: total }),
    pageSizeOptions: ['10', '20', '50', '100'],
    ...pagination,
  };

  const renderToolbar = () => {
    if (!showRefresh && !showSizeChanger && !toolbarRender) {
      return null;
    }

    return (
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>{headerTitle}</div>
        <Space>
          {toolbarRender && toolbarRender()}
          {showRefresh && (
            <Tooltip title={t('common.refresh')}>
              <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
              />
            </Tooltip>
          )}
          {showSizeChanger && (
            <Tooltip title={t('common.density')}>
              <Button icon={<ColumnHeightOutlined />} />
            </Tooltip>
          )}
        </Space>
      </div>
    );
  };

  const tableContent = (
    <>
      {renderToolbar()}
      <Table
        {...tableProps}
        pagination={defaultPagination}
        scroll={{ x: 'max-content' }}
        size="middle"
      />
    </>
  );

  if (title) {
    return (
      <Card title={title}>
        {tableContent}
      </Card>
    );
  }

  return tableContent;
};

export default CommonTable;