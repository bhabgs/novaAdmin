import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Spin,
} from "antd";
import {
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  FolderOutlined,
  FileOutlined,
  AppstoreOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateRoleMenus } from "@/store/slices/roleSlice";
import { fetchMenus } from "@/store/slices/menuSlice";
import type { Role } from "@/types/role";
import type { Menu } from "@/types/menu";
import { getIconByName } from "@/constants/icons";

const { Search } = Input;

interface PermissionModalProps {
  visible: boolean;
  role: Role | null;
  onCancel: () => void;
  onSuccess: () => void;
}

interface MenuTreeNode {
  key: string;
  title: React.ReactNode;
  icon: React.ReactNode;
  children?: MenuTreeNode[];
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
  const { menus, loading: menusLoading } = useAppSelector((state) => state.menu);

  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  // 获取菜单图标
  const getMenuIcon = useCallback((menu: Menu) => {
    // 优先使用菜单配置的图标
    if (menu.icon) {
      const icon = getIconByName(menu.icon);
      if (icon) return icon;
    }
    // 否则根据类型返回默认图标
    switch (menu.type) {
      case "directory":
        return <FolderOutlined />;
      case "page":
        return <FileOutlined />;
      case "button":
        return <AppstoreOutlined />;
      case "iframe":
        return <LinkOutlined />;
      default:
        return <FileOutlined />;
    }
  }, []);

  // 构建菜单树
  const buildMenuTree = useCallback(
    (menuList: Menu[], parentId?: string): MenuTreeNode[] => {
      const result: MenuTreeNode[] = [];

      for (const menu of menuList) {
        if (menu.parentId === parentId || (!menu.parentId && !parentId)) {
          const children = buildMenuTree(menuList, menu.id);
          const typeLabel = {
            directory: t("menu.directory"),
            page: t("menu.page"),
            button: t("menu.button"),
            iframe: t("menu.iframe"),
          };

          result.push({
            key: menu.id,
            title: (
              <Space>
                <span>{menu.name}</span>
                <Tag color={menu.type === "directory" ? "blue" : menu.type === "page" ? "green" : menu.type === "iframe" ? "purple" : "orange"} style={{ fontSize: 10 }}>
                  {typeLabel[menu.type] || menu.type}
                </Tag>
              </Space>
            ),
            icon: getMenuIcon(menu),
            children: children.length > 0 ? children : undefined,
          });
        }
      }

      return result;
    },
    [t, getMenuIcon]
  );

  // 获取所有节点 key
  const getAllKeys = useCallback((nodes: MenuTreeNode[]): string[] => {
    let keys: string[] = [];
    nodes.forEach((node) => {
      keys.push(node.key as string);
      if (node.children) {
        keys = keys.concat(getAllKeys(node.children));
      }
    });
    return keys;
  }, []);

  // 菜单树数据
  const menuTree = useMemo(() => {
    return buildMenuTree(menus);
  }, [menus, buildMenuTree]);

  useEffect(() => {
    if (visible) {
      // 加载菜单列表
      dispatch(fetchMenus());
    }
  }, [visible, dispatch]);

  useEffect(() => {
    if (visible && role && menus.length > 0) {
      // 设置当前角色的菜单权限
      const roleMenuIds = role.menuIds || [];
      setCheckedKeys(roleMenuIds);

      // 展开所有节点
      const allKeys = getAllKeys(menuTree);
      setExpandedKeys(allKeys);
    }
  }, [visible, role, menus, menuTree, getAllKeys]);

  // 过滤树数据
  const filterTreeData = useCallback(
    (tree: MenuTreeNode[], searchVal: string): MenuTreeNode[] => {
      if (!searchVal) return tree;

      return tree.reduce((acc: MenuTreeNode[], node) => {
        const titleText = React.isValidElement(node.title)
          ? (node.title.props.children?.[0]?.props?.children as string) || ""
          : String(node.title);
        const isMatch = titleText.toLowerCase().includes(searchVal.toLowerCase());
        const filteredChildren = node.children
          ? filterTreeData(node.children, searchVal)
          : [];

        if (isMatch || filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : node.children,
          });
        }

        return acc;
      }, []);
    },
    []
  );

  const onExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const onCheck = (
    checkedKeysValue:
      | React.Key[]
      | { checked: React.Key[]; halfChecked: React.Key[] }
  ) => {
    const keys = Array.isArray(checkedKeysValue)
      ? checkedKeysValue
      : checkedKeysValue.checked;
    setCheckedKeys(keys);
  };

  const onSearch = (value: string) => {
    if (value) {
      const allKeys = getAllKeys(menuTree);
      setExpandedKeys(allKeys);
    }
    setSearchValue(value);
    setAutoExpandParent(true);
  };

  const handleSelectAll = () => {
    const allKeys = getAllKeys(menuTree);
    setCheckedKeys(allKeys);
  };

  const handleClearAll = () => {
    setCheckedKeys([]);
  };

  const handleSubmit = async () => {
    if (!role) return;

    try {
      await dispatch(
        updateRoleMenus({
          roleId: role.id,
          menuIds: checkedKeys as string[],
        })
      ).unwrap();

      message.success(t("role.permissionUpdateSuccess"));
      onSuccess();
    } catch {
      message.error(t("message.error"));
    }
  };

  const filteredTree = filterTreeData(menuTree, searchValue);

  return (
    <Modal
      title={
        <Space>
          {t("role.assignPermissions")}
          {role && <Tag color="blue">{role.name}</Tag>}
        </Space>
      }
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      width={800}
      destroyOnHidden
    >
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Search
            style={{ width: 300 }}
            placeholder={t("menu.searchPlaceholder")}
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
              {t("permission.selectAll")}
            </Button>
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={handleClearAll}
            >
              {t("permission.clearAll")}
            </Button>
          </Space>
        </Space>
      </Card>

      <Divider orientation="left">
        {t("permission.selectedCount", { count: checkedKeys.length })}
      </Divider>

      <Spin spinning={menusLoading}>
        <Tree
          checkable
          showIcon
          onExpand={onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          onCheck={onCheck}
          checkedKeys={checkedKeys}
          treeData={filteredTree}
          height={400}
          style={{ border: "1px solid #d9d9d9", borderRadius: 6, padding: 8 }}
        />
      </Spin>
    </Modal>
  );
};

export default PermissionModal;
