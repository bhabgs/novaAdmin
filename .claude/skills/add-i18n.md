# 添加国际化语言

## 文件结构

```bash
apps/web/src/i18n/
├── index.ts              # i18n 配置
└── locales/
    ├── zh-CN.json        # 简体中文
    ├── en-US.json        # 英文
    └── ar-SA.json        # 阿拉伯语
```

## 添加新语言步骤

1. **创建语言文件**

   ```bash
   # 复制现有语言文件作为模板
   cp apps/web/src/i18n/locales/en-US.json apps/web/src/i18n/locales/{locale}.json
   ```

2. **翻译内容**

   - 保持 JSON 结构不变
   - 只翻译 value 部分

3. **注册语言**

   ```typescript
   // apps/web/src/i18n/index.ts
   import arSA from './locales/ar-SA.json';

   const resources = {
     'zh-CN': { translation: zhCN },
     'en-US': { translation: enUS },
     'ar-SA': { translation: arSA },
   };
   ```

4. **添加语言选项**
   - 在语言切换组件中添加新选项

## RTL 语言支持（阿拉伯语、希伯来语等）

### RTL 语言列表

- `ar` - 阿拉伯语
- `he` - 希伯来语
- `fa` - 波斯语
- `ur` - 乌尔都语

### 布局处理

1. **HTML dir 属性**

   ```tsx
   // 根据语言设置文档方向
   useEffect(() => {
     const isRTL = ['ar', 'ar-SA', 'he', 'fa', 'ur'].includes(i18n.language);
     document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
   }, [i18n.language]);
   ```

2. **Tailwind RTL 支持**

   ```tsx
   // 使用逻辑属性替代物理属性
   // 推荐                    // 避免
   ps-4 (padding-start)      pl-4
   pe-4 (padding-end)        pr-4
   ms-4 (margin-start)       ml-4
   me-4 (margin-end)         mr-4
   start-0                   left-0
   end-0                     right-0
   ```

3. **条件样式**
   ```tsx
   // 需要区分方向时
   <div className="rtl:flex-row-reverse">
   <div className="ltr:ml-4 rtl:mr-4">
   ```

## 注意事项

- RTL 语言需要镜像整体布局
- 图标方向可能需要翻转（如箭头）
- 数字通常保持 LTR 显示
- 测试时切换语言验证布局
