import { useState, useEffect } from 'react';
import { useTranslation as useTranslationUtil, Locale, setLocale, autoDetectLocale } from '../utils/i18n';

export function useI18n() {
  const [locale, setLocaleState] = useState<Locale>('ru');
  const translation = useTranslationUtil();

  useEffect(() => {
    // Автоопределение языка при монтировании
    const detected = autoDetectLocale();
    setLocale(detected);
    setLocaleState(detected);
  }, []);

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    setLocaleState(newLocale);
  };

  return {
    t: translation.t,
    locale,
    setLocale: changeLocale,
  };
}

export { useTranslationUtil as useTranslation };
