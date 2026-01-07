import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { NacosService } from './nacos.service';

/**
 * Nacos 模块
 * 
 * 提供服务注册与发现功能
 * 
 * 环境变量配置：
 * - NACOS_SERVER_ADDR: Nacos 服务器地址 (默认: http://localhost:8848)
 * - NACOS_NAMESPACE: 命名空间 (默认: public)
 * - NACOS_USERNAME: 用户名 (默认: nacos)
 * - NACOS_PASSWORD: 密码 (默认: nacos)
 */
@Global()
@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
  ],
  providers: [NacosService],
  exports: [NacosService],
})
export class NacosModule {}


