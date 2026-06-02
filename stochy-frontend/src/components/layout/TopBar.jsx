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
    <header className="sticky top-0 z-30 h-16 bg-[#071828]/90 backdrop-blur-xl border-b border-white/10 shadow-glow flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden rounded-2xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <h1 className="text-lg font-semibold text-white">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifs(!showNotifs)} className="relative rounded-2xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10">
            <Bell size={20} />
            {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 rounded-2xl border border-white/10 bg-[#05101f]/95 p-2 shadow-glow backdrop-blur-xl">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <span className="text-sm font-semibold text-white">{t('notifications')}</span>
                {unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs text-accent hover:underline">{t('markAllRead')}</button>}
              </div>
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-slate-400 text-center">{t('noNotifications')}</p>
              ) : notifications.map(n => (
                <div key={n.id} onClick={() => { markAsRead(n.id); setShowNotifs(false); }} className="cursor-pointer border-b border-white/10 px-4 py-3 last:border-0 hover:bg-white/5">
                  <p className="text-sm font-medium text-white">{n.title}</p>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLanguage('en')} className={`rounded-2xl px-3 py-1 text-sm transition ${lang === 'en' ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/10'}`}>EN</button>
          <button onClick={() => setLanguage('fr')} className={`rounded-2xl px-3 py-1 text-sm transition ${lang === 'fr' ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/10'}`}>FR</button>
        </div>
        <button onClick={toggle} className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10">
          {theme === 'dark' ? <Sun size={18} className="text-yellow-300" /> : <Moon size={18} className="text-white" />}
        </button>
        <div className="relative" ref={profileRef}>
          <button onClick={() => setShowProfile(!showProfile)} className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-light to-brand-dark text-sm font-bold text-white">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </button>
          {showProfile && (
            <div className="absolute right-0 top-12 w-48 rounded-2xl border border-white/10 bg-[#05101f]/95 p-2 shadow-glow backdrop-blur-xl">
              <button onClick={() => { navigate('/profile'); setShowProfile(false); }} className="w-full rounded-2xl px-4 py-2 text-left text-sm text-white hover:bg-white/5">{t('viewProfile')}</button>
              <button onClick={() => { logout(); navigate('/login'); }} className="w-full rounded-2xl px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10">{t('logout')}</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
