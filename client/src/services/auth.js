import api from './api.js';

const TOKEN_KEY = 'learnify.token';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(token) {
  try { if (token) localStorage.setItem(TOKEN_KEY, token); else localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
}
export function clearToken() { setToken(null); }

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  const data = res?.data?.data || res?.data;
  const token = data?.token;
  const user = data?.user;
  if (token) setToken(token);
  return { token, user };
}

export async function register(name, email, password) {
  const res = await api.post('/auth/register', { name, email, password });
  const data = res?.data?.data || res?.data;
  const token = data?.token;
  const user = data?.user;
  if (token) setToken(token);
  return { token, user };
}

export function logout() { clearToken(); }