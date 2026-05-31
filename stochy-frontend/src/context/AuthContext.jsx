import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('stochy_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser({ id: decoded.sub, email: decoded.email, role: decoded.role, mustChangePassword: decoded.mustChangePassword });
      } else {
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = (accessToken, userData) => {
    localStorage.setItem('stochy_token', accessToken);
    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('stochy_token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'ROLE_ADMIN';

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div></div>;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
