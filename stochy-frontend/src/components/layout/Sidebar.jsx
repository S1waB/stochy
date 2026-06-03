import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Logo from '../common/Logo';
import { LayoutDashboard, ArrowLeftRight, PieChart, Wallet, Target, Landmark, CreditCard, TrendingUp, User, Users, BarChart3, LogOut, X } from 'lucide-react';

const userLinks = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, labelKey: 'transactions' },
  { to: '/budget', icon: PieChart, labelKey: 'budget' },
  { to: '/savings', icon: Wallet, labelKey: 'savings' },
  { to: '/goals', icon: Target, labelKey: 'goals' },
  { to: '/loans', icon: Landmark, labelKey: 'loans' },
  { to: '/debts', icon: CreditCard, labelKey: 'debts' },
  { to: '/forecast', icon: TrendingUp, labelKey: 'forecast' },
  { to: '/profile', icon: User, labelKey: 'profile' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: BarChart3, labelKey: 'adminDashboard' },
  { to: '/admin/users', icon: Users, labelKey: 'users' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin, logout, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-[var(--surface-muted)] text-[var(--text-color)]' : 'text-[var(--text-color)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-color)]'}`;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-[var(--surface-bg)]/95 border-r border-[var(--surface-border)] z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-[var(--surface-border)]">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <span className="text-xl font-bold text-[var(--text-color)] tracking-tight">STOCHY</span>
          </div>
          <button onClick={onClose} className="lg:hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-2 text-[var(--text-color)] transition hover:bg-[var(--surface-border)]/50"><X size={20} /></button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto">
          {!isAdmin ? (
            <>
              <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-color)]/70">{t('menu')}</p>
              {userLinks.map(link => (
                <NavLink key={link.to} to={link.to} className={linkClass} onClick={onClose}>
                  <link.icon size={18} />{t(link.labelKey)}
                </NavLink>
              ))}
            </>
          ) : (
            <>
              <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-color)]/70">{t('admin')}</p>
              {adminLinks.map(link => (
                <NavLink key={link.to} to={link.to} className={linkClass} onClick={onClose}>
                  <link.icon size={18} />{t(link.labelKey)}
                </NavLink>
              ))}
              <div className="my-4 border-t border-[var(--surface-border)]" />
              <NavLink to="/profile" className={linkClass} onClick={onClose}>
                <User size={18} />{t('profile')}
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-[var(--surface-border)]">
          <div className="flex items-center gap-3 rounded-3xl bg-[var(--surface-muted)] p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-border)] text-[var(--text-color)] text-sm font-bold overflow-hidden border border-[var(--surface-border)]">
              {user?.profilePicUrl ? (
                <img src={`http://localhost:8080${user.profilePicUrl}?t=${new Date().getTime()}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.email?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--text-color)]">{user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}</p>
              {user?.firstName && <p className="truncate text-xs text-[var(--text-color)]/70">{user?.email}</p>}
            </div>
          </div>
          <button onClick={handleLogout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/20">
            <LogOut size={18} />{t('logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
