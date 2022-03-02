import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-xhr-backend';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE } from './supported-languages.json';

export function extract(key: string, defaultValue: string) {
  return defaultValue || key;
}

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    load: 'languageOnly',
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
    react: {
      wait: true,
    },
    detection: {
      caches: ['cookie', 'localStorage'],
    },
  });

export default i18n;
