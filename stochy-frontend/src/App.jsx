import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages - Auth (Login & Register are embedded inside AuthLayout flip card)
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

function RootRedirect() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
        <Router>
          <Routes>
            {/* Redirection par défaut */}
            <Route path="/" element={<RootRedirect />} />

            {/* Auth routes — /login & /register share the AuthLayout flip card */}
            <Route path="/login" element={<AuthLayout />} />
            <Route path="/register" element={<AuthLayout />} />

            {/* Forgot password — standalone minimal page */}
            <Route path="/forgot-password" element={
              <div className="min-h-screen flex items-center justify-center bg-[var(--page-bg)] p-4">
                <div className="w-full max-w-md rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-bg)]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                  <ForgotPasswordPage />
                </div>
              </div>
            } />

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
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Router>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
