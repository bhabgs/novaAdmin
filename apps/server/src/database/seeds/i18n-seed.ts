import { Repository } from 'typeorm';
import { I18nTranslation, Language } from '../../i18n/entities/i18n-translation.entity';
import { JsonParser } from '../../i18n/utils/json-parser.util';

// 导入现有的JSON文件
const zhCN = require('../../../../web/src/i18n/locales/zh-CN.json');
const enUS = require('../../../../web/src/i18n/locales/en-US.json');
const arSA = require('../../../../web/src/i18n/locales/ar-SA.json');

/**
 * 种子脚本：将现有JSON文件导入数据库
 * 运行命令：pnpm --filter @nova-admin/server seed
 */
export async function seedI18nTranslations(
  repository: Repository<I18nTranslation>,
): Promise<void> {
  console.log('🌍 Starting i18n translations seed...');

  const languageData = [
    { language: Language.ZH_CN, data: zhCN, name: '中文' },
    { language: Language.EN_US, data: enUS, name: 'English' },
    { language: Language.AR_SA, data: arSA, name: 'العربية' },
  ];

  for (const { language, data, name } of languageData) {
    console.log(`\n📝 Importing ${name} translations...`);

    try {
      // 扁平化JSON数据
      const flatData = JsonParser.flattenJson(data, language);

      let created = 0;
      let skipped = 0;

      for (const item of flatData) {
        try {
          // 检查是否已存在
          const existing = await repository.findOne({
            where: {
              language: item.language,
              module: item.module,
              key: item.key,
            },
          });

          if (!existing) {
            await repository.save(item);
            created++;
          } else {
            skipped++;
          }
        } catch (error) {
          console.error(
            `   ❌ Error importing ${item.module}.${item.key}:`,
            error.message,
          );
        }
      }

      console.log(
        `   ✅ ${name}: Created ${created}, Skipped ${skipped} (already exists)`,
      );
    } catch (error) {
      console.error(`   ❌ Error processing ${name}:`, error.message);
    }
  }

  console.log('\n✨ I18n translations seed completed!');
}

/**
 * 清理所有翻译（仅用于开发）
 */
export async function cleanI18nTranslations(
  repository: Repository<I18nTranslation>,
): Promise<void> {
  console.log('🗑️  Cleaning i18n translations...');
  await repository.delete({});
  console.log('✅ All translations deleted');
}
