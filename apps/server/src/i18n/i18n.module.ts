import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nController } from './i18n.controller';
import { I18nService } from './i18n.service';
import { I18n } from './entities/i18n.entity';
import { I18nModule as I18nModuleEntity } from '../i18n-modules/entities/i18n-module.entity';
import { I18nModulesModule } from '../i18n-modules/i18n-modules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([I18n, I18nModuleEntity]),
    I18nModulesModule,
  ],
  controllers: [I18nController],
  providers: [I18nService],
  exports: [I18nService],
})
export class I18nModule {}

