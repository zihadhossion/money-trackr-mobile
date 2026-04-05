import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './en';
import bn from './bn';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'bn', label: 'বাংলা' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'en';
const defaultLang = SUPPORTED_LANGUAGES.some((l) => l.code === deviceLang) ? deviceLang : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      bn: { translation: bn },
    },
    lng: defaultLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  });

export default i18n;
