import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Modal,
  message,
  Popconfirm,
  Alert,
  Spin,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ThunderboltOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ColumnsType } from "antd/es/table";
import BasePage from "@/components/BasePage";
import type { ColumnDefinition, TableStructure } from "./types";

const { Option } = Select;

const TableDesigner: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [tableName, setTableName] = useState("");
  const [tableComment, setTableComment] = useState("");
  const [columns, setColumns] = useState<ColumnDefinition[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingColumn, setEditingColumn] = useState<ColumnDefinition | null>(
    null
  );
  const [form] = Form.useForm();

  useEffect(() => {
    loadTableStructure();
  }, [moduleId]);

  const loadTableStructure = useCallback(() => {
    setLoading(true);
    // TODO: 从后端加载表结构
    setTimeout(() => {
      // 模拟数据
      setTableName("sys_user");
      setTableComment("系统用户表");
      setColumns([
        {
          id: "1",
          name: "id",
          type: "BIGINT",
          comment: "主键ID",
          nullable: false,
          isPrimary: true,
          isUnique: false,
          isIndex: false,
          autoIncrement: true,
        },
        {
          id: "2",
          name: "username",
          type: "VARCHAR",
          length: 50,
          comment: "用户名",
          nullable: false,
          isPrimary: false,
          isUnique: true,
          isIndex: false,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleGenerateStructure = useCallback(async () => {
    setGenerating(true);
    try {
      // TODO: 调用 AI 生成表结构
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const generatedColumns: ColumnDefinition[] = [
        {
          id: Date.now().toString(),
          name: "id",
          type: "BIGINT",
          comment: "主键ID",
          nullable: false,
          isPrimary: true,
          isUnique: false,
          isIndex: false,
          autoIncrement: true,
        },
        {
          id: (Date.now() + 1).toString(),
          name: "username",
          type: "VARCHAR",
          length: 50,
          comment: "用户名",
          nullable: false,
          isPrimary: false,
          isUnique: true,
          isIndex: true,
        },
        {
          id: (Date.now() + 2).toString(),
          name: "password",
          type: "VARCHAR",
          length: 100,
          comment: "密码",
          nullable: false,
          isPrimary: false,
          isUnique: false,
          isIndex: false,
        },
        {
          id: (Date.now() + 3).toString(),
          name: "email",
          type: "VARCHAR",
          length: 100,
          comment: "邮箱",
          nullable: true,
          isPrimary: false,
          isUnique: true,
          isIndex: true,
        },
        {
          id: (Date.now() + 4).toString(),
          name: "status",
          type: "VARCHAR",
          length: 20,
          comment: "状态",
          nullable: false,
          defaultValue: "active",
          isPrimary: false,
          isUnique: false,
          isIndex: false,
        },
        {
          id: (Date.now() + 5).toString(),
          name: "create_time",
          type: "DATETIME",
          comment: "创建时间",
          nullable: false,
          isPrimary: false,
          isUnique: false,
          isIndex: false,
        },
      ];

      setColumns(generatedColumns);
      message.success(t("codeGen.generateStructureSuccess"));
    } catch {
      message.error(t("codeGen.generateFailed"));
    } finally {
      setGenerating(false);
    }
  }, [t]);

  const handleAddColumn = useCallback(() => {
    setEditingColumn(null);
    form.resetFields();
    setFormVisible(true);
  }, [form]);

  const handleEditColumn = useCallback(
    (column: ColumnDefinition) => {
      setEditingColumn(column);
      form.setFieldsValue(column);
      setFormVisible(true);
    },
    [form]
  );

  const handleDeleteColumn = useCallback(
    (id: string) => {
      setColumns((prev) => prev.filter((c) => c.id !== id));
      message.success(t("codeGen.deleteSuccess"));
    },
    [t]
  );

  const handleFormSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();

      if (editingColumn) {
        setColumns((prev) =>
          prev.map((c) => (c.id === editingColumn.id ? { ...c, ...values } : c))
        );
        message.success(t("codeGen.updateSuccess"));
      } else {
        const newColumn: ColumnDefinition = {
          id: Date.now().toString(),
          ...values,
        };
        setColumns((prev) => [...prev, newColumn]);
        message.success(t("codeGen.addSuccess"));
      }

      setFormVisible(false);
      setEditingColumn(null);
      form.resetFields();
    } catch {
      message.error(t("codeGen.formError"));
    }
  }, [editingColumn, form, t]);

  const handleSave = useCallback(async () => {
    if (!tableName) {
      message.error(t("codeGen.tableNameRequired"));
      return;
    }
    if (columns.length === 0) {
      message.error(t("codeGen.columnsRequired"));
      return;
    }

    const tableStructure: TableStructure = {
      tableName,
      tableComment,
      columns,
    };

    try {
      // TODO: 保存表结构到后端
      console.log("Saving table structure:", tableStructure);
      message.success(t("codeGen.saveSuccess"));
      // 保存后跳转到代码生成预览
      navigate(`/code-manage/code-gen/preview/${moduleId}`);
    } catch {
      message.error(t("codeGen.saveFailed"));
    }
  }, [tableName, tableComment, columns, moduleId, navigate, t]);

  const dataTypeOptions = [
    "VARCHAR",
    "CHAR",
    "TEXT",
    "INT",
    "BIGINT",
    "DECIMAL",
    "FLOAT",
    "DOUBLE",
    "DATE",
    "DATETIME",
    "TIMESTAMP",
    "BOOLEAN",
    "JSON",
  ];

  const tableColumns: ColumnsType<ColumnDefinition> = [
    {
      title: t("codeGen.columnName"),
      dataIndex: "name",
      key: "name",
      width: 150,
      render: (text) => <code>{text}</code>,
    },
    {
      title: t("codeGen.columnType"),
      dataIndex: "type",
      key: "type",
      width: 100,
    },
    {
      title: t("codeGen.columnLength"),
      dataIndex: "length",
      key: "length",
      width: 80,
      render: (text) => text || "-",
    },
    {
      title: t("codeGen.columnComment"),
      dataIndex: "comment",
      key: "comment",
      ellipsis: true,
    },
    {
      title: t("codeGen.nullable"),
      dataIndex: "nullable",
      key: "nullable",
      width: 80,
      render: (value) => (value ? t("common.yes") : t("common.no")),
    },
    {
      title: t("codeGen.isPrimary"),
      dataIndex: "isPrimary",
      key: "isPrimary",
      width: 70,
      render: (value) => (value ? "✓" : ""),
    },
    {
      title: t("codeGen.isUnique"),
      dataIndex: "isUnique",
      key: "isUnique",
      width: 70,
      render: (value) => (value ? "✓" : ""),
    },
    {
      title: t("codeGen.isIndex"),
      dataIndex: "isIndex",
      key: "isIndex",
      width: 70,
      render: (value) => (value ? "✓" : ""),
    },
    {
      title: t("codeGen.defaultValue"),
      dataIndex: "defaultValue",
      key: "defaultValue",
      width: 100,
      render: (text) => text || "-",
    },
    {
      title: t("common.operation"),
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditColumn(record)}
          />
          <Popconfirm
            title={t("codeGen.confirmDeleteColumn")}
            onConfirm={() => handleDeleteColumn(record.id)}
            okText={t("common.confirm")}
            cancelText={t("common.cancel")}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const headerExtra = (
    <Space>
      <Button
        type="primary"
        icon={<ThunderboltOutlined />}
        loading={generating}
        onClick={handleGenerateStructure}
      >
        {t("codeGen.aiGenerateStructure")}
      </Button>
      <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
        {t("codeGen.saveAndContinue")}
      </Button>
    </Space>
  );

  return (
    <BasePage
      title={t("codeGen.tableDesign")}
      extra={headerExtra}
      useCard={false}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Alert
          message={t("codeGen.tip")}
          description={t("codeGen.tableDesignTip")}
          type="info"
          showIcon
          closable
        />

        <Card size="small" title={t("codeGen.basicInfo")}>
          <Space size="large">
            <Form.Item
              label={t("codeGen.tableName")}
              style={{ marginBottom: 0 }}
            >
              <Input
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder={t("codeGen.tableNamePlaceholder")}
                style={{ width: 200 }}
              />
            </Form.Item>
            <Form.Item
              label={t("codeGen.tableComment")}
              style={{ marginBottom: 0 }}
            >
              <Input
                value={tableComment}
                onChange={(e) => setTableComment(e.target.value)}
                placeholder={t("codeGen.tableCommentPlaceholder")}
                style={{ width: 300 }}
              />
            </Form.Item>
          </Space>
        </Card>

        <Card
          size="small"
          title={t("codeGen.columnList")}
          extra={
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={handleAddColumn}
            >
              {t("codeGen.addColumn")}
            </Button>
          }
        >
          <Spin spinning={loading}>
            <Table
              columns={tableColumns}
              dataSource={columns}
              rowKey="id"
              scroll={{ x: 1200 }}
              pagination={false}
            />
          </Spin>
        </Card>
      </Space>

      <Modal
        title={editingColumn ? t("codeGen.editColumn") : t("codeGen.addColumn")}
        open={formVisible}
        onOk={handleFormSubmit}
        onCancel={() => {
          setFormVisible(false);
          setEditingColumn(null);
          form.resetFields();
        }}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            nullable: true,
            isPrimary: false,
            isUnique: false,
            isIndex: false,
            autoIncrement: false,
          }}
        >
          <Form.Item
            name="name"
            label={t("codeGen.columnName")}
            rules={[
              { required: true, message: t("codeGen.columnNameRequired") },
              {
                pattern: /^[a-z][a-z0-9_]*$/,
                message: t("codeGen.columnNamePattern"),
              },
            ]}
          >
            <Input placeholder={t("codeGen.columnNamePlaceholder")} />
          </Form.Item>

          <Space size="large" style={{ width: "100%" }}>
            <Form.Item
              name="type"
              label={t("codeGen.columnType")}
              rules={[
                { required: true, message: t("codeGen.columnTypeRequired") },
              ]}
              style={{ flex: 1 }}
            >
              <Select placeholder={t("codeGen.columnTypePlaceholder")}>
                {dataTypeOptions.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="length"
              label={t("codeGen.columnLength")}
              style={{ width: 120 }}
            >
              <InputNumber
                min={1}
                max={65535}
                placeholder={t("codeGen.optional")}
              />
            </Form.Item>
          </Space>

          <Form.Item
            name="comment"
            label={t("codeGen.columnComment")}
            rules={[
              { required: true, message: t("codeGen.columnCommentRequired") },
            ]}
          >
            <Input placeholder={t("codeGen.columnCommentPlaceholder")} />
          </Form.Item>

          <Form.Item name="defaultValue" label={t("codeGen.defaultValue")}>
            <Input placeholder={t("codeGen.optional")} />
          </Form.Item>

          <Space size="large">
            <Form.Item
              name="nullable"
              label={t("codeGen.nullable")}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="isPrimary"
              label={t("codeGen.isPrimary")}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="isUnique"
              label={t("codeGen.isUnique")}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="isIndex"
              label={t("codeGen.isIndex")}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="autoIncrement"
              label={t("codeGen.autoIncrement")}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </BasePage>
  );
};

export default TableDesigner;
