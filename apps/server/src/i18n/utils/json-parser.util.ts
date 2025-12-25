import { I18nTranslation, Language } from '../entities/i18n-translation.entity';

export class JsonParser {
  /**
   * 将嵌套JSON转换为扁平数组（用于批量导入）
   * @param json 嵌套的JSON对象
   * @param language 语言代码
   * @returns 扁平化的翻译记录数组
   */
  static flattenJson(
    json: Record<string, any>,
    language: Language,
  ): Partial<I18nTranslation>[] {
    const result: Partial<I18nTranslation>[] = [];

    function flatten(obj: any, parentKey: string = '') {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;

        if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          // 递归处理嵌套对象
          flatten(value, fullKey);
        } else {
          // 到达叶子节点，拆分为module和key
          const [module, ...keyParts] = fullKey.split('.');

          // 如果只有一个部分，module和key都是它
          const translationKey = keyParts.length > 0 ? keyParts.join('.') : key;

          result.push({
            language,
            module,
            key: translationKey,
            value: String(value),
          });
        }
      }
    }

    flatten(json);
    return result;
  }

  /**
   * 将扁平数组转换为嵌套JSON（用于导出）
   * @param translations 翻译记录数组
   * @returns 嵌套的JSON对象（i18next兼容）
   */
  static unflattenJson(
    translations: I18nTranslation[],
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const item of translations) {
      const fullKey = `${item.module}.${item.key}`;
      this.setNestedValue(result, fullKey, item.value);
    }

    return result;
  }

  /**
   * 设置嵌套对象的值
   * @param obj 目标对象
   * @param path 路径（点分隔）
   * @param value 要设置的值
   */
  private static setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * 获取嵌套对象的值
   * @param obj 源对象
   * @param path 路径（点分隔）
   * @returns 值或undefined
   */
  static getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[key];
    }

    return current;
  }

  /**
   * 验证嵌套JSON的结构
   * @param json 要验证的JSON对象
   * @returns 是否有效
   */
  static validateJson(json: Record<string, any>): boolean {
    try {
      // 检查是否是对象
      if (typeof json !== 'object' || json === null) {
        return false;
      }

      // 递归检查所有叶子节点是否为字符串
      function validateNode(node: any): boolean {
        if (typeof node === 'string' || typeof node === 'number') {
          return true;
        }

        if (typeof node === 'object' && node !== null && !Array.isArray(node)) {
          return Object.values(node).every(validateNode);
        }

        return false;
      }

      return Object.values(json).every(validateNode);
    } catch (error) {
      return false;
    }
  }
}
