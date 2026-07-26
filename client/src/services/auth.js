/**
 * Auth service (demo).
 * The demo runs anonymously. Kept as a stub so any future caller doesn't
 * break the build; production auth wiring will replace this file.
 */
const TOKEN_KEY = 'learnify.token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function clearToken() {
  setToken(null);
}

export async function login() {
  // demo: no-op, returns no user
  return { user: null };
}

export async function register() {
  return { user: null };
}

export function logout() {
  clearToken();
}