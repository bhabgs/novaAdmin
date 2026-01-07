import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { NacosService } from '@nova-admin/shared';

@ApiTags('健康检查')
@Controller('health')
export class HealthController {
  constructor(private readonly nacosService: NacosService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '健康检查' })
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'gateway',
    };
  }

  @Public()
  @Get('services')
  @ApiOperation({ summary: '检查后端服务状态' })
  async checkServices() {
    const services = ['auth-service', 'rbac-service', 'i18n-service'];
    const status: Record<string, boolean> = {};

    for (const serviceName of services) {
      try {
        const url = await this.nacosService.getServiceUrl(serviceName);
        status[serviceName] = !!url;
      } catch {
        status[serviceName] = false;
      }
    }

    return {
      status: 'ok',
      services: status,
      timestamp: new Date().toISOString(),
    };
  }
}

