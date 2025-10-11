import React, { useEffect } from 'react';
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
  MenuOutlined,
  FolderOutlined,
  FileOutlined,
  AppstoreOutlined,
  LinkOutlined,
  CodeOutlined,
  SortAscendingOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import { createMenu, updateMenu, fetchMenus } from '../../store/slices/menuSlice';

const { Option } = Select;
const { TextArea } = Input;

interface MenuFormProps {
  visible: boolean;
  menu?: any;
  onSubmit: () => void;
  onCancel: () => void;
}

interface MenuFormData {
  name: string;
  path: string;
  icon: string;
  parentId: string | null;
  type: 'directory' | 'page' | 'button';
  status: 'active' | 'inactive';
  sortOrder: number;
  permission: string;
  component: string;
  description: string;
  remark: string;
  hideInMenu: boolean;
  keepAlive: boolean;
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

  const isEditing = !!menu;

  useEffect(() => {
    if (visible) {
      if (isEditing) {
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
        });
      }
    }
  }, [visible, menu, isEditing, form]);

  // 构建父级菜单树形数据
  const buildParentMenuTree = (menus: any[]): any[] => {
    const menuMap = new Map();
    const rootMenus: any[] = [];

    // 过滤掉按钮类型的菜单，只有目录和页面可以作为父级
    const validParentMenus = menus.filter(m => m.type !== 'button');

    validParentMenus.forEach(menu => {
      menuMap.set(menu.id, {
        value: menu.id,
        title: menu.name,
        key: menu.id,
        children: [],
        disabled: isEditing && menu.id === menu?.id, // 禁止选择自己作为父级
      });
    });

    validParentMenus.forEach(menu => {
      const menuItem = menuMap.get(menu.id);
      if (menu.parentId && menuMap.has(menu.parentId)) {
        const parent = menuMap.get(menu.parentId);
        parent.children.push(menuItem);
      } else {
        rootMenus.push(menuItem);
      }
    });

    return rootMenus;
  };

  const parentMenuOptions = buildParentMenuTree(menus);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData: MenuFormData = {
        ...values,
        status: values.status ? 'active' : 'inactive',
        parentId: values.parentId || null,
      };

      if (isEditing) {
        await dispatch(updateMenu({ id: menu.id, menuData: formData })).unwrap();
        message.success(t('menu.updateSuccess'));
      } else {
        await dispatch(createMenu(formData)).unwrap();
        message.success(t('menu.createSuccess'));
      }

      onSubmit();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error(t('message.error'));
      }
    }
  };

  const handleTypeChange = (type: string) => {
    // 根据菜单类型设置默认值
    if (type === 'directory') {
      form.setFieldsValue({
        path: '',
        component: '',
      });
    } else if (type === 'button') {
      form.setFieldsValue({
        path: '',
        component: '',
      });
    }
  };

  const iconOptions = [
    { value: 'MenuOutlined', label: 'Menu', icon: <MenuOutlined /> },
    { value: 'FolderOutlined', label: 'Folder', icon: <FolderOutlined /> },
    { value: 'FileOutlined', label: 'File', icon: <FileOutlined /> },
    { value: 'AppstoreOutlined', label: 'App', icon: <AppstoreOutlined /> },
    { value: 'LinkOutlined', label: 'Link', icon: <LinkOutlined /> },
    { value: 'CodeOutlined', label: 'Code', icon: <CodeOutlined /> },
    { value: 'SortAscendingOutlined', label: 'Sort', icon: <SortAscendingOutlined /> },
  ];

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
      destroyOnClose
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
              <Select placeholder={t('menu.menuIconPlaceholder')} allowClear>
                {iconOptions.map(option => (
                  <Option key={option.value} value={option.value}>
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
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="path"
                    label={t('menu.menuPath')}
                    rules={
                      menuType === 'page'
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
              rules={[{ type: 'number', message: t('role.sortOrderNumber') }]}
            >
              <InputNumber
                placeholder={t('role.sortOrderPlaceholder')}
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
            placeholder={t('role.descriptionPlaceholder')}
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
            placeholder={t('role.remarkPlaceholder')}
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