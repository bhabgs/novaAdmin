import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  TreeSelect,
  Switch,
  message,
  Row,
  Col,
  Space,
  Button
} from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  AppstoreOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import { createMenu, updateMenu } from '@/store/slices/menuSlice';
import { fetchI18nTranslations } from '@/store/slices/i18nSlice';
import type { Menu, MenuFormData } from '@/types/menu';
import { buildMenuTree } from '@/utils/menuUtils';
import { MENU_ICONS } from '@/constants/icons';

const { Option } = Select;
const { TextArea } = Input;

interface MenuFormProps {
  visible: boolean;
  menu?: Menu | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const MenuForm: React.FC<MenuFormProps> = ({
  visible,
  menu,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { menus, loading } = useAppSelector((state) => state.menu);
  const { translations } = useAppSelector((state) => state.i18n);
  const [i18nKeysLoading, setI18nKeysLoading] = useState(false);

  const isEditing = !!menu;

  // 加载 i18n 翻译列表
  useEffect(() => {
    if (visible) {
      const loadI18nKeys = async () => {
        setI18nKeysLoading(true);
        try {
          // 获取所有翻译数据（使用较大的 pageSize 获取所有数据）
          await dispatch(
            fetchI18nTranslations({
              page: 1,
              pageSize: 10000,
            })
          ).unwrap();
        } catch (error) {
          console.error('Failed to load i18n keys:', error);
        } finally {
          setI18nKeysLoading(false);
        }
      };
      loadI18nKeys();
    }
  }, [visible, dispatch]);

  // 生成 i18n 键名选项（label 显示中文翻译，value 为 module.key 格式）
  const i18nKeyOptions = useMemo(() => {
    const keyMap = new Map<string, string>(); // key -> zhCN 映射
    
    translations.forEach((translation) => {
      const key = `${translation.module}.${translation.key}`;
      // 如果还没有这个 key，或者当前翻译有中文内容，则更新
      if (!keyMap.has(key) || translation.zhCN) {
        keyMap.set(key, translation.zhCN || key);
      }
    });
    
    return Array.from(keyMap.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, zhCN]) => ({
        label: zhCN || key,
        value: key,
      }));
  }, [translations]);

  useEffect(() => {
    if (visible) {
      if (isEditing && menu) {
        form.setFieldsValue({
          ...menu,
          status: menu.status === 'active',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: true,
          sortOrder: 0,
          type: 'page',
          hideInMenu: false,
          keepAlive: false,
          openInNewTab: false,
        });
      }
    }
  }, [visible, menu, isEditing, form]);

  const parentMenuOptions = buildMenuTree(menus, menu?.id);

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const formData: MenuFormData = {
        ...values,
        status: values.status ? 'active' : 'inactive',
        parentId: values.parentId || undefined,
      };

      if (isEditing && menu) {
        await dispatch(updateMenu({ id: menu.id, menuData: formData })).unwrap();
        message.success(t('menu.updateSuccess'));
      } else {
        await dispatch(createMenu(formData)).unwrap();
        message.success(t('menu.createSuccess'));
      }

