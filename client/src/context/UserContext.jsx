import { createContext, useContext, useMemo, useState, useCallback } from 'react';

/**
 * UserContext (demo).
 * No auth — the demo runs anonymously. The shape matches what the rest
 * of the app expects so swapping in real auth later is a one-place change.
 */
const UserContext = createContext({
  user: null,
  setUser: () => {},
  signOut: () => {},
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const signOut = useCallback(() => setUser(null), []);

  const value = useMemo(() => ({ user, setUser, signOut }), [user, signOut]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}