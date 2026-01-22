import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

import ar from './ar.json';
import en from './en.json';

const resources = {
  ar: { translation: ar },
  en: { translation: en },
};

// Detect if device language is Arabic
const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'ar';
const isArabic = deviceLanguage === 'ar';

// Default to Arabic for this app
const defaultLanguage = 'ar';

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  fallbackLng: 'en',
  compatibilityJSON: 'v4',
  interpolation: {
    escapeValue: false,
  },
});

// Configure RTL based on language
export const configureRTL = (language: string) => {
  const isRTL = language === 'ar';
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }
};

// Initial RTL configuration
configureRTL(defaultLanguage);

export const changeLanguage = async (language: 'ar' | 'en') => {
  await i18n.changeLanguage(language);
  configureRTL(language);
};

export const getCurrentLanguage = () => i18n.language as 'ar' | 'en';

export const isRTL = () => I18nManager.isRTL;

export default i18n;
