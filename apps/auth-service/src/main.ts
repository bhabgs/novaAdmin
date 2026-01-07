import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from '@nova-admin/shared';
import { NacosService } from '@nova-admin/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 全局前缀
  app.setGlobalPrefix('auth');

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('NovaAdmin Auth Service')
    .setDescription('认证服务 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // 获取服务配置
  const port = configService.get<number>('PORT', 3001);
  const serviceName = configService.get<string>('SERVICE_NAME', 'auth-service');
  const serviceIp = configService.get<string>('SERVICE_IP', 'localhost');

  // 启动服务
  await app.listen(port);

  // 注册到 Nacos
  const nacosService = app.get(NacosService);
  await nacosService.registerService({
    serviceName,
    ip: serviceIp,
    port,
    metadata: {
      version: '1.0.0',
    },
  });

  console.log(`🚀 Auth Service is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api-docs`);
  console.log(`📝 Service registered to Nacos: ${serviceName}`);
}

bootstrap();

