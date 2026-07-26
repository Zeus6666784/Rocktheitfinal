import { createContext, useContext, useMemo, useState } from 'react';

/**
 * User context. Stub for now - real auth is Dev 2's.
 * Shape mirrors docs/DATABASE.md users collection.
 */
const UserContext = createContext({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(
    () => ({ user, setUser, isAuthenticated: Boolean(user) }),
    [user],
  );
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
