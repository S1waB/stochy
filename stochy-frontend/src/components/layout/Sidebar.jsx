import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, ArrowLeftRight, PieChart, Wallet, Target, Landmark, CreditCard, TrendingUp, User, Users, BarChart3, LogOut, X } from 'lucide-react';

const userLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/budget', icon: PieChart, label: 'Budget' },
  { to: '/savings', icon: Wallet, label: 'Épargne' },
  { to: '/goals', icon: Target, label: 'Objectifs' },
  { to: '/loans', icon: Landmark, label: 'Prêts' },
  { to: '/debts', icon: CreditCard, label: 'Dettes' },
  { to: '/forecast', icon: TrendingUp, label: 'Prévisions' },
  { to: '/profile', icon: User, label: 'Profil' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: BarChart3, label: 'Dashboard Admin' },
  { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-[#071428]/95 border-r border-white/10 z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-3xl bg-gradient-to-br from-accent to-[#d38604] flex items-center justify-center text-white font-extrabold text-lg">S</div>
            <span className="text-xl font-bold text-white tracking-tight">STOCHY</span>
          </div>
          <button onClick={onClose} className="lg:hidden rounded-2xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"><X size={20} /></button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Menu</p>
          {userLinks.map(link => (
            <NavLink key={link.to} to={link.to} className={linkClass} onClick={onClose}>
              <link.icon size={18} />{link.label}
            </NavLink>
          ))}
          {isAdmin && (
            <>
              <div className="my-4 border-t border-white/10" />
              <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Admin</p>
              {adminLinks.map(link => (
                <NavLink key={link.to} to={link.to} className={linkClass} onClick={onClose}>
                  <link.icon size={18} />{link.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 rounded-3xl bg-white/5 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white text-sm font-bold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/20">
            <LogOut size={18} />Se déconnecter
          </button>
        </div>
      </aside>
    </>
  );
}
