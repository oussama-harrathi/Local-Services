'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';
import { LoadingOverlay } from '@/components/ui/LoadingSpinner';

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  const { language, isLoading } = useLanguage();

  useEffect(() => {
    const isRTL = language === 'ar';
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.body.className = document.body.className.replace(/\b(rtl|ltr)\b/g, '') + ` ${isRTL ? 'rtl' : 'ltr'}`;
  }, [language]);

  return (
    <>
      {children}
      {isLoading && (
        <LoadingOverlay isVisible={isLoading} text="Loading..." />
      )}
    </>
  );
}