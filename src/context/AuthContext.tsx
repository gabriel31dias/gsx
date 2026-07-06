import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AUTH_STORAGE_KEY = 'aluradev_auth';
const THEME_STORAGE_KEY = 'aluradev_theme';
const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export interface PlatformTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  logoUrl: string | null;
  memberAreaTitle: string;
  primaryDescription: string;
  secondaryDescription: string;
  loginTitle: string;
  loginSubtitle: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
}

const DEFAULT_THEME: PlatformTheme = {
  primaryColor: '#6366f1',
  secondaryColor: '#a855f7',
  backgroundColor: '#070a13',
  surfaceColor: '#0e1424',
  textColor: '#f9fafb',
  mutedTextColor: '#9ca3af',
  logoUrl: null,
  memberAreaTitle: 'CATÁLOGO OFICIAL ALURADEV',
  primaryDescription: 'Aprenda no seu ritmo. Evolua com prática.',
  secondaryDescription: 'Consulte abaixo somente os cursos disponíveis para sua conta, carregados diretamente da plataforma.',
  loginTitle: 'Bem-vindo de volta',
  loginSubtitle: 'Entre com suas credenciais para continuar seus estudos.',
  heroTitle: 'Conhecimento técnico para',
  heroHighlight: 'construir o futuro.',
  heroSubtitle: 'Acesse trilhas práticas, acompanhe sua evolução e transforme cada aula em progresso real para sua carreira.',
};

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  owner_id?: string | null;
  current_plan_id?: string | null;
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
  theme: PlatformTheme;
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

interface ThemeColorsResponse {
  primary_color?: string;
  secondary_color?: string;
  background_color?: string;
  surface_color?: string;
  text_color?: string;
  muted_text_color?: string;
  logo_url?: string | null;
  member_area_title?: string;
  primary_description?: string;
  secondary_description?: string;
  login_title?: string;
  login_subtitle?: string;
  hero_title?: string;
  hero_highlight?: string;
  hero_subtitle?: string;
}

interface ThemeResponse {
  theme?: ThemeColorsResponse & {
    colors?: ThemeColorsResponse;
  };
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const isHexColor = (value: unknown): value is string => (
  typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
);

const normalizeAssetUrl = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const url = new URL(value);
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return value.startsWith('/') ? value : null;
  }

  return value;
};

const normalizeThemeText = (value: unknown, fallback: string) => (
  typeof value === 'string' && value.trim() ? value.trim() : fallback
);

function readStoredTheme(): PlatformTheme {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (!storedTheme) return DEFAULT_THEME;

  try {
    const theme = JSON.parse(storedTheme) as PlatformTheme;
    return {
      primaryColor: isHexColor(theme.primaryColor) ? theme.primaryColor : DEFAULT_THEME.primaryColor,
      secondaryColor: isHexColor(theme.secondaryColor) ? theme.secondaryColor : DEFAULT_THEME.secondaryColor,
      backgroundColor: isHexColor(theme.backgroundColor) ? theme.backgroundColor : DEFAULT_THEME.backgroundColor,
      surfaceColor: isHexColor(theme.surfaceColor) ? theme.surfaceColor : DEFAULT_THEME.surfaceColor,
      textColor: isHexColor(theme.textColor) ? theme.textColor : DEFAULT_THEME.textColor,
      mutedTextColor: isHexColor(theme.mutedTextColor) ? theme.mutedTextColor : DEFAULT_THEME.mutedTextColor,
      logoUrl: normalizeAssetUrl(theme.logoUrl),
      memberAreaTitle: normalizeThemeText(theme.memberAreaTitle, DEFAULT_THEME.memberAreaTitle),
      primaryDescription: normalizeThemeText(theme.primaryDescription, DEFAULT_THEME.primaryDescription),
      secondaryDescription: normalizeThemeText(theme.secondaryDescription, DEFAULT_THEME.secondaryDescription),
      loginTitle: normalizeThemeText(theme.loginTitle, DEFAULT_THEME.loginTitle),
      loginSubtitle: normalizeThemeText(theme.loginSubtitle, DEFAULT_THEME.loginSubtitle),
      heroTitle: normalizeThemeText(theme.heroTitle, DEFAULT_THEME.heroTitle),
      heroHighlight: normalizeThemeText(theme.heroHighlight, DEFAULT_THEME.heroHighlight),
      heroSubtitle: normalizeThemeText(theme.heroSubtitle, DEFAULT_THEME.heroSubtitle),
    };
  } catch {
    localStorage.removeItem(THEME_STORAGE_KEY);
    return DEFAULT_THEME;
  }
}

