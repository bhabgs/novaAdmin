/**
 * Nacos 配置选项
 */
export interface NacosConfig {
  /** Nacos 服务器地址 */
  serverAddr: string;
  /** 命名空间 ID */
  namespace?: string;
  /** 用户名 */
  username?: string;
  /** 密码 */
  password?: string;
}

/**
 * 服务注册选项
 */
export interface ServiceRegistrationOptions {
  /** 服务名称 */
  serviceName: string;
  /** 服务 IP */
  ip: string;
  /** 服务端口 */
  port: number;
  /** 分组名称 */
  groupName?: string;
  /** 集群名称 */
  clusterName?: string;
  /** 权重 */
  weight?: number;
  /** 是否健康 */
  healthy?: boolean;
  /** 是否启用 */
  enabled?: boolean;
  /** 是否临时实例 */
  ephemeral?: boolean;
  /** 元数据 */
  metadata?: Record<string, string>;
}

/**
 * 服务实例信息
 */
export interface ServiceInstance {
  instanceId: string;
  serviceName: string;
  ip: string;
  port: number;
  weight: number;
  healthy: boolean;
  enabled: boolean;
  ephemeral: boolean;
  clusterName: string;
  metadata: Record<string, string>;
}

/**
 * 服务发现选项
 */
export interface ServiceDiscoveryOptions {
  serviceName: string;
  groupName?: string;
  clusters?: string;
  healthyOnly?: boolean;
}
