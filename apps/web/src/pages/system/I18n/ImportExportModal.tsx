import React, { useState } from 'react';
import { Modal, Tabs, Button, Upload, Select, Space, message, Spin } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { UploadFile } from 'antd/es/upload/interface';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  importI18nTranslations,
  exportI18nTranslations,
} from '@/store/slices/i18nSlice';
import { Language } from '@/types/i18n';

interface ImportExportModalProps {
  visible: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

const ImportExportModal: React.FC<ImportExportModalProps> = ({
  visible,
  onClose,
  onImportSuccess,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('zh-CN');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [overwrite, setOverwrite] = useState(false);

  const { loading } = useAppSelector(state => state.i18n);

  // Handle file import
  const handleImport = async () => {
    if (fileList.length === 0) {
      message.warning(t('i18n.selectFile') || 'Please select a file');
      return;
    }

    setImportLoading(true);
    try {
      const file = fileList[0];
      const text = await file.originFileObj?.text();

      if (!text) {
        message.error(t('i18n.fileReadError') || 'Failed to read file');
        return;
      }

      const data = JSON.parse(text);

      await dispatch(
        importI18nTranslations({
          language: selectedLanguage,
          data,
          overwrite,
        }),
      ).unwrap();

      message.success(t('i18n.importSuccess') || 'Import successful');
      setFileList([]);
      onImportSuccess?.();
      onClose();
    } catch (error: any) {
      message.error(error.message || (t('i18n.importError') || 'Import failed'));
    } finally {
      setImportLoading(false);
    }
  };

  // Handle file export
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const result = await dispatch(exportI18nTranslations(selectedLanguage)).unwrap();

      // Create blob and download
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      element.href = URL.createObjectURL(file);
      element.download = `i18n-${selectedLanguage}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      message.success(t('i18n.exportSuccess') || 'Export successful');
    } catch (error: any) {
      message.error(error.message || (t('i18n.exportError') || 'Export failed'));
    } finally {
      setExportLoading(false);
    }
  };

  const importTab = (
    <Spin spinning={importLoading || loading}>
      <div style={{ padding: '20px 0' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              {t('i18n.selectLanguage')}:
            </label>
            <Select
              style={{ width: '100%' }}
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              options={[
                { label: '中文 (Chinese)', value: 'zh-CN' as Language },
                { label: 'English', value: 'en-US' as Language },
                { label: 'العربية (Arabic)', value: 'ar-SA' as Language },
              ]}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              {t('i18n.importFile')}:
            </label>
            <Upload
              accept=".json"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              maxCount={1}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>
                {t('i18n.selectJsonFile') || 'Select JSON File'}
              </Button>
            </Upload>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              {t('i18n.importMode')}:
            </label>
            <Select
              value={overwrite ? 'overwrite' : 'merge'}
              onChange={value => setOverwrite(value === 'overwrite')}
              options={[
                {
                  label: t('i18n.mergeModeLabel') || 'Merge (Keep existing values)',
                  value: 'merge',
                },
                {
                  label: t('i18n.overwriteModeLabel') || 'Overwrite (Replace all)',
                  value: 'overwrite',
                },
              ]}
            />
          </div>

          <div style={{ color: '#666', fontSize: '12px' }}>
            {t('i18n.importNote') || 'Note: The JSON file should have a nested structure like { "module": { "key": "value" } }'}
          </div>

          <Button
            type="primary"
            block
            onClick={handleImport}
            loading={importLoading}
            disabled={fileList.length === 0}
          >
            {t('i18n.startImport') || 'Import'}
          </Button>
        </Space>
      </div>
    </Spin>
  );

  const exportTab = (
    <Spin spinning={exportLoading || loading}>
      <div style={{ padding: '20px 0' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              {t('i18n.selectLanguage')}:
            </label>
            <Select
              style={{ width: '100%' }}
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              options={[
                { label: '中文 (Chinese)', value: 'zh-CN' as Language },
                { label: 'English', value: 'en-US' as Language },
                { label: 'العربية (Arabic)', value: 'ar-SA' as Language },
              ]}
            />
          </div>

          <div style={{ color: '#666', fontSize: '12px' }}>
            {t('i18n.exportNote') || 'Click the button below to export translations as a JSON file'}
          </div>

          <Button
            type="primary"
            block
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={exportLoading}
          >
            {t('i18n.startExport') || 'Export JSON'}
          </Button>
        </Space>
      </div>
    </Spin>
  );

  return (
    <Modal
      title={t('i18n.importExport') || 'Import/Export Translations'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <Tabs
        items={[
          {
            key: 'import',
            label: t('i18n.import') || 'Import',
            children: importTab,
          },
          {
            key: 'export',
            label: t('i18n.export') || 'Export',
            children: exportTab,
          },
        ]}
      />
    </Modal>
  );
};

export default ImportExportModal;
