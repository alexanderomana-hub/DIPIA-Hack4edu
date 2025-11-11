import React, { useState } from 'react';
import { BsGlobe, BsChevronDown } from 'react-icons/bs';
import { useTranslation } from './hooks_useTranslation';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { language, changeLanguage, languages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const currentLanguage = languages.find((lang) => lang.code === language);
  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };
  return (
    <div className="language-selector">
      <button className="language-button" onClick={() => setIsOpen(!isOpen)}>
        <BsGlobe className="globe-icon" />
        <span className="language-text">{currentLanguage?.flag} {currentLanguage?.name}</span>
        <BsChevronDown className={`chevron-icon ${isOpen ? 'open' : ''}`} />
      </button>
      {isOpen && (
        <div className="language-dropdown">
          {languages.map((lang) => (
            <button key={lang.code} className={`language-option ${language === lang.code ? 'active' : ''}`} onClick={() => handleLanguageChange(lang.code)}>
              <span className="flag">{lang.flag}</span>
              <span className="name">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

