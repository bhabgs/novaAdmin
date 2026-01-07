import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { NacosService } from '@nova-admin/shared';

/**
 * RBAC Service 代理
 */
@Injectable()
export class RbacServiceProxy {
  private readonly serviceName = 'rbac-service';

  constructor(
    private readonly httpService: HttpService,
    private readonly nacosService: NacosService,
  ) {}

  /**
   * 转发请求到 RBAC Service
   */
  async forward(path: string, req: Request, res: Response): Promise<void> {
    const baseUrl = await this.nacosService.getServiceUrl(this.serviceName);
    if (!baseUrl) {
      res.status(503).json({
        success: false,
        message: `Service ${this.serviceName} not available`,
      });
      return;
    }

    const url = `${baseUrl}${path}`;
    await this.proxyRequest(url, req, res);
  }

  /**
   * 代理 HTTP 请求
   */
  private async proxyRequest(url: string, req: Request, res: Response): Promise<void> {
    try {
      const method = req.method.toLowerCase();
      const headers = {
        ...req.headers,
        host: undefined,
      };

      const response = await firstValueFrom(
        this.httpService.request({
          method: method as any,
          url,
          headers,
          data: req.body,
          params: req.query,
          responseType: 'json',
        }),
      );

      res.status(response.status).json(response.data);
    } catch (error: any) {
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({
          success: false,
          message: error.message || 'Internal server error',
        });
      }
    }
  }
}

