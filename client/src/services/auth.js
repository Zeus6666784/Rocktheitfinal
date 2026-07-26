import api from './api';

const TOKEN_KEY = 'learnify.token';
const USER_KEY = 'learnify.user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function persistAuth({ token, user }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function register({ name, email, password }) {
  const { data } = await api.post('/auth/register', { name, email, password });
  if (data?.token) persistAuth(data);
  return data;
}

export async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  if (data?.token) persistAuth(data);
  return data;
}

export function logout() {
  clearAuth();
}
