import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n, { SUPPORTED_LANGUAGES, LanguageCode } from '../locales';
import { languageStore } from '../locales/languageStore';

const LANGUAGE_STORAGE_KEY = 'language';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => Promise<void>;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  supportedLanguages: SUPPORTED_LANGUAGES,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const deviceLang = (Localization.getLocales()[0]?.languageCode ?? 'en') as LanguageCode;
  const defaultLang = SUPPORTED_LANGUAGES.some((l) => l.code === deviceLang) ? deviceLang : 'en';

  const [language, setLanguageState] = useState<LanguageCode>(defaultLang);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((stored) => {
      if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
        const code = stored as LanguageCode;
        setLanguageState(code);
        i18n.changeLanguage(code);
        languageStore.set(code);
      }
    });
  }, []);

  const setLanguage = async (code: LanguageCode) => {
    setLanguageState(code);
    await i18n.changeLanguage(code);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    languageStore.set(code);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
