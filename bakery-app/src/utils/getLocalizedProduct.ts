import { Language } from '../context/SettingsContext';

/**
 * Получает локализованное название и описание товара
 * @param product - объект товара из базы данных или локального массива
 * @param language - текущий язык приложения
 * @returns объект с переведенными name и description
 */
export const getLocalizedProduct = (product: any, language: Language) => {
  if (!product) {
    return {
      name: '',
      description: '',
    };
  }

  // Если язык русский, возвращаем основные поля
  if (language === 'ru') {
    return {
      name: product.name || product.title || '',
      description: product.description || '',
    };
  }

  // Формируем названия колонок для других языков
  const nameKey = `name_${language}`;
  const descKey = `description_${language}`;

  // Получаем базовые значения (fallback)
  const defaultName = product.name || product.title || '';
  const defaultDesc = product.description || '';

  return {
    // Пытаемся взять перевод. Если его нет (null/undefined) — берем русский (fallback)
    name: product[nameKey] || defaultName,
    description: product[descKey] || defaultDesc,
  };
};

/**
 * Получает локализованное название товара (короткая версия)
 */
export const getProductName = (product: any, language: Language): string => {
  if (language === 'ru') return product.name;
  const nameKey = `name_${language}`;
  return product[nameKey] || product.name;
};

/**
 * Получает локализованное описание товара (короткая версия)
 */
export const getProductDescription = (product: any, language: Language): string => {
  if (language === 'ru') return product.description;
  const descKey = `description_${language}`;
  return product[descKey] || product.description;
};
