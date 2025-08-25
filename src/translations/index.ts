import { en } from './en';
import { fr } from './fr';
import { ar } from './ar';
import { hu } from './hu';

export const translations = {
  en,
  fr,
  ar,
  hu
};

export type Language = keyof typeof translations;
export type TranslationKeys = typeof en;

export { en, fr, ar, hu };