'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

interface ReCaptchaProviderProps {
  children: React.ReactNode;
}

export default function ReCaptchaProvider({ children }: ReCaptchaProviderProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  console.log('🔍 ReCaptchaProvider: Site key available:', !!siteKey);
  console.log('🔍 ReCaptchaProvider: Site key value:', siteKey);
  
  if (!siteKey) {
    console.warn('❌ NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set');
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
      {children}
    </GoogleReCaptchaProvider>
  );
}