function applyTheme(theme: PlatformTheme) {
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', theme.primaryColor);
  root.style.setProperty('--theme-secondary', theme.secondaryColor);
  root.style.setProperty('--theme-background', theme.backgroundColor);
  root.style.setProperty('--theme-surface', theme.surfaceColor);
  root.style.setProperty('--theme-text', theme.textColor);
  root.style.setProperty('--theme-muted-text', theme.mutedTextColor);
  root.classList.add('dynamic-theme');
}

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
  const [theme, setTheme] = useState<PlatformTheme>(readStoredTheme);
  const [isLoading, setIsLoading] = useState(Boolean(session?.token));

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    let isActive = true;

    // ponytail: theme id comes from ?id= or the first URL path segment (/:id); without it, the API returns the default theme
    const themeId = new URLSearchParams(window.location.search).get('id')
      || window.location.pathname.replace(/^\/+/, '').split('/')[0];
    const query = themeId ? `?id=${encodeURIComponent(themeId)}` : '';

    fetch(`${API_BASE_URL}/api/v1/theme${query}`, {
      // ponytail: with an id the theme is public; only fall back to the token when there's no id
      headers: !themeId && session?.token ? { Authorization: `Bearer ${session.token}` } : {},
    })
      .then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as ThemeResponse;
        if (!response.ok || !data.theme) {
          throw new Error('Tema indisponível.');
        }

        const colors = data.theme.colors ?? data.theme;

        return {
          primaryColor: isHexColor(colors.primary_color)
            ? colors.primary_color
            : DEFAULT_THEME.primaryColor,
          secondaryColor: isHexColor(colors.secondary_color)
            ? colors.secondary_color
            : DEFAULT_THEME.secondaryColor,
          backgroundColor: isHexColor(colors.background_color)
            ? colors.background_color
            : DEFAULT_THEME.backgroundColor,
          surfaceColor: isHexColor(colors.surface_color)
            ? colors.surface_color
            : DEFAULT_THEME.surfaceColor,
          textColor: isHexColor(colors.text_color)
            ? colors.text_color
            : DEFAULT_THEME.textColor,
          mutedTextColor: isHexColor(colors.muted_text_color)
            ? colors.muted_text_color
            : DEFAULT_THEME.mutedTextColor,
          logoUrl: normalizeAssetUrl(colors.logo_url ?? data.theme.logo_url),
          memberAreaTitle: normalizeThemeText(
            data.theme.member_area_title,
            DEFAULT_THEME.memberAreaTitle,
          ),
          primaryDescription: normalizeThemeText(
            data.theme.primary_description,
            DEFAULT_THEME.primaryDescription,
          ),
          secondaryDescription: normalizeThemeText(
            data.theme.secondary_description,
            DEFAULT_THEME.secondaryDescription,
          ),
          loginTitle: normalizeThemeText(
            data.theme.login_title,
            DEFAULT_THEME.loginTitle,
          ),
          loginSubtitle: normalizeThemeText(
            data.theme.login_subtitle,
            DEFAULT_THEME.loginSubtitle,
          ),
          heroTitle: normalizeThemeText(
            data.theme.hero_title,
            DEFAULT_THEME.heroTitle,
          ),
          heroHighlight: normalizeThemeText(
            data.theme.hero_highlight,
            DEFAULT_THEME.heroHighlight,
          ),
          heroSubtitle: normalizeThemeText(
            data.theme.hero_subtitle,
            DEFAULT_THEME.heroSubtitle,
          ),
        };
      })
      .then((nextTheme) => {
        if (!isActive) return;
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(nextTheme));
        setTheme(nextTheme);
      })
      .catch(() => {
        // Keep the cached theme when the endpoint is temporarily unavailable.
      });

    return () => {
      isActive = false;
    };
  }, [session?.token]);

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
    theme,
    login,
    refreshUser,
    logout,
  }), [isLoading, session, theme]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
};
