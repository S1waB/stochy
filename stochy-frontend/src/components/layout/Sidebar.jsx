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
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-[#1A3C6E] to-[#0F2847] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F0A500] to-[#E09000] flex items-center justify-center text-white font-extrabold text-lg">S</div>
            <span className="text-xl font-bold text-white tracking-tight">STOCHY</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-white/50 hover:text-white"><X size={20} /></button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Menu</p>
          {userLinks.map(link => (
            <NavLink key={link.to} to={link.to} className={linkClass} onClick={onClose}>
              <link.icon size={18} />{link.label}
            </NavLink>
          ))}
          {isAdmin && (
            <>
              <div className="my-4 border-t border-white/10" />
              <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Admin</p>
              {adminLinks.map(link => (
                <NavLink key={link.to} to={link.to} className={linkClass} onClick={onClose}>
                  <link.icon size={18} />{link.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/20 w-full transition-colors">
            <LogOut size={18} />Se déconnecter
          </button>
        </div>
      </aside>
    </>
  );
}
