import React, { useEffect, useCallback, useMemo } from "react";
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
  Button,
} from "antd";
import {
  FolderOutlined,
  FileOutlined,
  AppstoreOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import { createMenu, updateMenu } from "@/store/slices/menuSlice";
import { fetchI18ns } from "@/store/slices/i18nSlice";
import type { Menu, MenuFormData } from "@/types/menu";
import type { I18n } from "@/types/i18n";
import { buildMenuTree } from "@/utils/menuUtils";
import { MENU_ICONS } from "@/constants/icons";

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
  const { items: i18ns } = useAppSelector((state) => state.i18n);

  const isEditing = !!menu;

  useEffect(() => {
    if (visible) {
      // 加载国际化列表
      dispatch(fetchI18ns({ page: 1, pageSize: 1000 }));

      if (isEditing && menu) {
        form.setFieldsValue({
          ...menu,
          status: menu.status === "active",
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: true,
          sortOrder: 0,
          type: "page",
          hideInMenu: false,
          keepAlive: false,
          openInNewTab: false,
        });
      }
    }
  }, [visible, menu, isEditing, form, dispatch]);

  const parentMenuOptions = buildMenuTree(menus, menu?.id);

  // 构造国际化键名选项：显示中文翻译，value为 module.code.key
  const i18nKeyOptions = useMemo(() => {
    return i18ns
      .filter((i18n: I18n) => i18n.module?.code && i18n.key)
      .map((i18n: I18n) => {
        const fullKey = `${i18n.module!.code}.${i18n.key}`;
        const moduleName = i18n.module?.name || "";
        const chineseText = i18n.zhCn || "";
        // 显示格式：模块名 - 中文翻译 (键名)
        const displayLabel =
          moduleName && chineseText
            ? `${moduleName} - ${chineseText} (${fullKey})`
            : chineseText || fullKey;
        return {
          value: fullKey,
          label: displayLabel,
          module: moduleName,
          key: i18n.key,
          zhCn: chineseText,
        };
      })
      .sort((a, b) => (a.zhCn || a.value).localeCompare(b.zhCn || b.value));
  }, [i18ns]);

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const formData: MenuFormData = {
        ...values,
        status: values.status ? "active" : "inactive",
        parentId: values.parentId || undefined,
      };

      if (isEditing && menu) {
        await dispatch(
          updateMenu({ id: menu.id, menuData: formData })
        ).unwrap();
        message.success(t("menu.updateSuccess"));
      } else {
        await dispatch(createMenu(formData)).unwrap();
        message.success(t("menu.createSuccess"));
      }

      onSubmit();
    } catch (error) {
      console.error("Menu form submit error:", error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error(t("message.error"));
      }
    }
  }, [form, isEditing, menu, dispatch, t, onSubmit]);

  const handleTypeChange = useCallback(
    (type: "directory" | "page" | "button" | "iframe") => {
      // Set default values based on menu type
      if (type === "directory" || type === "button") {
        form.setFieldsValue({
          path: "",
          component: "",
          externalUrl: "",
        });
      } else if (type === "iframe") {
        form.setFieldsValue({
          component: "",
        });
      } else if (type === "page") {
        form.setFieldsValue({
          externalUrl: "",
        });
      }
    },
    [form]
  );

  return (
    <Modal
      title={isEditing ? t("menu.editMenu") : t("menu.addMenu")}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {t("common.cancel")}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {t("common.save")}
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
          type: "page",
          hideInMenu: false,
          keepAlive: false,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label={t("menu.menuName")}
              rules={[
                { required: true, message: t("menu.menuNameRequired") },
                { max: 50, message: t("validation.maxLength", { max: 50 }) },
              ]}
            >
              <Input placeholder={t("menu.menuNamePlaceholder")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="i18nKey"
              label={t("menu.i18nKey")}
              tooltip={t("menu.i18nKeyTooltip")}
              rules={[
                {
                  pattern: /^[a-zA-Z][a-zA-Z0-9_.]*$/,
                  message: t("menu.i18nKeyPattern"),
                },
              ]}
            >
              <Select
                placeholder={t("menu.i18nKeyPlaceholder")}
                allowClear
                showSearch
                filterOption={(input, option) => {
                  const searchText = input.toLowerCase();
                  const label = (option?.label as string) || "";
                  const value = (option?.value as string) || "";
                  // 同时搜索中文翻译
                  const zhCn = (option as { zhCn?: string })?.zhCn || "";
                  return (
                    label.toLowerCase().includes(searchText) ||
                    value.toLowerCase().includes(searchText) ||
                    zhCn.toLowerCase().includes(searchText)
                  );
                }}
                options={i18nKeyOptions}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label={t("menu.menuType")}
              rules={[{ required: true, message: t("menu.menuTypeRequired") }]}
            >
              <Select
                placeholder={t("menu.menuTypePlaceholder")}
                onChange={handleTypeChange}
              >
                <Option value="directory">
                  <Space>
                    <FolderOutlined />
                    {t("menu.directory")}
                  </Space>
                </Option>
                <Option value="page">
                  <Space>
                    <FileOutlined />
                    {t("menu.page")}
                  </Space>
                </Option>
                <Option value="iframe">
                  <Space>
                    <LinkOutlined />
                    {t("menu.iframe")}
                  </Space>
                </Option>
                <Option value="button">
                  <Space>
                    <AppstoreOutlined />
                    {t("menu.button")}
                  </Space>
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="parentId" label={t("menu.parentMenu")}>
              <TreeSelect
                placeholder={t("menu.parentMenuPlaceholder")}
                allowClear
                treeData={parentMenuOptions}
                treeDefaultExpandAll
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="icon" label={t("menu.menuIcon")}>
              <Select
                placeholder={t("menu.menuIconPlaceholder")}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.value as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                optionLabelProp="label"
                virtual
                listHeight={400}
              >
                {MENU_ICONS.map((option) => (
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
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.type !== currentValues.type
          }
        >
          {({ getFieldValue }) => {
            const menuType = getFieldValue("type");
            return (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="path"
                      label={t("menu.menuPath")}
                      rules={
                        menuType === "page" || menuType === "iframe"
                          ? [
                              {
                                required: true,
                                message: t("menu.menuPathRequired"),
                              },
                              {
                                pattern: /^\//,
                                message: t("menu.menuPathPattern"),
                              },
                            ]
                          : []
                      }
                    >
                      <Input
                        placeholder={
                          menuType === "directory"
                            ? t("menu.directoryPathPlaceholder")
                            : menuType === "page"
                            ? t("menu.pagePathPlaceholder")
                            : menuType === "iframe"
                            ? t("menu.iframePathPlaceholder")
                            : t("menu.buttonPathPlaceholder")
                        }
                        disabled={menuType === "button"}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="component"
                      label={t("menu.component")}
                      rules={
                        menuType === "page"
                          ? [
                              {
                                required: true,
                                message: t("menu.componentRequired"),
                              },
                            ]
                          : []
                      }
                    >
                      <Input
                        placeholder={t("menu.componentPlaceholder")}
                        disabled={menuType !== "page"}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                {menuType === "iframe" && (
                  <>
                    <Form.Item
                      name="externalUrl"
                      label={t("menu.externalUrl")}
                      rules={[
                        {
                          required: true,
                          message: t("menu.externalUrlRequired"),
                        },
                        { type: "url", message: t("menu.externalUrlPattern") },
                      ]}
                    >
                      <Input placeholder={t("menu.externalUrlPlaceholder")} />
                    </Form.Item>
                    <Form.Item
                      name="openInNewTab"
                      label={t("menu.openInNewTab")}
                      valuePropName="checked"
                      tooltip={t("menu.openInNewTabTooltip")}
                    >
                      <Switch
                        checkedChildren={t("menu.openInNewTabYes")}
                        unCheckedChildren={t("menu.openInNewTabNo")}
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
              name="sortOrder"
              label={t("menu.sortOrder")}
              rules={[{ type: "number", message: t("menu.sortOrderNumber") }]}
            >
              <InputNumber
                placeholder={t("menu.sortOrderPlaceholder")}
                style={{ width: "100%" }}
                min={0}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="status"
              label={t("common.status")}
              valuePropName="checked"
            >
              <Switch
                checkedChildren={t("common.active")}
                unCheckedChildren={t("common.inactive")}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="hideInMenu"
              label={t("menu.hideInMenu")}
              valuePropName="checked"
            >
              <Switch
                checkedChildren={t("common.yes")}
                unCheckedChildren={t("common.no")}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="keepAlive"
              label={t("menu.keepAlive")}
              valuePropName="checked"
            >
              <Switch
                checkedChildren={t("common.yes")}
                unCheckedChildren={t("common.no")}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label={t("common.description")}>
          <TextArea
            placeholder={t("menu.descriptionPlaceholder")}
            rows={3}
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Form.Item name="remark" label={t("common.remark")}>
          <TextArea
            placeholder={t("menu.remarkPlaceholder")}
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
