import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProxyModule } from './proxy/proxy.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env.development' }),
    AuthModule,
    ProxyModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
