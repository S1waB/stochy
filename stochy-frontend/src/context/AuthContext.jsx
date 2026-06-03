import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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

  const fetchProfileDetails = async (authToken) => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/users/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(res.data);
    } catch {
      const decoded = parseJwt(authToken);
      if (decoded) {
        setUser({ id: decoded.sub, email: decoded.email, role: decoded.role, mustChangePassword: decoded.mustChangePassword });
      }
    }
  };

  useEffect(() => {
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        fetchProfileDetails(token);
      } else {
        logout();
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = (accessToken, userData) => {
    localStorage.setItem('stochy_token', accessToken);
    setToken(accessToken);
    if (userData) {
      setUser(userData);
    }
    fetchProfileDetails(accessToken);
  };

  const logout = () => {
    localStorage.removeItem('stochy_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (newFields) => {
    setUser(prev => prev ? { ...prev, ...newFields } : null);
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'ROLE_ADMIN';

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div></div>;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isAdmin, updateUser, refreshUser: () => fetchProfileDetails(token) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

