import { Controller, All, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthServiceProxy } from './service-proxies/auth-service.proxy';
import { RbacServiceProxy } from './service-proxies/rbac-service.proxy';
import { I18nServiceProxy } from './service-proxies/i18n-service.proxy';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Gateway')
@Controller()
export class ProxyController {
  constructor(
    private authProxy: AuthServiceProxy,
    private rbacProxy: RbacServiceProxy,
    private i18nProxy: I18nServiceProxy,
  ) {}

  /**
   * 转发到 Auth Service
   * 路由: /api/auth/*
   */
  @Public() // 登录接口公开
  @All('auth/login')
  @ApiOperation({ summary: '用户登录（转发到 Auth Service）' })
  async authLogin(@Req() req: Request, @Res() res: Response) {
    return this.authProxy.forward('/login', req, res);
  }

  @Public() // 重置密码接口公开
  @All('auth/reset-password')
  @ApiOperation({ summary: '重置密码（转发到 Auth Service）' })
  async authResetPassword(@Req() req: Request, @Res() res: Response) {
    return this.authProxy.forward('/reset-password', req, res);
  }

  @All('auth/:path*')
  @ApiBearerAuth()
  @ApiOperation({ summary: '认证服务代理' })
  async forwardToAuth(@Req() req: Request, @Res() res: Response) {
    // 提取路径，去掉 /api/auth 前缀
    const path = req.url.replace(/^\/api\/auth/, '') || '/';
    return this.authProxy.forward(path, req, res);
  }

  /**
   * 转发到 RBAC Service
   * 路由: /api/users/*, /api/roles/*, /api/menus/*
   */
  @All('users/:path*')
  @ApiBearerAuth()
  @ApiOperation({ summary: '用户管理（转发到 RBAC Service）' })
  async forwardToUsers(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace(/^\/api/, '') || '/users';
    return this.rbacProxy.forward(path, req, res);
  }

  @All('roles/:path*')
  @ApiBearerAuth()
  @ApiOperation({ summary: '角色管理（转发到 RBAC Service）' })
  async forwardToRoles(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace(/^\/api/, '') || '/roles';
    return this.rbacProxy.forward(path, req, res);
  }

  @All('menus/:path*')
  @ApiBearerAuth()
  @ApiOperation({ summary: '菜单管理（转发到 RBAC Service）' })
  async forwardToMenus(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace(/^\/api/, '') || '/menus';
    return this.rbacProxy.forward(path, req, res);
  }

  /**
   * 转发到 I18n Service
   * 路由: /api/i18n/*, /api/i18n-modules/*
   */
  @All('i18n/:path*')
  @ApiBearerAuth()
  @ApiOperation({ summary: '国际化条目（转发到 I18n Service）' })
  async forwardToI18n(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace(/^\/api/, '') || '/i18n';
    return this.i18nProxy.forward(path, req, res);
  }

  @All('i18n-modules/:path*')
  @ApiBearerAuth()
  @ApiOperation({ summary: '国际化模块（转发到 I18n Service）' })
  async forwardToI18nModules(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace(/^\/api/, '') || '/i18n-modules';
    return this.i18nProxy.forward(path, req, res);
  }
}