      onSubmit();
    } catch (error) {
      console.error('Menu form submit error:', error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error(t('message.error'));
      }
    }
  }, [form, isEditing, menu, dispatch, t, onSubmit]);

  const handleTypeChange = useCallback((type: 'directory' | 'page' | 'button' | 'iframe') => {
    // Set default values based on menu type
    if (type === 'directory' || type === 'button') {
      form.setFieldsValue({
        path: '',
        component: '',
        externalUrl: '',
      });
    } else if (type === 'iframe') {
      form.setFieldsValue({
        component: '',
      });
    } else if (type === 'page') {
      form.setFieldsValue({
        externalUrl: '',
      });
    }
  }, [form]);

  return (
    <Modal
      title={isEditing ? t('menu.editMenu') : t('menu.addMenu')}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {t('common.cancel')}
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {t('common.save')}
        </Button>,
      ]}
      width={800}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: true,
          sortOrder: 0,
          type: 'page',
          hideInMenu: false,
          keepAlive: false,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label={t('menu.menuName')}
              rules={[
                { required: true, message: t('menu.menuNameRequired') },
                { max: 50, message: t('validation.maxLength', { max: 50 }) },
              ]}
            >
              <Input placeholder={t('menu.menuNamePlaceholder')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="i18nKey"
              label={t('menu.i18nKey')}
              tooltip={t('menu.i18nKeyTooltip')}
              rules={[
                { pattern: /^[a-zA-Z][a-zA-Z0-9_.]*$/, message: t('menu.i18nKeyPattern') },
              ]}
            >
              <Select
                placeholder={t('menu.i18nKeyPlaceholder')}
                allowClear
                showSearch
                loading={i18nKeysLoading}
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
                options={i18nKeyOptions}
                notFoundContent={i18nKeysLoading ? t('common.loading') : t('common.noData')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label={t('menu.menuType')}
              rules={[{ required: true, message: t('menu.menuTypeRequired') }]}
            >
              <Select placeholder={t('menu.menuTypePlaceholder')} onChange={handleTypeChange}>
                <Option value="directory">
                  <Space>
                    <FolderOutlined />
                    {t('menu.directory')}
                  </Space>
                </Option>
                <Option value="page">
                  <Space>
                    <FileOutlined />
                    {t('menu.page')}
                  </Space>
                </Option>
                <Option value="iframe">
                  <Space>
                    <LinkOutlined />
                    {t('menu.iframe')}
                  </Space>
                </Option>
                <Option value="button">
                  <Space>
                    <AppstoreOutlined />
                    {t('menu.button')}
                  </Space>
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="parentId"
              label={t('menu.parentMenu')}
            >
              <TreeSelect
                placeholder={t('menu.parentMenuPlaceholder')}
                allowClear
                treeData={parentMenuOptions}
                treeDefaultExpandAll
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="icon"
              label={t('menu.menuIcon')}
            >
              <Select
                placeholder={t('menu.menuIconPlaceholder')}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.value as string)?.toLowerCase().includes(input.toLowerCase())
                }
                optionLabelProp="label"
                virtual
                listHeight={400}
              >
                {MENU_ICONS.map(option => (
                  <Option
                    key={option.value}
                    value={option.value}
                    label={
                      <Space>
                        {option.icon}
                        {option.label}
                      </Space>
                    }
                  >
                    <Space>
                      {option.icon}
                      {option.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
        >
          {({ getFieldValue }) => {
            const menuType = getFieldValue('type');
            return (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="path"
                      label={t('menu.menuPath')}
                      rules={
                        menuType === 'page' || menuType === 'iframe'
                          ? [
                              { required: true, message: t('menu.menuPathRequired') },
                              { pattern: /^\//, message: t('menu.menuPathPattern') },
                            ]
                          : []
                      }
                    >
                      <Input
                        placeholder={
                          menuType === 'directory'
                            ? t('menu.directoryPathPlaceholder')
                            : menuType === 'page'
                            ? t('menu.pagePathPlaceholder')
                            : menuType === 'iframe'
                            ? t('menu.iframePathPlaceholder')
                            : t('menu.buttonPathPlaceholder')
                        }
                        disabled={menuType === 'button'}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="component"
                      label={t('menu.component')}
                      rules={
                        menuType === 'page'
                          ? [{ required: true, message: t('menu.componentRequired') }]
                          : []
                      }
                    >
                      <Input
                        placeholder={t('menu.componentPlaceholder')}
                        disabled={menuType !== 'page'}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                {menuType === 'iframe' && (
                  <>
                    <Form.Item
                      name="externalUrl"
                      label={t('menu.externalUrl')}
                      rules={[
                        { required: true, message: t('menu.externalUrlRequired') },
                        { type: 'url', message: t('menu.externalUrlPattern') },
                      ]}
                    >
                      <Input placeholder={t('menu.externalUrlPlaceholder')} />
                    </Form.Item>
                    <Form.Item
                      name="openInNewTab"
                      label={t('menu.openInNewTab')}
                      valuePropName="checked"
                      tooltip={t('menu.openInNewTabTooltip')}
                    >
                      <Switch
                        checkedChildren={t('menu.openInNewTabYes')}
                        unCheckedChildren={t('menu.openInNewTabNo')}
                      />
                    </Form.Item>
                  </>
                )}
              </>
            );
          }}
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="permission"
              label={t('menu.permission')}
              rules={[{ required: true, message: t('menu.permissionRequired') }]}
            >
              <Input placeholder={t('menu.permissionPlaceholder')} />
            </Form.Item>
          </Col>
          <Col span={12}>
              <Form.Item
                name="sortOrder"
                label={t('menu.sortOrder')}
                rules={[{ type: 'number', message: t('menu.sortOrderNumber') }]}
              >
                <InputNumber
                  placeholder={t('menu.sortOrderPlaceholder')}
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="status" label={t('common.status')} valuePropName="checked">
              <Switch
                checkedChildren={t('common.active')}
                unCheckedChildren={t('common.inactive')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="hideInMenu" label={t('menu.hideInMenu')} valuePropName="checked">
              <Switch
                checkedChildren={t('common.yes')}
                unCheckedChildren={t('common.no')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="keepAlive" label={t('menu.keepAlive')} valuePropName="checked">
              <Switch
                checkedChildren={t('common.yes')}
                unCheckedChildren={t('common.no')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label={t('common.description')}
        >
          <TextArea
            placeholder={t('menu.descriptionPlaceholder')}
            rows={3}
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="remark"
          label={t('common.remark')}
        >
          <TextArea
            placeholder={t('menu.remarkPlaceholder')}
            rows={2}
            maxLength={100}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MenuForm;