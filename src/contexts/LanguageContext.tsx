'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKeys } from '@/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languageNames: Record<Language, string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language display names
const languageNames: Record<Language, string> = {
  en: 'English',
  fr: 'Français', 
  ar: 'العربية',
  hu: 'Magyar'
};

// Language codes for easier access
const languageCodes: Language[] = ['en', 'fr', 'ar', 'hu'];

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && languageCodes.includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Helper function to get nested translation
  const getNestedTranslation = (obj: any, path: string[]): string => {
    let current: any = obj;
    for (const key of path) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return path.join('.');
      }
    }
    return typeof current === 'string' ? current : path.join('.');
  };

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    return getNestedTranslation(translations[language], keys);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    languageNames
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export { languageNames, languageCodes };