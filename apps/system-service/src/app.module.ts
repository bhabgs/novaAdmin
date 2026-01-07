import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigsModule } from './config/configs.module';
import { I18nModule } from './i18n/i18n.module';
import { LogsModule } from './logs/logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env.development' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'nova_admin'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ConfigsModule,
    I18nModule,
    LogsModule,
  ],
})
export class AppModule {}
