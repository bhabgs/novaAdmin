// 代码生成模块类型定义

export interface CodeModule {
  id: string;
  name: string; // 模块名称，如 "用户管理"
  description: string; // 模块描述
  moduleName: string; // 模块标识，如 "user"
  tableName?: string; // 数据库表名
  tableStructure?: TableStructure; // 表结构
  status: 'draft' | 'design' | 'ready' | 'generated'; // 模块状态
  createTime: string;
  updateTime: string;
}

export interface TableStructure {
  tableName: string; // 表名
  tableComment: string; // 表注释
  columns: ColumnDefinition[]; // 列定义
}

export interface ColumnDefinition {
  id: string;
  name: string; // 字段名，如 "user_name"
  type: string; // 数据类型，如 "VARCHAR", "INT"
  length?: number; // 长度
  comment: string; // 字段注释
  nullable: boolean; // 是否可为空
  defaultValue?: string; // 默认值
  isPrimary: boolean; // 是否主键
  isUnique: boolean; // 是否唯一
  isIndex: boolean; // 是否索引
  autoIncrement?: boolean; // 是否自增
}

export interface GeneratedCode {
  backend: {
    entity: string; // 实体类代码
    dto: string; // DTO 代码
    controller: string; // Controller 代码
    service: string; // Service 代码
  };
  frontend: {
    list: string; // 列表页面
    form: string; // 表单组件
    types: string; // TypeScript 类型
    api: string; // API 调用
  };
}

export type CodeGenStep = 'module' | 'table' | 'preview' | 'complete';
