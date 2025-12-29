import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Button,
  Space,
  message,
  Spin,
  Alert,
  Tree,
  Row,
  Col,
  Tooltip,
  Typography,
} from "antd";
import {
  ThunderboltOutlined,
  DownloadOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  FolderOutlined,
  FileOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Editor from "@monaco-editor/react";
import BasePage from "@/components/BasePage";
import type { GeneratedCode } from "./types";
import type { DataNode } from "antd/es/tree";

const { Text } = Typography;

interface CodeFile {
  key: string;
  title: string;
  code: string;
  language: string;
  path: string;
}

const CodePreview: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([
    "backend",
    "frontend",
  ]);

  useEffect(() => {
    loadGeneratedCode();
  }, [moduleId]);

  const loadGeneratedCode = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const buildFileTree = useCallback(
    (
      code: GeneratedCode
    ): Array<{
      key: string;
      title: string;
      children: CodeFile[];
    }> => {
      return [
        {
          key: "backend",
          title: t("codeGen.backend"),
          children: [
            {
              key: "entity",
              title: "user.entity.ts",
              code: code.backend.entity,
              language: "typescript",
              path: "apps/server/src/users/entities/user.entity.ts",
            },
            {
              key: "dto",
              title: "user.dto.ts",
              code: code.backend.dto,
              language: "typescript",
              path: "apps/server/src/users/dto/user.dto.ts",
            },
            {
              key: "controller",
              title: "user.controller.ts",
              code: code.backend.controller,
              language: "typescript",
              path: "apps/server/src/users/user.controller.ts",
            },
            {
              key: "service",
              title: "user.service.ts",
              code: code.backend.service,
              language: "typescript",
              path: "apps/server/src/users/user.service.ts",
            },
          ],
        },
        {
          key: "frontend",
          title: t("codeGen.frontend"),
          children: [
            {
              key: "list",
              title: "UserList.tsx",
              code: code.frontend.list,
              language: "typescript",
              path: "apps/web/src/pages/system/User/UserList.tsx",
            },
            {
              key: "form",
              title: "UserForm.tsx",
              code: code.frontend.form,
              language: "typescript",
              path: "apps/web/src/pages/system/User/UserForm.tsx",
            },
            {
              key: "types",
              title: "types.ts",
              code: code.frontend.types,
              language: "typescript",
              path: "apps/web/src/types/user.ts",
            },
            {
              key: "api",
              title: "api.ts",
              code: code.frontend.api,
              language: "typescript",
              path: "apps/web/src/api/user.ts",
            },
          ],
        },
      ];
    },
    [t]
  );

  const handleGenerateCode = useCallback(async () => {
    setGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const mockCode: GeneratedCode = {
        backend: {
          entity: `import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('sys_user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true, comment: '用户名' })
  username: string;

  @Column({ length: 100, comment: '密码' })
  password: string;

  @Column({ length: 100, nullable: true, comment: '邮箱' })
  email: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'banned'],
    default: 'active',
    comment: '状态'
  })
  status: string;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @CreateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}`,
          dto: `import { IsString, IsEmail, IsOptional, MinLength, MaxLength, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(['active', 'inactive', 'banned'])
  @IsOptional()
  status?: string;
}`,
          controller: `import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.userService.create(data);
  }
}`,
          service: `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: string) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async create(data: any) {
    const user = this.userRepository.create(data);
    return await this.userRepository.save(user);
  }
}`,
        },
        frontend: {
          list: `import React, { useEffect } from 'react';
import { Table, Button, Space } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store';

const UserList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.user);

  useEffect(() => {
    // Load users
  }, []);

  return (
    <div>
      <Table
        dataSource={users}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default UserList;`,
          form: `import React from 'react';
import { Modal, Form, Input } from 'antd';

const UserForm: React.FC = () => {
  return (
    <Modal title="User Form">
      <Form>
        <Form.Item name="username" label="Username">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserForm;`,
          types: `export interface User {
  id: string;
  username: string;
  email?: string;
}`,
          api: `import { request } from '@/utils/request';

export const fetchUsers = () => {
  return request({ url: '/users', method: 'GET' });
};`,
        },
      };

      setGeneratedCode(mockCode);

      const firstFile = buildFileTree(mockCode)[0];
      if (
        firstFile &&
        "children" in firstFile &&
        firstFile.children.length > 0
      ) {
        setSelectedFile(firstFile.children[0]);
      }

      message.success(t("codeGen.generateCodeSuccess"));
    } catch {
      message.error(t("codeGen.generateFailed"));
    } finally {
      setGenerating(false);
    }
  }, [buildFileTree, t]);

  const convertToTreeData = useCallback(
    (
      files: Array<{ key: string; title: string; children: CodeFile[] }>
    ): DataNode[] => {
      return files.map((item) => ({
        key: item.key,
        title: item.title,
        icon: expandedKeys.includes(item.key) ? (
          <FolderOpenOutlined />
        ) : (
          <FolderOutlined />
        ),
        children: item.children.map((child) => ({
          key: child.key,
          title: child.title,
          icon: <FileOutlined />,
          isLeaf: true,
        })),
      }));
    },
    [expandedKeys]
  );

  const handleFileSelect = useCallback(
    (selectedKeys: React.Key[]) => {
      if (selectedKeys.length === 0 || !generatedCode) return;

      const key = selectedKeys[0] as string;
      const fileTree = buildFileTree(generatedCode);

      for (const folder of fileTree) {
        const file = folder.children.find((f) => f.key === key);
        if (file) {
          setSelectedFile(file);
          break;
        }
      }
    },
    [generatedCode, buildFileTree]
  );

  const handleCopyCode = useCallback(() => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.code);
    message.success(t("codeGen.codeCopied"));
  }, [selectedFile, t]);

  const handleDownloadAll = useCallback(() => {
    message.success(t("codeGen.downloadStarted"));
  }, [t]);

  const handleComplete = useCallback(() => {
    message.success(t("codeGen.generateComplete"));
    navigate("/code-manage/code-gen");
  }, [navigate, t]);

  const headerExtra = (
    <Space>
      {!generatedCode && (
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          loading={generating}
          onClick={handleGenerateCode}
        >
          {t("codeGen.aiGenerateCode")}
        </Button>
      )}
      {generatedCode && (
        <>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadAll}>
            {t("codeGen.downloadAll")}
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleComplete}
          >
            {t("codeGen.complete")}
          </Button>
        </>
      )}
    </Space>
  );

  return (
    <BasePage
      title={t("codeGen.codePreview")}
      extra={headerExtra}
      useCard={false}
    >
      <Spin
        spinning={loading || generating}
        tip={generating ? t("codeGen.generatingTip") : undefined}
      >
        {!generatedCode ? (
          <Alert
            message={t("codeGen.ready")}
            description={t("codeGen.readyDescription")}
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        ) : (
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Alert
              message={t("codeGen.generateSuccess")}
              description={t("codeGen.generateSuccessDescription")}
              type="success"
              showIcon
            />

            <Row gutter={16} style={{ minHeight: "600px" }}>
              <Col span={6}>
                <Card
                  title={t("codeGen.fileList")}
                  size="small"
                  styles={{
                    body: {
                      padding: "12px",
                      maxHeight: "600px",
                      overflow: "auto",
                    },
                  }}
                >
                  <Tree
                    showIcon
                    defaultExpandAll
                    selectedKeys={selectedFile ? [selectedFile.key] : []}
                    expandedKeys={expandedKeys}
                    onExpand={(keys) => setExpandedKeys(keys)}
                    onSelect={handleFileSelect}
                    treeData={convertToTreeData(buildFileTree(generatedCode))}
                  />
                </Card>
              </Col>

              <Col span={18}>
                <Card
                  title={
                    selectedFile ? (
                      <Space>
                        <FileOutlined />
                        <Text strong>{selectedFile.title}</Text>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {selectedFile.path}
                        </Text>
                      </Space>
                    ) : (
                      t("codeGen.selectFile")
                    )
                  }
                  size="small"
                  extra={
                    selectedFile && (
                      <Tooltip title={t("codeGen.copyCode")}>
                        <Button
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={handleCopyCode}
                        >
                          {t("common.copy")}
                        </Button>
                      </Tooltip>
                    )
                  }
                  styles={{ body: { padding: 0 } }}
                >
                  {selectedFile ? (
                    <Editor
                      height="600px"
                      language={selectedFile.language}
                      value={selectedFile.code}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        minimap: { enabled: true },
                        fontSize: 14,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        folding: true,
                        wordWrap: "on",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: "600px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#999",
                      }}
                    >
                      {t("codeGen.selectFileToView")}
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </Space>
        )}
      </Spin>
    </BasePage>
  );
};

export default CodePreview;
