import { createContext, useContext, useState, useEffect } from 'react';
import { getAccessToken, setTokens, removeTokens, getRefreshToken } from '../utils/token';
import { logoutAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = getAccessToken();
    if (token) {
      // Token exists, but we don't validate it here
      // The API will validate it on the next request
      // For now, we'll just set loading to false
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    setTokens(accessToken, refreshToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await logoutAPI(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeTokens();
      setUser(null);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

