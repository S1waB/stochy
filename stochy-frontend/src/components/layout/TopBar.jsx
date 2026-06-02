import { Bell, Menu, Sun, Moon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../common/Logo';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function TopBar({ title, onMenuClick }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { user, logout } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { theme, toggle } = useTheme();
  const { lang, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Menu size={20} /></button>
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Bell size={20} className="text-gray-600 dark:text-gray-200" />
            {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('notifications')}</span>
                {unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs text-[#2E5FA3] hover:underline">{t('markAllRead')}</button>}
              </div>
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-gray-400 dark:text-gray-300 text-center">{t('noNotifications')}</p>
              ) : notifications.map(n => (
                <div key={n.id} onClick={() => { markAsRead(n.id); setShowNotifs(false); }} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-50 dark:border-gray-700 last:border-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{n.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5 line-clamp-2">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Language switch */}
        <div className="flex items-center gap-2">
          <button onClick={() => setLanguage('en')} className={`px-2 py-1 rounded-md text-sm ${lang==='en' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>EN</button>
          <button onClick={() => setLanguage('fr')} className={`px-2 py-1 rounded-md text-sm ${lang==='fr' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>FR</button>
        </div>
        {/* Theme toggle */}
        <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-600" />}
        </button>
        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => setShowProfile(!showProfile)} className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2E5FA3] to-[#1A3C6E] text-white text-sm font-bold flex items-center justify-center">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </button>
          {showProfile && (
            <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2">
              <button onClick={() => { navigate('/profile'); setShowProfile(false); }} className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">{t('viewProfile')}</button>
              <button onClick={() => { logout(); navigate('/login'); }} className="w-full px-4 py-2 text-sm text-left text-red-500 hover:bg-red-50">{t('logout')}</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
