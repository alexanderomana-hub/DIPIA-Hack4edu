import { useState, useEffect } from 'react';
import translations from './i18n/translations.json';

const ALLOWED_LANGS = ['es', 'en'];

export const useTranslation = () => {
  const [language, setLanguage] = useState('es');
  const [t, setT] = useState(translations.es);

  useEffect(() => {
    const saved = localStorage.getItem('dipia_language');
    const browser = navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es';
    const fromSaved = ALLOWED_LANGS.includes(saved) ? saved : null;
    const initial = fromSaved || browser;
    setLanguage(initial);
    setT(translations[initial] || translations.es);

    const handleLangChange = (e) => {
      const newLang = e.detail;
      if (ALLOWED_LANGS.includes(newLang)) {
        setLanguage(newLang);
        setT(translations[newLang]);
      }
    };
    window.addEventListener('dipia_language_changed', handleLangChange);
    return () => window.removeEventListener('dipia_language_changed', handleLangChange);
  }, []);

  const changeLanguage = (newLanguage) => {
    if (ALLOWED_LANGS.includes(newLanguage)) {
      localStorage.setItem('dipia_language', newLanguage);
      setLanguage(newLanguage);
      setT(translations[newLanguage]);
      try {
        window.dispatchEvent(new CustomEvent('dipia_language_changed', { detail: newLanguage }));
      } catch (_) {}
    }
  };

  const getTranslation = (key, fallback = '') => {
    const keys = key.split('.');
    let value = t;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) value = value[k]; else return fallback || key;
    }
    return value || fallback || key;
  };

  return {
    language,
    changeLanguage,
    t: getTranslation,
    languages: [
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ],
  };
};

