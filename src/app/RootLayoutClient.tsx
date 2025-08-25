'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  const { language } = useLanguage();

  useEffect(() => {
    const isRTL = language === 'ar';
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.body.className = document.body.className.replace(/\b(rtl|ltr)\b/g, '') + ` ${isRTL ? 'rtl' : 'ltr'}`;
  }, [language]);

  return <>{children}</>;
}