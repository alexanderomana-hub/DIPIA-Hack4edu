import { useState, useEffect } from 'react';
import translations from '../i18n/translations.json';

export const useTranslation = () => {
  const [language, setLanguage] = useState('es');
  const [t, setT] = useState(translations.es);

  useEffect(() => {
    // Cargar idioma desde localStorage o detectar idioma del navegador
    const savedLanguage = localStorage.getItem('dipia_language') || 
                         (navigator.language.startsWith('en') ? 'en' : 
                          navigator.language.startsWith('pt') ? 'pt' : 'es');
    
    setLanguage(savedLanguage);
    setT(translations[savedLanguage] || translations.es);
  }, []);

  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
      setT(translations[newLanguage]);
      localStorage.setItem('dipia_language', newLanguage);
    }
  };

  const getTranslation = (key, fallback = '') => {
    const keys = key.split('.');
    let value = t;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }
    
    return value || fallback || key;
  };

  return {
    language,
    changeLanguage,
    t: getTranslation,
    languages: [
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'pt', name: 'Português', flag: '🇧🇷' }
    ]
  };
};
