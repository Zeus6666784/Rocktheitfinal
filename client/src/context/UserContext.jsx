import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { getToken, clearToken, getSession } from '../services/auth.js';

const UserContext = createContext({
  user: null,
  setUser: () => {},
  signOut: () => {},
  isAdmin: false,
  isHydrating: true,
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const token = getToken();
    let active = true;
    if (!token) {
      setIsHydrating(false);
      return () => { active = false; };
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expired = typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
      if (expired || !payload.sub) {
        clearToken();
        setIsHydrating(false);
        return () => { active = false; };
      }
    } catch {
      clearToken();
      setIsHydrating(false);
      return () => { active = false; };
    }
    getSession()
      .then(({ user: sessionUser }) => { if (active) setUser(sessionUser); })
      .catch(() => { if (active) clearToken(); })
      .finally(() => { if (active) setIsHydrating(false); });
    return () => { active = false; };
  }, []);

  const signOut = useCallback(() => { clearToken(); setUser(null); }, []);

  const value = useMemo(() => ({
    user,
    setUser,
    signOut,
    isAdmin: user?.role === 'admin',
    isHydrating,
  }), [user, signOut, isHydrating]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
