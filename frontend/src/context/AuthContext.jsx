import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../apiConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);   // initial check
  const [error, setError]     = useState(null);

  // ─── Helpers ────────────────────────────────────────────────
  const saveToken  = (t) => localStorage.setItem('bac_token', t);
  const clearToken = ()  => localStorage.removeItem('bac_token');
  const getToken   = ()  => localStorage.getItem('bac_token');

  const authFetch = useCallback(async (endpoint, options = {}) => {
    const token = getToken();
    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  }, []);

  // ─── Check existing session on mount ────────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    authFetch('/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) setUser(data.user);
        else clearToken();
      })
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, [authFetch]);

  // ─── Register ────────────────────────────────────────────────
  const register = async ({ firstName, lastName, email, password, series }) => {
    setError(null);
    const res = await authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        first_name: firstName,
        last_name:  lastName,
        email,
        password,
        series,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erreur lors de l'inscription");
    saveToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // ─── Login ───────────────────────────────────────────────────
  const login = async ({ email, password }) => {
    setError(null);
    const res = await authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Identifiants invalides');
    saveToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // ─── Logout ──────────────────────────────────────────────────
  const logout = () => {
    clearToken();
    setUser(null);
  };

  const value = { user, loading, error, login, register, logout, getToken };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
