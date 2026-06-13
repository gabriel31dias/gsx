import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AUTH_STORAGE_KEY = 'aluradev_auth';
const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthSession {
  token: string;
  user?: AuthUser;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  refreshUser: () => Promise<AuthUser>;
  logout: () => void;
}

interface LoginResponse {
  token?: string;
  message?: string;
  error?: string;
}

interface MeResponse {
  user?: AuthUser;
  message?: string;
  error?: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredSession(): AuthSession | null {
  const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    const session = JSON.parse(storedSession) as AuthSession;
    return session.token ? session : null;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

async function fetchCurrentUser(token: string): Promise<AuthUser> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error('Não foi possível validar sua sessão com o servidor.');
  }

  const data = (await response.json().catch(() => ({}))) as MeResponse;

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Sua sessão expirou. Entre novamente.');
  }

  if (!data.user) {
    throw new Error('O servidor não retornou os dados do usuário.');
  }

  return data.user;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(readStoredSession);
  const [isLoading, setIsLoading] = useState(Boolean(session?.token));

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    fetchCurrentUser(session.token)
      .then((user) => {
        if (!isActive) return;

        const validatedSession = { token: session.token, user };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(validatedSession));
        setSession(validatedSession);
      })
      .catch(() => {
        if (!isActive) return;

        localStorage.removeItem(AUTH_STORAGE_KEY);
        setSession(null);
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [session?.token]);

  const login = async ({ email, password }: LoginCredentials) => {
    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}/api/v1/auth/member/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error('Não foi possível conectar ao servidor. Tente novamente em instantes.');
    }

    const data = (await response.json().catch(() => ({}))) as LoginResponse;

    if (!response.ok) {
      throw new Error(data.message || data.error || 'E-mail ou senha inválidos.');
    }

    if (!data.token) {
      throw new Error('O servidor não retornou um token de acesso.');
    }

    const user = await fetchCurrentUser(data.token);
    const nextSession = {
      token: data.token,
      user,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  };

  const refreshUser = async () => {
    if (!session?.token) {
      throw new Error('Nenhuma sessão ativa.');
    }

    const user = await fetchCurrentUser(session.token);
    const refreshedSession = { token: session.token, user };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(refreshedSession));
    setSession(refreshedSession);
    return user;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setSession(null);
  };

  const value = useMemo<AuthContextValue>(() => ({
    session,
    isAuthenticated: Boolean(session?.token && session.user),
    isLoading,
    login,
    refreshUser,
    logout,
  }), [isLoading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
};
