import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  IndicLangCode,
  SUPPORTED_LANGUAGES,
  UI_TRANSLATIONS,
  UIStrings,
  DEITY_NAMES_I18N,
} from './translations';
import { PORTAL_TRANSLATIONS, PortalStrings } from './portalTranslations';
import { DEITY_MANTRAS_I18N } from './deityDetailsTranslations';
import { DeityCardData } from '../data/deities';
import { loadPlayerName, savePlayerName, isDefaultDevoteeName } from '../utils/storage';

const LANG_STORAGE_KEY = 'divya_smarana_lang_v1';

export type CombinedUIStrings = UIStrings & PortalStrings;

interface I18nContextValue {
  lang: IndicLangCode;
  setLang: (code: IndicLangCode) => void;
  t: CombinedUIStrings;
  portal: PortalStrings;
  playerName: string;
  setPlayerName: (name: string) => void;
  getDeityName: (deity: DeityCardData) => string;
  getDeityMantra: (deity: DeityCardData) => string;
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

  const [playerName, setPlayerNameState] = useState<string>(() => loadPlayerName(lang));

  const setPlayerName = useCallback((name: string) => {
    setPlayerNameState(name);
    savePlayerName(name);
  }, []);

  const setLang = useCallback(
    (code: IndicLangCode) => {
      setLangState(code);
      try {
        localStorage.setItem(LANG_STORAGE_KEY, code);
      } catch {
        // ignore
      }

      // If current playerName is one of the default names or empty, update to the new language's default
      const defaultOption = SUPPORTED_LANGUAGES.find((l) => l.code === code);
      const newDefaultName = defaultOption ? defaultOption.defaultPlayer : 'Devotee';
      if (isDefaultDevoteeName(playerName)) {
        setPlayerNameState(newDefaultName);
        savePlayerName(newDefaultName);
      }
    },
    [playerName]
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const getDeityName = useCallback(
    (deity: DeityCardData) => {
      return DEITY_NAMES_I18N[deity.id]?.[lang] || deity.nameEn || deity.nameTe;
    },
    [lang]
  );

  const getDeityMantra = useCallback(
    (deity: DeityCardData) => {
      return DEITY_MANTRAS_I18N[deity.id]?.[lang] || deity.mantraEn || deity.mantraTe;
    },
    [lang]
  );

  const baseT = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.te;
  const portalT = PORTAL_TRANSLATIONS[lang] || PORTAL_TRANSLATIONS.te;

  const combinedT: CombinedUIStrings = {
    ...baseT,
    ...portalT,
  };

  const value: I18nContextValue = {
    lang,
    setLang,
    t: combinedT,
    portal: portalT,
    playerName,
    setPlayerName,
    getDeityName,
    getDeityMantra,
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
