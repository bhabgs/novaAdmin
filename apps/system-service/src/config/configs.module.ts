import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from './config.entity';
import { ConfigsService } from './configs.service';
import { ConfigsController } from './configs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Config])],
  controllers: [ConfigsController],
  providers: [ConfigsService],
  exports: [ConfigsService],
})
export class ConfigsModule {}
