import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { v4 as uuid } from 'uuid';

/**
 * 链路追踪拦截器
 * 为每个请求生成 traceId，便于日志追踪
 */
@Injectable()
export class TraceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // 如果请求头中没有 traceId，生成一个
    if (!request.headers['x-trace-id']) {
      request.headers['x-trace-id'] = uuid();
    }

    // 将 traceId 添加到响应头
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-Trace-Id', request.headers['x-trace-id']);

    return next.handle();
  }
}

