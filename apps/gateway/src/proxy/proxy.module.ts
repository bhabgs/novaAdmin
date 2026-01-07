import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NacosModule } from '@nova-admin/shared';
import { ProxyController } from './proxy.controller';
import { AuthServiceProxy } from './service-proxies/auth-service.proxy';
import { RbacServiceProxy } from './service-proxies/rbac-service.proxy';
import { I18nServiceProxy } from './service-proxies/i18n-service.proxy';

@Module({
  imports: [NacosModule, HttpModule],
  controllers: [ProxyController],
  providers: [AuthServiceProxy, RbacServiceProxy, I18nServiceProxy],
})
export class ProxyModule {}

