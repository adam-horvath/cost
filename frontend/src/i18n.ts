import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend'; // új backend
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE } from './supported-languages.json';

export function extract(key: string, defaultValue: string) {
  return defaultValue || key;
}

i18n
  .use(HttpBackend) // régi XHR backend helyett
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      // a JSON fájlok Vite alatt a public mappában lesznek
      loadPath: '/cost/locales/{{lng}}/{{ns}}.json',
    },
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false, // React automatikusan escaped
    },
    react: {
      useSuspense: true, // régi wait helyett useSuspense
    },
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
      caches: ['cookie', 'localStorage'],
    },
    debug: false,
  });

export default i18n;