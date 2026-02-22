import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { AppLanguage } from '../types';
import { DEFAULT_LANGUAGE, translations } from '../i18n/translations';
import { appStorage } from '../services/storage';

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: (path: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<AppLanguage>(DEFAULT_LANGUAGE);

  useEffect(() => {
    appStorage.getLanguage().then(setLanguageState).catch(() => {});
  }, []);

  const setLanguage = async (next: AppLanguage) => {
    const lang: AppLanguage = next === 'en' ? 'en' : 'ru';
    setLanguageState(lang);
    await appStorage.setLanguage(lang);
  };

  const t = (path: string) => {
    const parts = path.split('.');
    let current: unknown = translations[language];
    for (const part of parts) {
      if (typeof current === 'object' && current !== null) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return path;
      }
    }
    return typeof current === 'string' ? current : path;
  };

  const value = useMemo(() => ({ language, setLanguage, t }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
