let currentLanguage = 'en';

export const languageStore = {
  get: () => currentLanguage,
  set: (code: string) => { currentLanguage = code; },
};
