# 添加字典配置

## 概述

字典管理用于维护系统中的枚举值和配置项，如用户状态、菜单类型、i18n 模块等。

## 数据库结构

```sql
-- 字典类型表
sys_dict_type (id, name, code, description, status, sort)

-- 字典项表
sys_dict_item (id, dict_type_code, label, value, status, sort)
```

## 添加新字典类型

### 1. 在字典管理页面添加

- 访问 `/system/dict` 页面
- 点击"新增类型"
- 填写：
  - 名称：如"用户状态"
  - 编码：如"user_status"（唯一标识）
  - 描述：说明用途
  - 状态：启用/禁用
  - 排序：显示顺序

### 2. 添加字典项

- 选择字典类型
- 点击"新增"添加字典项
- 填写：
  - 标签：显示的中文名称
  - 值：实际使用的值
  - 状态：启用/禁用
  - 排序：显示顺序

## 在代码中使用字典

### 后端查询字典项

```typescript
import { dictControllerFindItemsByTypeCode } from '@/api/services.gen';

const response = await dictControllerFindItemsByTypeCode({
  query: { dictTypeCode: 'user_status' },
});
const items = response.data?.data || response.data;
```

### 前端显示字典

```tsx
// 下拉选择
<Select>
  {dictItems.map((item) => (
    <SelectItem key={item.id} value={item.value}>
      {item.label}
    </SelectItem>
  ))}
</Select>

// 状态显示
const getStatusLabel = (value: string) => {
  const item = dictItems.find((d) => d.value === value);
  return item?.label || value;
};
```

## 常见字典类型

- `i18n_module` - 国际化模块分类
- `user_status` - 用户状态（启用/禁用）
- `menu_type` - 菜单类型（目录/菜单/按钮）

## 注意事项

- 字典编码（code）必须唯一
- 删除字典类型会级联删除所有字典项
- 字典项的 value 用于代码逻辑，label 用于显示
- 状态为禁用的字典项不会在前端显示
