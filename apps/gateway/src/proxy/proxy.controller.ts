import { Controller, All, Req, Res, HttpStatus } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Request, Response } from 'express';
import axios from 'axios';
import { Public } from '../auth/decorators/public.decorator';

const SERVICE_MAP: Record<string, string> = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  rbac: process.env.RBAC_SERVICE_URL || 'http://localhost:3002',
  system: process.env.SYSTEM_SERVICE_URL || 'http://localhost:3003',
};

@ApiExcludeController()
@Controller()
export class ProxyController {
  @All('auth/*')
  @Public()
  async proxyAuth(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res, 'auth');
  }

  @All('rbac/*')
  async proxyRbac(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res, 'rbac');
  }

  @All('system/*')
  async proxySystem(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res, 'system');
  }

  private async proxy(req: Request, res: Response, service: string) {
    const serviceUrl = SERVICE_MAP[service];
    const path = req.path.replace(`/api/${service}`, '');
    const url = `${serviceUrl}/api${path}`;

    try {
      const response = await axios({
        method: req.method as any,
        url,
        data: req.body,
        params: req.query,
        headers: {
          ...req.headers,
          host: undefined,
        },
        validateStatus: () => true,
      });
      res.status(response.status).json(response.data);
    } catch (error) {
      res.status(HttpStatus.BAD_GATEWAY).json({
        code: HttpStatus.BAD_GATEWAY,
        message: `Service ${service} unavailable`,
        data: null,
        timestamp: Date.now(),
      });
    }
  }
}
