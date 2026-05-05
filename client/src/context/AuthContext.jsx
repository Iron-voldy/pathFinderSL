import { createContext, useContext, useEffect, useState } from 'react';
import { AUTH_STORAGE_KEY, authAPI } from '../services/api';

const AuthContext = createContext(null);

const getStoredSession = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Unable to read auth session:', error);
    return null;
  }
};

const persistSession = (session) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

const clearStoredSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => getStoredSession());
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const storedSession = getStoredSession();

      if (!storedSession?.token) {
        if (isMounted) {
          setSession(null);
          setAuthReady(true);
        }
        return;
      }

      try {
        const response = await authAPI.getCurrentUser();
        const nextSession = {
          token: storedSession.token,
          user: response.data,
        };

        persistSession(nextSession);

        if (isMounted) {
          setSession(nextSession);
        }
      } catch (error) {
        clearStoredSession();

        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setAuthReady(true);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const completeAuth = (payload) => {
    const nextSession = {
      token: payload.token,
      user: payload.user,
    };

    persistSession(nextSession);
    setSession(nextSession);
    return payload;
  };

  const registerUser = async (formData) => {
    const response = await authAPI.register(formData);
    return completeAuth(response.data);
  };

  const loginUser = async (formData) => {
    const response = await authAPI.loginUser(formData);
    return completeAuth(response.data);
  };

  const loginAdmin = async (formData) => {
    const response = await authAPI.loginAdmin(formData);
    return completeAuth(response.data);
  };

  const logout = () => {
    clearStoredSession();
    setSession(null);
  };

  const refreshUser = async () => {
    const response = await authAPI.getCurrentUser();
    const nextSession = {
      token: session?.token,
      user: response.data,
    };

    persistSession(nextSession);
    setSession(nextSession);
    return response.data;
  };

  const updateProfile = async (payload) => {
    const response = await authAPI.updateProfile(payload);
    const nextSession = {
      token: session?.token,
      user: response.data,
    };

    persistSession(nextSession);
    setSession(nextSession);
    return response.data;
  };

  const deleteAccount = async (password) => {
    await authAPI.deleteAccount({ password });
    clearStoredSession();
    setSession(null);
  };

  const value = {
    user: session?.user || null,
    token: session?.token || null,
    isAuthenticated: Boolean(session?.token && session?.user),
    isAdmin: session?.user?.role === 'admin',
    isDriver: Boolean(session?.user?.isDriver),
    authReady,
    registerUser,
    loginUser,
    loginAdmin,
    logout,
    refreshUser,
    updateProfile,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
