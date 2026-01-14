# 数据库初始化数据

此目录包含数据库的初始化脚本和种子数据。

## 文件说明

- `00-schema.sql` - 数据库表结构定义
- `seed.sql` - 初始种子数据（默认测试数据）
- `exported-data.sql` - 从当前数据库导出的数据（运行导出脚本后生成）
- `export-data.sh` - 数据导出脚本

## 使用方法

### 初始化数据库

首次部署或重置数据库时，运行：

```bash
pnpm db:init
```

这会依次执行：
1. 创建数据库表结构（`00-schema.sql`）
2. 导入初始种子数据（`seed.sql`）

### 导出当前数据库数据

如果需要将当前数据库中的数据导出为初始化脚本：

```bash
pnpm db:export
```

导出的数据会保存到 `exported-data.sql` 文件中。

### 使用导出的数据

导出的数据文件可以直接用作初始化脚本：

```bash
# 方法1: 使用 docker 命令
docker exec -i nova-postgres psql -U postgres -d nova_admin < database/seeds/exported-data.sql

# 方法2: 替换 seed.sql 后使用 pnpm db:seed
cp database/seeds/exported-data.sql database/seeds/seed.sql
pnpm db:seed
```

## 数据表说明

导出脚本会导出以下表的数据：

- `sys_department` - 部门表
- `sys_department_closure` - 部门闭包表
- `sys_user` - 用户表
- `sys_user_role` - 用户角色关联表
- `sys_role` - 角色表
- `sys_role_menu` - 角色菜单关联表
- `sys_menu` - 菜单表
- `sys_menu_closure` - 菜单闭包表
- `sys_config` - 系统配置表
- `sys_i18n` - 国际化表
- `sys_dict_type` - 字典类型表
- `sys_dict_item` - 字典项表

## 注意事项

1. 导出脚本会过滤掉已删除的数据（`deleted_at IS NOT NULL`）
2. 导出文件会自动包含清空现有数据的语句，导入时会先清空相关表
3. 导出的数据包含完整的 INSERT 语句，可以直接用于初始化新数据库
4. 建议在导出前先备份数据库

