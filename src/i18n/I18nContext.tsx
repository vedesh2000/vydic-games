import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  IndicLangCode,
  SUPPORTED_LANGUAGES,
  UI_TRANSLATIONS,
  UIStrings,
  DEITY_NAMES_I18N,
} from './translations';
import { DeityCardData } from '../data/deities';

const LANG_STORAGE_KEY = 'divya_smarana_lang_v1';

interface I18nContextValue {
  lang: IndicLangCode;
  setLang: (code: IndicLangCode) => void;
  t: UIStrings;
  getDeityName: (deity: DeityCardData) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<IndicLangCode>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY) as IndicLangCode | null;
      if (saved && UI_TRANSLATIONS[saved]) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'te';
  });

  const setLang = useCallback((code: IndicLangCode) => {
    setLangState(code);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, code);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const getDeityName = useCallback(
    (deity: DeityCardData) => {
      return DEITY_NAMES_I18N[deity.id]?.[lang] || deity.nameTe;
    },
    [lang]
  );

  const value: I18nContextValue = {
    lang,
    setLang,
    t: UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.te,
    getDeityName,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}

export { SUPPORTED_LANGUAGES };
