import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nModulesController } from './i18n-modules.controller';
import { I18nModulesService } from './i18n-modules.service';
import { I18nModule } from './entities/i18n-module.entity';

@Module({
  imports: [TypeOrmModule.forFeature([I18nModule])],
  controllers: [I18nModulesController],
  providers: [I18nModulesService],
  exports: [I18nModulesService],
})
export class I18nModulesModule {}

