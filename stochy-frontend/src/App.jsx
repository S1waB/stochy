import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages - Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Pages - User
import DashboardPage from './pages/user/DashboardPage';
import TransactionsPage from './pages/user/TransactionsPage';
import BudgetsPage from './pages/user/BudgetsPage';
import SavingsPage from './pages/user/SavingsPage';
import GoalsPage from './pages/user/GoalsPage';
import LoansPage from './pages/user/LoansPage';
import DebtsPage from './pages/user/DebtsPage';
import ForecastPage from './pages/user/ForecastPage';
import ProfilePage from './pages/user/ProfilePage';

// Pages - Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';

function PrivateRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Redirection par défaut */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Routes d'authentification */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Routes privées utilisateur */}
            <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/budget" element={<BudgetsPage />} />
              <Route path="/savings" element={<SavingsPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/loans" element={<LoansPage />} />
              <Route path="/debts" element={<DebtsPage />} />
              <Route path="/forecast" element={<ForecastPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Routes d'administration */}
            <Route element={<PrivateRoute adminOnly={true}><AppLayout /></PrivateRoute>}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
            </Route>

            {/* Page non trouvée */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />
      </NotificationProvider>
    </AuthProvider>
  );
}
