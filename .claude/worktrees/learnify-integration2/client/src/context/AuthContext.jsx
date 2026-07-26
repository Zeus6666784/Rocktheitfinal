import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/auth';

/**
 * AuthContext - holds the signed-in user + JWT token.
 * Persists to localStorage via authService. Auto-loads on mount.
 *
 * Shape mirrors docs/DATABASE.md users collection.
 */
const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  login: () => Promise.resolve(null),
  register: () => Promise.resolve(null),
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [token, setToken] = useState(() => authService.getToken());

  useEffect(() => {
    // If we have a token but no fresh user data, refresh from /auth/me.
    if (token && !user) {
      authService
        .getMe()
        .then((data) => setUser(data?.user ?? null))
        .catch(() => {
          authService.clearAuth();
          setUser(null);
          setToken(null);
        });
    }
  }, [token, user]);

  const login = useCallback(async (creds) => {
    const data = await authService.login(creds);
    setUser(data?.user ?? null);
    setToken(data?.token ?? null);
    return data;
  }, []);

  const register = useCallback(async (creds) => {
    const data = await authService.register(creds);
    setUser(data?.user ?? null);
    setToken(data?.token ?? null);
    return data;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      setUser,
    }),
    [user, token, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
