import React, { useState, useEffect } from 'react';
import {
  Modal,
  Tree,
  message,
  Card,
  Space,
  Button,
  Input,
  Divider,
  Tag,
} from 'antd';
import {
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateRolePermissions } from '@/store/slices/roleSlice';
import type { Role } from '@/types/role';

const { Search } = Input;

interface PermissionModalProps {
  visible: boolean;
  role: Role | null;
  onCancel: () => void;
  onSuccess: () => void;
}

interface PermissionNode {
  key: string;
  title: string;
  children?: PermissionNode[];
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  visible,
  role,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.role);
  
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  // 模拟权限树数据
  const permissionTree: PermissionNode[] = React.useMemo(() => [
    {
      key: 'dashboard',
      title: t('menu.dashboard'),
      children: [
        { key: 'dashboard:view', title: t('permission.dashboardView') },
        { key: 'dashboard:export', title: t('permission.dashboardExport') },
      ],
    },
    {
      key: 'user',
      title: t('menu.userManagement'),
      children: [
        { key: 'user:view', title: t('permission.userView') },
        { key: 'user:create', title: t('permission.userCreate') },
        { key: 'user:update', title: t('permission.userUpdate') },
        { key: 'user:delete', title: t('permission.userDelete') },
        { key: 'user:export', title: t('permission.userExport') },
        { key: 'user:import', title: t('permission.userImport') },
      ],
    },
    {
      key: 'role',
      title: t('menu.roleManagement'),
      children: [
        { key: 'role:view', title: t('permission.roleView') },
        { key: 'role:create', title: t('permission.roleCreate') },
        { key: 'role:update', title: t('permission.roleUpdate') },
        { key: 'role:delete', title: t('permission.roleDelete') },
        { key: 'role:assign', title: t('permission.roleAssign') },
      ],
    },
    {
      key: 'menu',
      title: t('menu.menuManagement'),
      children: [
        { key: 'menu:view', title: t('permission.menuView') },
        { key: 'menu:create', title: t('permission.menuCreate') },
        { key: 'menu:update', title: t('permission.menuUpdate') },
        { key: 'menu:delete', title: t('permission.menuDelete') },
      ],
    },
    {
      key: 'system',
      title: t('menu.systemSettings'),
      children: [
        { key: 'system:view', title: t('permission.systemView') },
        { key: 'system:update', title: t('permission.systemUpdate') },
        { key: 'system:backup', title: t('permission.systemBackup') },
        { key: 'system:restore', title: t('permission.systemRestore') },
      ],
    },
  ], [t]);

  useEffect(() => {
    if (visible && role) {
      // 设置当前角色的权限
      const rolePermissions = role.permissions || [];
      setCheckedKeys(rolePermissions);
      
      // 展开所有节点
      const allKeys = getAllKeys(permissionTree);
      setExpandedKeys(allKeys);
    }
  }, [visible, role, permissionTree]);

  const getAllKeys = (nodes: PermissionNode[]): string[] => {
    let keys: string[] = [];
    nodes.forEach(node => {
      keys.push(node.key);
      if (node.children) {
        keys = keys.concat(getAllKeys(node.children));
      }
    });
    return keys;
  };

  const getParentKey = (key: string, tree: PermissionNode[]): string => {
    let parentKey = '';
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.key === key)) {
          parentKey = node.key;
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };

  const filterTreeData = (tree: PermissionNode[], searchValue: string): PermissionNode[] => {
    if (!searchValue) return tree;
    
    return tree.reduce((acc: PermissionNode[], node) => {
      const isMatch = node.title.toLowerCase().includes(searchValue.toLowerCase());
      const filteredChildren = node.children ? filterTreeData(node.children, searchValue) : [];
      
      if (isMatch || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : node.children,
        });
      }
      
      return acc;
    }, []);
  };

  const onExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const onCheck = (checkedKeysValue: any) => {
    setCheckedKeys(checkedKeysValue);
  };

  const onSearch = (value: string) => {
    const expandedKeysValue = getAllKeys(permissionTree).filter(key => {
      const node = findNode(permissionTree, key);
      return node && node.title.toLowerCase().includes(value.toLowerCase());
    });
    
    setExpandedKeys(expandedKeysValue);
    setSearchValue(value);
    setAutoExpandParent(true);
  };

  const findNode = (tree: PermissionNode[], key: string): PermissionNode | null => {
    for (const node of tree) {
      if (node.key === key) return node;
      if (node.children) {
        const found = findNode(node.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  const handleSelectAll = () => {
    const allKeys = getAllKeys(permissionTree);
    setCheckedKeys(allKeys);
  };

  const handleClearAll = () => {
    setCheckedKeys([]);
  };

  const handleSubmit = async () => {
    if (!role) return;
    
    try {
      await dispatch(updateRolePermissions({
        id: role.id,
        permissions: checkedKeys as string[],
      })).unwrap();
      
      message.success(t('role.permissionUpdateSuccess'));
      onSuccess();
    } catch (error) {
      message.error(t('message.error'));
    }
  };

  const filteredTree = filterTreeData(permissionTree, searchValue);

  return (
    <Modal
      title={
        <Space>
          {t('role.assignPermissions')}
          {role && <Tag color="blue">{role.name}</Tag>}
        </Space>
      }
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Search
            style={{ width: 300 }}
            placeholder={t('permission.searchPlaceholder')}
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={onSearch}
          />
          <Space>
            <Button
              size="small"
              icon={<CheckOutlined />}
              onClick={handleSelectAll}
            >
              {t('permission.selectAll')}
            </Button>
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={handleClearAll}
            >
              {t('permission.clearAll')}
            </Button>
          </Space>
        </Space>
      </Card>

      <Divider orientation="left">
        {t('permission.selectedCount', { count: checkedKeys.length })}
      </Divider>

      <Tree
        checkable
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        onCheck={onCheck}
        checkedKeys={checkedKeys}
        treeData={filteredTree}
        height={400}
        style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 8 }}
      />
    </Modal>
  );
};

export default PermissionModal;