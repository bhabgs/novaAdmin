# 添加后端模块

## 目录结构

```bash
apps/{service}/src/{module}/
├── {module}.module.ts      # 模块定义
├── {module}.controller.ts  # 控制器
├── {module}.service.ts     # 服务层
├── dto/
│   ├── create-{module}.dto.ts
│   └── update-{module}.dto.ts
└── entities/
    └── {module}.entity.ts  # 数据库实体
```

## 步骤

1. **创建 Entity**

   ```typescript
   // entities/{module}.entity.ts
   @Entity('table_name')
   export class XxxEntity extends BaseEntity {
     @Column()
     name: string;
   }
   ```

2. **创建 DTO**

   ```typescript
   // dto/create-xxx.dto.ts
   export class CreateXxxDto {
     @ApiProperty({ description: '名称' })
     @IsNotEmpty()
     name: string;
   }
   ```

3. **创建 Service**

   ```typescript
   // xxx.service.ts
   @Injectable()
   export class XxxService {
     constructor(
       @InjectRepository(XxxEntity)
       private readonly repo: Repository<XxxEntity>,
     ) {}
   }
   ```

4. **创建 Controller**

   ```typescript
   // xxx.controller.ts
   @ApiTags('xxx')
   @Controller('xxx')
   export class XxxController {
     constructor(private readonly service: XxxService) {}
   }
   ```

5. **创建 Module**

   ```typescript
   // xxx.module.ts
   @Module({
     imports: [TypeOrmModule.forFeature([XxxEntity])],
     controllers: [XxxController],
     providers: [XxxService],
     exports: [XxxService],
   })
   export class XxxModule {}
   ```

6. **注册到服务主模块**
   - 在 `apps/{service}/src/app.module.ts` 中 imports 新模块

## 服务列表

- `auth` - 认证服务
- `rbac` - 权限服务
- `system` - 系统服务

## 注意事项

- Entity 继承 `BaseEntity` 获取通用字段
- Controller 必须添加 `@ApiTags` 装饰器
- DTO 使用 class-validator 装饰器验证
