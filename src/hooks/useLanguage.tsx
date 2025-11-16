import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  const currentLanguage = i18n.language || 'ar';
  const isRTL = currentLanguage === 'ar';

  const changeLanguage = useCallback((lng: string) => {
    i18n.changeLanguage(lng);
  }, [i18n]);

  const toggleLanguage = useCallback(() => {
    const newLang = currentLanguage === 'ar' ? 'en' : 'ar';
    changeLanguage(newLang);
  }, [currentLanguage, changeLanguage]);

  return {
    currentLanguage,
    isRTL,
    changeLanguage,
    toggleLanguage,
    t,
  };
};

export default useLanguage;