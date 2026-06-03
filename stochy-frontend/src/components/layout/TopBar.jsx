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
    <header className="sticky top-0 z-30 h-16 bg-[var(--surface-bg)]/95 backdrop-blur-xl border-b border-[var(--surface-border)] shadow-glow flex items-center justify-between px-6 text-[var(--text-color)]">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-2 text-[var(--text-color)] transition hover:bg-[var(--surface-border)]/50">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifs(!showNotifs)} className="relative rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-2 text-[var(--text-color)] transition hover:bg-[var(--surface-border)]/50">
            <Bell size={20} />
            {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-bg)]/95 p-2 shadow-glow backdrop-blur-xl text-[var(--text-color)]">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--surface-border)]">
                <span className="text-sm font-semibold">{t('notifications')}</span>
                {unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs text-accent hover:underline">{t('markAllRead')}</button>}
              </div>
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-slate-400 text-center">{t('noNotifications')}</p>
              ) : notifications.map(n => (
                <div key={n.id} onClick={() => { markAsRead(n.id); setShowNotifs(false); }} className="cursor-pointer border-b border-[var(--surface-border)] px-4 py-3 last:border-0 hover:bg-[var(--surface-muted)]">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLanguage('en')} className={`rounded-2xl px-3 py-1 text-sm transition ${lang === 'en' ? 'bg-[var(--surface-border)] text-[var(--text-color)]' : 'text-[var(--text-color)] hover:bg-[var(--surface-border)]/50'}`}>EN</button>
          <button onClick={() => setLanguage('fr')} className={`rounded-2xl px-3 py-1 text-sm transition ${lang === 'fr' ? 'bg-[var(--surface-border)] text-[var(--text-color)]' : 'text-[var(--text-color)] hover:bg-[var(--surface-border)]/50'}`}>FR</button>
        </div>
        <button onClick={toggle} className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-2 text-[var(--text-color)] transition hover:bg-[var(--surface-border)]/50">
          {theme === 'dark' ? <Sun size={18} className="text-yellow-300" /> : <Moon size={18} className="text-[var(--text-color)]" />}
        </button>
        <div className="relative" ref={profileRef}>
          <button onClick={() => setShowProfile(!showProfile)} className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-light to-brand-dark text-sm font-bold text-white overflow-hidden border border-[var(--surface-border)]">
            {user?.profilePicUrl ? (
              <img src={`http://localhost:8080${user.profilePicUrl}?t=${new Date().getTime()}`} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.email?.[0]?.toUpperCase() || 'U'
            )}
          </button>
          {showProfile && (
            <div className="absolute right-0 top-12 w-48 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-bg)]/95 p-2 shadow-glow backdrop-blur-xl text-[var(--text-color)]">
              <button onClick={() => { navigate('/profile'); setShowProfile(false); }} className="w-full rounded-2xl px-4 py-2 text-left text-sm hover:bg-[var(--surface-muted)]">{t('viewProfile')}</button>
              <button onClick={() => { logout(); navigate('/login'); }} className="w-full rounded-2xl px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10">{t('logout')}</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
