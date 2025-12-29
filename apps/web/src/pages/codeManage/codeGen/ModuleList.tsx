import React, { useState, useCallback, useEffect } from "react";
import { Button, Space, Tag, Popconfirm, Tooltip, Steps, message } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  TableOutlined,
  CodeOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CrudPage, { ToolbarButton } from "@/components/CrudPage";
import ModuleForm from "./ModuleForm";
import type { CodeModule } from "./types";

const ModuleList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [modules, setModules] = useState<CodeModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingModule, setEditingModule] = useState<CodeModule | null>(null);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = useCallback(() => {
    setLoading(true);
    // TODO: 替换为实际 API 调用
    setTimeout(() => {
      const mockData: CodeModule[] = [
        {
          id: "1",
          name: "用户管理",
          description: "系统用户的增删改查功能",
          moduleName: "user",
          tableName: "sys_user",
          status: "ready",
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
        },
      ];
      setModules(mockData);
      setLoading(false);
    }, 500);
  }, []);

  const handleAdd = useCallback(() => {
    setEditingModule(null);
    setIsFormVisible(true);
  }, []);

  const handleEdit = useCallback((record: CodeModule) => {
    setEditingModule(record);
    setIsFormVisible(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        setModules((prev) => prev.filter((m) => m.id !== id));
        message.success(t("codeGen.deleteSuccess"));
      } catch {
        message.error(t("message.error"));
      }
    },
    [t]
  );

  const handleBatchDelete = useCallback(async () => {
    if (selectedRowKeys.length === 0) {
      message.warning(t("codeGen.selectModules"));
      return;
    }

    try {
      setModules((prev) => prev.filter((m) => !selectedRowKeys.includes(m.id)));
      setSelectedRowKeys([]);
      message.success(t("codeGen.deleteSuccess"));
    } catch {
      message.error(t("message.error"));
    }
  }, [selectedRowKeys, t]);

  const handleRefresh = useCallback(() => {
    loadModules();
  }, [loadModules]);

  const handleSearch = useCallback((value: string) => {
    // TODO: 实现搜索逻辑
    console.log("Search:", value);
  }, []);

  const handleDesignTable = useCallback(
    (module: CodeModule) => {
      navigate(`/code-manage/code-gen/design/${module.id}`);
    },
    [navigate]
  );

  const handleGenerateCode = useCallback(
    (module: CodeModule) => {
      navigate(`/code-manage/code-gen/preview/${module.id}`);
    },
    [navigate]
  );

  const handleFormSubmit = useCallback(
    (values: Partial<CodeModule>) => {
      if (editingModule) {
        setModules((prev) =>
          prev.map((m) => (m.id === editingModule.id ? { ...m, ...values } : m))
        );
        message.success(t("codeGen.updateSuccess"));
      } else {
        const newModule: CodeModule = {
          id: Date.now().toString(),
          ...values,
          status: "draft",
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
        } as CodeModule;
        setModules((prev) => [...prev, newModule]);
        message.success(t("codeGen.createSuccess"));
      }
      setIsFormVisible(false);
      setEditingModule(null);
    },
    [editingModule, t]
  );

  const getStatusTag = (status: CodeModule["status"]) => {
    const statusConfig = {
      draft: { color: "default", text: t("codeGen.statusDraft") },
      design: { color: "processing", text: t("codeGen.statusDesign") },
      ready: { color: "success", text: t("codeGen.statusReady") },
      generated: { color: "purple", text: t("codeGen.statusGenerated") },
    };
    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getStepStatus = (moduleStatus: CodeModule["status"]) => {
    const stepMap = { draft: 0, design: 1, ready: 2, generated: 3 };
    return stepMap[moduleStatus] || 0;
  };

  // 自定义操作列渲染
  const operationColumnRender = useCallback(
    (record: CodeModule) => (
      <Space size="small">
        <Tooltip title={t("common.edit")}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t("common.edit")}
          </Button>
        </Tooltip>

        <Tooltip title={t("codeGen.designTable")}>
          <Button
            type="link"
            size="small"
            icon={<TableOutlined />}
            onClick={() => handleDesignTable(record)}
          >
            {t("codeGen.designTable")}
          </Button>
        </Tooltip>

        {record.status === "ready" && (
          <Tooltip title={t("codeGen.generateCode")}>
            <Button
              type="link"
              size="small"
              icon={<CodeOutlined />}
              onClick={() => handleGenerateCode(record)}
            >
              {t("codeGen.generateCode")}
            </Button>
          </Tooltip>
        )}

        {record.status === "generated" && (
          <Tooltip title={t("codeGen.viewCode")}>
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleGenerateCode(record)}
            >
              {t("codeGen.viewCode")}
            </Button>
          </Tooltip>
        )}

        <Popconfirm
          title={t("codeGen.confirmDelete")}
          onConfirm={() => handleDelete(record.id)}
          okText={t("common.confirm")}
          cancelText={t("common.cancel")}
        >
          <Tooltip title={t("common.delete")}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              {t("common.delete")}
            </Button>
          </Tooltip>
        </Popconfirm>
      </Space>
    ),
    [handleEdit, handleDesignTable, handleGenerateCode, handleDelete, t]
  );

  const columns = [
    {
      title: t("codeGen.moduleName"),
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: t("codeGen.moduleCode"),
      dataIndex: "moduleName",
      key: "moduleName",
      width: 120,
      render: (text: string) => <code>{text}</code>,
    },
    {
      title: t("common.description"),
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: t("codeGen.tableName"),
      dataIndex: "tableName",
      key: "tableName",
      width: 120,
      render: (text: string) => (text ? <code>{text}</code> : "-"),
    },
    {
      title: t("common.status"),
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: CodeModule["status"]) => getStatusTag(status),
    },
    {
      title: t("codeGen.progress"),
      key: "progress",
      width: 280,
      render: (_: unknown, record: CodeModule) => (
        <Steps
          size="small"
          current={getStepStatus(record.status)}
          items={[
            { title: t("codeGen.stepCreate") },
            { title: t("codeGen.stepDesign") },
            { title: t("codeGen.stepGenerate") },
          ]}
        />
      ),
    },
    {
      title: t("common.createTime"),
      dataIndex: "createTime",
      key: "createTime",
      width: 180,
      render: (text: string) => new Date(text).toLocaleString(),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  const toolbarButtons: ToolbarButton[] = [];

  return (
    <>
      <CrudPage<CodeModule>
        title={t("codeGen.title")}
        dataSource={modules}
        columns={columns}
        loading={loading}
        rowSelection={rowSelection}
        selectedRowKeys={selectedRowKeys}
        pagination={{
          showSizeChanger: true,
          showTotal: (total) => t("common.totalItems", { total }),
        }}
        searchPlaceholder={t("codeGen.searchPlaceholder")}
        onSearch={handleSearch}
        toolbarButtons={toolbarButtons}
        addButtonText={t("codeGen.addModule")}
        batchDeleteButtonText={t("common.batchDelete")}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBatchDelete={handleBatchDelete}
        onRefresh={handleRefresh}
        deleteConfirmTitle={t("codeGen.confirmDelete")}
        operationColumnWidth={320}
        operationColumnRender={operationColumnRender}
        tableProps={{
          scroll: { x: 1400 },
        }}
      />

      <ModuleForm
        visible={isFormVisible}
        module={editingModule}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setIsFormVisible(false);
          setEditingModule(null);
        }}
      />
    </>
  );
};

export default ModuleList;
