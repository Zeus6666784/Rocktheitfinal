import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { getToken, clearToken } from '../services/auth.js';

const UserContext = createContext({
  user: null,
  setUser: () => {},
  signOut: () => {},
  isAdmin: false,
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ id: payload.sub, role: payload.role || 'student' });
    } catch {
      clearToken();
    }
  }, []);

  const signOut = useCallback(() => { clearToken(); setUser(null); }, []);

  const value = useMemo(() => ({
    user,
    setUser,
    signOut,
    isAdmin: user?.role === 'admin',
  }), [user, signOut]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}