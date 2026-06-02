import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    notifications: 'Notifications',
    markAllRead: 'Mark all read',
    noNotifications: 'No notifications',
    viewProfile: 'View profile',
    logout: 'Sign out'
  },
  fr: {
    notifications: 'Notifications',
    markAllRead: 'Tout marquer lu',
    noNotifications: 'Aucune notification',
    viewProfile: 'Voir profil',
    logout: 'Se déconnecter'
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('stochy_lang') || 'fr'; } catch { return 'fr'; }
  });

  const setLanguage = (l) => {
    setLang(l);
    try { localStorage.setItem('stochy_lang', l); } catch (e) {}
  };

  const t = (key) => translations[lang]?.[key] || translations['en'][key] || key;

  return <LanguageContext.Provider value={{ lang, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() { return useContext(LanguageContext); }

export default LanguageContext;
