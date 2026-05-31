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
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6"><Outlet /></main>
      </div>
    </div>
  );
}
