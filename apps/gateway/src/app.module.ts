import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { NacosModule, TransformInterceptor } from '@nova-admin/shared';

import { ProxyModule } from './proxy/proxy.module';
import { AuthModule } from './auth/auth.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Nacos 服务发现
    NacosModule,

    // 限流模块
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 分钟
        limit: 100, // 100 次请求
      },
    ]),

    // 业务模块
    AuthModule,
    ProxyModule,
  ],
  controllers: [HealthController],
  providers: [
    // 全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // 全局响应转换拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // 全局 JWT 守卫（默认所有路由需要认证）
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

