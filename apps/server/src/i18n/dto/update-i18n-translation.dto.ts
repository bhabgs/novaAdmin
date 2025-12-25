import { PartialType } from '@nestjs/swagger';
import { CreateI18nTranslationDto } from './create-i18n-translation.dto';

export class UpdateI18nTranslationDto extends PartialType(
  CreateI18nTranslationDto,
) {}
