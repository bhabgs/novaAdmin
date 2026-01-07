import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * 内部 API 认证守卫
 * 
 * 用于保护微服务之间的内部调用
 * 通过检查请求头中的内部 API Key 来验证
 */
@Injectable()
export class InternalApiGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const internalApiKey = this.configService.get<string>('INTERNAL_API_KEY');
    
    // 如果没有配置内部 API Key，则不启用保护
    if (!internalApiKey) {
      return true;
    }

    const providedKey = request.headers['x-internal-api-key'];
    
    if (providedKey !== internalApiKey) {
      throw new UnauthorizedException('Invalid internal API key');
    }

    return true;
  }
}

