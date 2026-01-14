# 添加新微服务

## 目录结构

```bash
apps/{service-name}/
├── src/
│   ├── main.ts           # 服务入口
│   ├── app.module.ts     # 根模块
│   └── {module}/         # 业务模块
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## 步骤

1. **创建服务目录**

   ```bash
   mkdir -p apps/{service-name}/src
   ```

2. **创建 package.json**

   ```json
   {
     "name": "@nova-admin/{service-name}",
     "version": "1.0.0",
     "scripts": {
       "build": "nest build",
       "start:dev": "nest start --watch"
     }
   }
   ```

3. **创建入口文件 main.ts**

   ```typescript
   import { NestFactory } from '@nestjs/core';
   import { MicroserviceOptions, Transport } from '@nestjs/microservices';
   import { AppModule } from './app.module';

   async function bootstrap() {
     const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
       transport: Transport.TCP,
       options: { host: '0.0.0.0', port: 3003 },
     });
     await app.listen();
   }
   bootstrap();
   ```

4. **创建 app.module.ts**

   ```typescript
   import { Module } from '@nestjs/common';

   @Module({
     imports: [],
     controllers: [],
     providers: [],
   })
   export class AppModule {}
   ```

5. **在 gateway 中注册客户端**

   ```typescript
   // apps/gateway/src/app.module.ts
   ClientsModule.register([
     {
       name: 'SERVICE_NAME',
       transport: Transport.TCP,
       options: { host: 'localhost', port: 3003 },
     },
   ]);
   ```

6. **更新根 package.json 脚本**

```json
"dev:{service-name}": "pnpm --filter @nova-admin/{service-name} start:dev"
```

## 现有服务端口

- gateway: 3000
- auth: 3001
- rbac: 3002
- system: 3003

## 注意事项

- 新服务端口避免冲突
- 在 gateway 中注册微服务客户端
- 共享代码放 `packages/shared`
