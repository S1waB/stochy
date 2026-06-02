import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const titles = {
  '/dashboard': 'Dashboard', '/transactions': 'Transactions', '/budget': 'Budget',
  '/savings': 'Épargne', '/goals': 'Objectifs', '/loans': 'Prêts', '/debts': 'Dettes',
  '/forecast': 'Prévisions', '/profile': 'Mon Profil',
  '/admin/dashboard': 'Dashboard Admin', '/admin/users': 'Gestion des utilisateurs'
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = titles[location.pathname] || 'STOCHY';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040812] text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-brand-light/10 blur-3xl" />
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute left-1/2 bottom-0 h-96 w-96 -translate-x-1/2 rounded-full bg-[#ec4899]/10 blur-3xl" />
      </div>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-72 relative z-10">
        <TopBar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
