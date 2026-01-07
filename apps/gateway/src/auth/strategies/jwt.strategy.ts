import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { NacosService } from '@nova-admin/shared';

export interface JwtPayload {
  sub: string;
  username: string;
}

/**
 * JWT 策略
 * 
 * Gateway 只验证 Token 是否有效，不查询用户信息
 * 如果需要用户信息，可以通过调用 Auth Service 获取
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private nacosService: NacosService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET 环境变量未配置！请在 .env 文件中设置安全的 JWT_SECRET',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    // Gateway 只验证 Token 是否有效，返回 payload 即可
    // 如果需要验证用户状态，可以调用 Auth Service
    return payload;
  }

  /**
   * 验证 Token 是否有效（可选：调用 Auth Service 验证）
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      // 从 Nacos 获取 Auth Service 地址
      const authServiceUrl = await this.nacosService.getServiceUrl('auth-service');
      if (!authServiceUrl) {
        // 如果服务未注册，只验证 JWT 签名
        return true;
      }

      // 调用 Auth Service 验证 Token
      const response = await firstValueFrom(
        this.httpService.get(`${authServiceUrl}/auth/verify-token`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      return response.data?.valid === true;
    } catch {
      // 验证失败，返回 false
      return false;
    }
  }
}

