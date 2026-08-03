/**
 * ЛОКАЛИЗАЦИЯ (RU / EN)
 */

import ru from '../locales/ru.json';
import en from '../locales/en.json';

export type Locale = 'ru' | 'en';

export const translations: Record<Locale, Record<string, string>> = {
  ru,
  en,
};

let currentLocale: Locale = 'ru';

/**
 * Устанавливает текущий язык
 */
export function setLocale(locale: Locale): void {
  if (translations[locale]) {
    currentLocale = locale;
  }
}

/**
 * Получает текущий язык
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Автоопределение языка из браузера / SDK
 */
export function autoDetectLocale(): Locale {
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith('ru')) return 'ru';
    if (lang.startsWith('en')) return 'en';
  }
  return 'ru';
}

/**
 * Получает перевод по ключу
 */
export function t(key: string): string {
  return translations[currentLocale][key] || translations.ru[key] || key;
}

/**
 * Хук для использования в React компонентах
 */
export function useTranslation() {
  return {
    t: (key: string) => translations[currentLocale][key] || translations.ru[key] || key,
    locale: currentLocale,
    setLocale,
  };
}
