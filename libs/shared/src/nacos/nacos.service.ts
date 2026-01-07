import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  NacosConfig,
  ServiceRegistrationOptions,
  ServiceInstance,
  ServiceDiscoveryOptions,
} from './nacos.types';

/**
 * Nacos 服务注册与发现服务
 * 
 * 使用 Nacos Open API 实现服务注册和发现
 * @see https://nacos.io/docs/latest/guide/user/open-api/
 */
@Injectable()
export class NacosService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NacosService.name);
  private config: NacosConfig;
  private registeredService: ServiceRegistrationOptions | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private accessToken: string | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.config = {
      serverAddr: this.configService.get('NACOS_SERVER_ADDR', 'http://localhost:8848'),
      namespace: this.configService.get('NACOS_NAMESPACE', 'public'),
      username: this.configService.get('NACOS_USERNAME', 'nacos'),
      password: this.configService.get('NACOS_PASSWORD', 'nacos'),
    };
  }

  async onModuleInit() {
    // 获取访问令牌
    await this.login();
  }

  async onModuleDestroy() {
    // 注销服务
    if (this.registeredService) {
      await this.deregisterService();
    }
    // 清理心跳
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  /**
   * 登录获取访问令牌
   */
  private async login(): Promise<void> {
    if (!this.config.username || !this.config.password) {
      return;
    }

    try {
      const url = `${this.config.serverAddr}/nacos/v1/auth/login`;
      const response = await firstValueFrom(
        this.httpService.post(url, null, {
          params: {
            username: this.config.username,
            password: this.config.password,
          },
        }),
      );
      this.accessToken = response.data.accessToken;
      this.logger.log('Nacos login successful');
    } catch (error) {
      this.logger.warn('Nacos login failed, continuing without auth', error.message);
    }
  }

  /**
   * 获取请求参数（包含认证信息）
   */
  private getAuthParams(): Record<string, string> {
    const params: Record<string, string> = {};
    if (this.accessToken) {
      params.accessToken = this.accessToken;
    }
    if (this.config.namespace && this.config.namespace !== 'public') {
      params.namespaceId = this.config.namespace;
    }
    return params;
  }

  /**
   * 注册服务实例
   */
  async registerService(options: ServiceRegistrationOptions): Promise<boolean> {
    try {
      const url = `${this.config.serverAddr}/nacos/v1/ns/instance`;
      const params = {
        ...this.getAuthParams(),
        serviceName: options.serviceName,
        ip: options.ip,
        port: options.port.toString(),
        groupName: options.groupName || 'DEFAULT_GROUP',
        clusterName: options.clusterName || 'DEFAULT',
        weight: (options.weight || 1).toString(),
        healthy: (options.healthy !== false).toString(),
        enabled: (options.enabled !== false).toString(),
        ephemeral: (options.ephemeral !== false).toString(),
        metadata: options.metadata ? JSON.stringify(options.metadata) : undefined,
      };

      await firstValueFrom(this.httpService.post(url, null, { params }));

      this.registeredService = options;
      this.logger.log(`Service registered: ${options.serviceName} at ${options.ip}:${options.port}`);

      // 启动心跳
      this.startHeartbeat(options);

      return true;
    } catch (error) {
      this.logger.error(`Failed to register service: ${error.message}`);
      return false;
    }
  }

  /**
   * 注销服务实例
   */
  async deregisterService(): Promise<boolean> {
    if (!this.registeredService) {
      return true;
    }

    try {
      const url = `${this.config.serverAddr}/nacos/v1/ns/instance`;
      const params = {
        ...this.getAuthParams(),
        serviceName: this.registeredService.serviceName,
        ip: this.registeredService.ip,
        port: this.registeredService.port.toString(),
        groupName: this.registeredService.groupName || 'DEFAULT_GROUP',
        clusterName: this.registeredService.clusterName || 'DEFAULT',
        ephemeral: 'true',
      };

      await firstValueFrom(this.httpService.delete(url, { params }));

      this.logger.log(`Service deregistered: ${this.registeredService.serviceName}`);
      this.registeredService = null;

      return true;
    } catch (error) {
      this.logger.error(`Failed to deregister service: ${error.message}`);
      return false;
    }
  }

  /**
   * 启动心跳
   */
  private startHeartbeat(options: ServiceRegistrationOptions): void {
    // 每 5 秒发送一次心跳
    this.heartbeatInterval = setInterval(async () => {
      try {
        const url = `${this.config.serverAddr}/nacos/v1/ns/instance/beat`;
        const params = {
          ...this.getAuthParams(),
          serviceName: options.serviceName,
          groupName: options.groupName || 'DEFAULT_GROUP',
          beat: JSON.stringify({
            ip: options.ip,
            port: options.port,
            serviceName: options.serviceName,
            cluster: options.clusterName || 'DEFAULT',
            weight: options.weight || 1,
          }),
        };

        await firstValueFrom(this.httpService.put(url, null, { params }));
      } catch (error) {
        this.logger.warn(`Heartbeat failed: ${error.message}`);
      }
    }, 5000);
  }

  /**
   * 获取服务实例列表
   */
  async getServiceInstances(options: ServiceDiscoveryOptions): Promise<ServiceInstance[]> {
    try {
      const url = `${this.config.serverAddr}/nacos/v1/ns/instance/list`;
      const params = {
        ...this.getAuthParams(),
        serviceName: options.serviceName,
        groupName: options.groupName || 'DEFAULT_GROUP',
        clusters: options.clusters || '',
        healthyOnly: (options.healthyOnly !== false).toString(),
      };

      const response = await firstValueFrom(this.httpService.get(url, { params }));
      const hosts = response.data.hosts || [];

      return hosts.map((host: any) => ({
        instanceId: host.instanceId,
        serviceName: options.serviceName,
        ip: host.ip,
        port: host.port,
        weight: host.weight,
        healthy: host.healthy,
        enabled: host.enabled,
        ephemeral: host.ephemeral,
        clusterName: host.clusterName,
        metadata: host.metadata || {},
      }));
    } catch (error) {
      this.logger.error(`Failed to get service instances: ${error.message}`);
      return [];
    }
  }

  /**
   * 获取一个健康的服务实例（负载均衡 - 加权随机）
   */
  async getOneHealthyInstance(serviceName: string, groupName?: string): Promise<ServiceInstance | null> {
    const instances = await this.getServiceInstances({
      serviceName,
      groupName,
      healthyOnly: true,
    });

    if (instances.length === 0) {
      return null;
    }

    // 加权随机选择
    const totalWeight = instances.reduce((sum, inst) => sum + inst.weight, 0);
    let random = Math.random() * totalWeight;

    for (const instance of instances) {
      random -= instance.weight;
      if (random <= 0) {
        return instance;
      }
    }

    return instances[0];
  }

  /**
   * 获取服务 URL
   */
  async getServiceUrl(serviceName: string, groupName?: string): Promise<string | null> {
    const instance = await this.getOneHealthyInstance(serviceName, groupName);
    if (!instance) {
      return null;
    }
    return `http://${instance.ip}:${instance.port}`;
  }
}


