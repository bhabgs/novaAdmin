import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { NacosService } from "../nacos/nacos.service";

/**
 * 微服务 HTTP 客户端
 *
 * 通过服务发现获取服务地址，然后发起 HTTP 请求
 */
@Injectable()
export class ServiceClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly nacosService: NacosService
  ) {}

  /**
   * 通过服务名调用服务
   */
  async callService<T = any>(
    serviceName: string,
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    path: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    // 从 Nacos 获取服务地址
    const baseUrl = await this.nacosService.getServiceUrl(serviceName);

    if (!baseUrl) {
      throw new Error(`Service ${serviceName} not found`);
    }

    const url = `${baseUrl}${path}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    let response;
    switch (method) {
      case "GET":
        response = await firstValueFrom(this.httpService.get(url, config));
        break;
      case "POST":
        response = await firstValueFrom(
          this.httpService.post(url, data, config)
        );
        break;
      case "PUT":
        response = await firstValueFrom(
          this.httpService.put(url, data, config)
        );
        break;
      case "DELETE":
        response = await firstValueFrom(this.httpService.delete(url, config));
        break;
      case "PATCH":
        response = await firstValueFrom(
          this.httpService.patch(url, data, config)
        );
        break;
    }

    return response.data;
  }
}
