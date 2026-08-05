import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
} from 'lucide-react';
import { LoginError, useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import { CheckoutScreen } from './CheckoutScreen';

const DEFAULT_LOGIN_WALLPAPER = '/default-login-wallpaper.png';
const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
type AuthMode = 'login' | 'forgot' | 'verify' | 'reset' | 'confirming' | 'confirmed' | 'confirm_failed';

const producerId =
  new URLSearchParams(window.location.search).get('id') ||
  window.location.pathname.replace(/^\/+/, '').split('/')[0] ||
  '';
const initialParams = new URLSearchParams(window.location.search);
const initialConfirmationToken = initialParams.get('token') || '';
const initialConfirmationEmail = initialParams.get('email') || '';
const hasEmailConfirmationLink = initialParams.get('confirm_email') === '1'
  && initialConfirmationToken
  && initialConfirmationEmail;

const clearEmailConfirmationUrl = () => {
  if (window.location.search.includes('confirm_email=')) {
    window.history.replaceState(null, '', window.location.pathname);
  }
};

export const LoginScreen: React.FC = () => {
  const { login, theme } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>(hasEmailConfirmationLink ? 'confirming' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPasswordConfirmation, setShowNewPasswordConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const loginWallpaper = theme.wallpaperUrl || DEFAULT_LOGIN_WALLPAPER;

  const parseApiError = (data: { error?: string; errors?: string[]; message?: string }) => (
    data.error || data.errors?.[0] || data.message || 'Não foi possível completar a solicitação.'
  );

  useEffect(() => {
    if (!hasEmailConfirmationLink) return;

    let isActive = true;
    setAuthMode('confirming');
    setError('');
    setSuccessMessage('');

    fetch(`${API_BASE_URL}/api/v1/auth/member/email/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: producerId,
        email: initialConfirmationEmail,
        token: initialConfirmationToken,
      }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(parseApiError(data));
        return data.message || 'E-mail confirmado com sucesso.';
      })
      .then((message) => {
        if (!isActive) return;
        setEmail(initialConfirmationEmail);
        setSuccessMessage(message);
        setAuthMode('confirmed');
        clearEmailConfirmationUrl();
      })
      .catch((confirmationError) => {
        if (!isActive) return;
        setEmail(initialConfirmationEmail);
        setError(confirmationError instanceof Error ? confirmationError.message : 'Não foi possível confirmar o e-mail.');
        setAuthMode('confirm_failed');
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (showCheckout) {
    return <CheckoutScreen onBack={() => setShowCheckout(false)} />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setErrorCode('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Não foi possível entrar.');
      if (loginError instanceof LoginError && loginError.code) setErrorCode(loginError.code);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestPasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/member/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: producerId, email: resetEmail.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(parseApiError(data));

      setSuccessMessage(data.message || 'Código enviado para o e-mail informado.');
      setResetToken('');
      setAuthMode('verify');
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Não foi possível enviar o código.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendConfirmationEmail = async () => {
    setError('');
    setErrorCode('');
    setSuccessMessage('');
    setIsResendingConfirmation(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/member/email/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: producerId, email: email.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(parseApiError(data));
      setSuccessMessage(data.message || 'Link de confirmação enviado.');
    } catch (confirmationError) {
      setError(confirmationError instanceof Error ? confirmationError.message : 'Não foi possível reenviar a confirmação.');
    } finally {
      setIsResendingConfirmation(false);
    }
  };

  const verifyPasswordResetToken = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/member/password/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: producerId,
          email: resetEmail.trim(),
          token: resetToken.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(parseApiError(data));

      setAuthMode('reset');
      setSuccessMessage(data.message || 'Código verificado. Agora crie sua nova senha.');
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Código inválido ou expirado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmPasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (newPassword !== newPasswordConfirmation) {
      setError('A confirmação de senha não confere.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/member/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: producerId,
          email: resetEmail.trim(),
          token: resetToken.trim(),
          password: newPassword,
          password_confirmation: newPasswordConfirmation,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(parseApiError(data));

      setEmail(resetEmail.trim());
      setPassword('');
      setResetToken('');
      setNewPassword('');
      setNewPasswordConfirmation('');
      setAuthMode('login');
      setSuccessMessage(data.message || 'Senha redefinida com sucesso. Entre com sua nova senha.');
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Não foi possível redefinir a senha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLogin = () => {
    clearEmailConfirmationUrl();
    setAuthMode('login');
    setError('');
    setErrorCode('');
    setSuccessMessage('');
  };

  return (
    <main className="theme-background relative min-h-screen overflow-hidden text-white selection:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="theme-glow-primary absolute -left-32 top-[-10rem] h-[30rem] w-[30rem] rounded-full opacity-20 blur-[140px]" />
        <div className="theme-glow-secondary absolute -bottom-44 right-[-8rem] h-[34rem] w-[34rem] rounded-full opacity-15 blur-[150px]" />
        <div className="login-grid absolute inset-0 opacity-30" />
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-[#1b253b]/60 lg:block">
          <img
            src={loginWallpaper}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-[#070a13]/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#070a13]/45" />
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-4 sm:px-10 lg:py-6">
          <div className="w-full max-w-sm animate-fadeIn xl:max-w-md">
            <BrandLogo compact showSubtitle={false} className="mb-5 lg:hidden" />

            <div className="rounded-3xl border border-[#1b253b] bg-[#0b101e]/90 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7">
              <div className="mb-6">
                <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
                  Área do membro
                </p>
                <h2 className="text-2xl font-extrabold tracking-tight">{theme.loginTitle}</h2>
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  {theme.loginSubtitle}
                </p>
              </div>

              {authMode === 'confirming' ? (
                <div className="space-y-4 text-center">
                  <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-indigo-400/30 border-t-indigo-400" />
                  <div>
                    <h3 className="text-lg font-extrabold">Confirmando e-mail</h3>
                    <p className="mt-1 text-xs leading-5 text-gray-500">Aguarde enquanto validamos seu link.</p>
                  </div>
                </div>
              ) : authMode === 'confirmed' ? (
                <div className="space-y-4 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
                  <div>
                    <h3 className="text-lg font-extrabold">E-mail confirmado</h3>
                    <p className="mt-2 text-xs leading-5 text-emerald-300">{successMessage}</p>
                  </div>
                  <button
                    type="button"
                    onClick={showLogin}
                    className="theme-gradient flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold shadow-lg transition hover:-translate-y-0.5 hover:brightness-110"
                  >
                    Ir para login
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : authMode === 'confirm_failed' ? (
                <div className="space-y-4 text-center">
                  <LockKeyhole className="mx-auto h-10 w-10 text-red-300" />
                  <div>
                    <h3 className="text-lg font-extrabold">Link expirado</h3>
                    <p className="mt-2 text-xs leading-5 text-red-300">
                      {error || 'Este link de confirmação não é mais válido.'}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      Peça um novo link para <span className="font-bold text-gray-300">{email}</span>.
                    </p>
                  </div>

                  {successMessage && (
                    <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-left text-xs leading-5 text-emerald-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={resendConfirmationEmail}
                    disabled={isResendingConfirmation}
                    className="theme-gradient flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold shadow-lg transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {isResendingConfirmation ? 'Reenviando...' : 'Reenviar e-mail de confirmação'}
                  </button>
                  <button
                    type="button"
                    onClick={showLogin}
                    className="w-full rounded-xl border border-[#202b42] py-2.5 text-sm font-bold text-gray-300 transition hover:border-indigo-500 hover:text-white"
                  >
                    Voltar para login
                  </button>
                </div>
              ) : authMode === 'login' ? (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-gray-300">E-mail</span>
                  <span className="group relative block">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-indigo-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="voce@exemplo.com"
                      autoComplete="email"
                      required
                      className="w-full rounded-xl border border-[#202b42] bg-[#0e1626] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-gray-300">Senha</span>
                  <span className="group relative block">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-indigo-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Digite sua senha"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-xl border border-[#202b42] bg-[#0e1626] py-3 pl-10 pr-12 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </span>
                </label>

                <div className="-mt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setAuthMode('forgot');
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="text-xs font-bold text-indigo-300 transition hover:text-white"
                  >
                    Esqueci minha senha
                  </button>
                </div>

                {successMessage && (
                  <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs leading-5 text-emerald-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {error && (
                  <div role="alert" className="space-y-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-300">
                    <p>{error}</p>
                    {errorCode === 'email_not_confirmed' && (
                      <button
                        type="button"
                        onClick={resendConfirmationEmail}
                        disabled={isResendingConfirmation}
                        className="w-full rounded-lg border border-red-300/25 px-3 py-2 font-bold text-red-100 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isResendingConfirmation ? 'Reenviando...' : 'Reenviar confirmação'}
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="theme-gradient flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold shadow-lg transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      Acessar plataforma
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
              ) : authMode === 'forgot' ? (
                <form className="space-y-4" onSubmit={requestPasswordReset}>
                  <div>
                    <h3 className="text-lg font-extrabold">Trocar senha</h3>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Informe seu e-mail para receber um código de redefinição.
                    </p>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-gray-300">E-mail</span>
                    <span className="group relative block">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-indigo-400" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(event) => setResetEmail(event.target.value)}
                        placeholder="voce@exemplo.com"
                        autoComplete="email"
                        required
                        className="w-full rounded-xl border border-[#202b42] bg-[#0e1626] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </span>
                  </label>

                  {error && (
                    <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-300">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="theme-gradient flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold shadow-lg transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar código'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={showLogin}
                    className="w-full rounded-xl border border-[#202b42] py-2.5 text-sm font-bold text-gray-300 transition hover:border-indigo-500 hover:text-white"
                  >
                    Voltar para login
                  </button>
                </form>
              ) : authMode === 'verify' ? (
                <form className="space-y-4" onSubmit={verifyPasswordResetToken}>
                  <div>
                    <h3 className="text-lg font-extrabold">Digite o código</h3>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Use o código recebido no e-mail para liberar a troca de senha.
                    </p>
                  </div>

                  {successMessage && (
                    <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs leading-5 text-emerald-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-gray-300">Código</span>
                    <span className="group relative block">
                      <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-indigo-400" />
                      <input
                        type="text"
                        value={resetToken}
                        onChange={(event) => setResetToken(event.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        inputMode="numeric"
                        minLength={6}
                        maxLength={6}
                        required
                        className="w-full rounded-xl border border-[#202b42] bg-[#0e1626] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </span>
                  </label>

                  {error && (
                    <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-300">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="theme-gradient flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold shadow-lg transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? 'Verificando...' : 'Verificar código'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="w-full rounded-xl border border-[#202b42] py-2.5 text-sm font-bold text-gray-300 transition hover:border-indigo-500 hover:text-white"
                  >
                    Reenviar código
                  </button>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={confirmPasswordReset}>
                  <div>
                    <h3 className="text-lg font-extrabold">Nova senha</h3>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Código verificado. Agora escolha e confirme sua nova senha.
                    </p>
                  </div>

                  {successMessage && (
                    <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs leading-5 text-emerald-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-gray-300">Nova senha</span>
                      <span className="group relative block">
                        <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-indigo-400" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          autoComplete="new-password"
                          minLength={6}
                          required
                          className="w-full rounded-xl border border-[#202b42] bg-[#0e1626] py-3 pl-10 pr-12 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((current) => !current)}
                          aria-label={showNewPassword ? 'Ocultar senha' : 'Mostrar senha'}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-200"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </span>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-gray-300">Confirmar</span>
                      <span className="group relative block">
                        <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-indigo-400" />
                        <input
                          type={showNewPasswordConfirmation ? 'text' : 'password'}
                          value={newPasswordConfirmation}
                          onChange={(event) => setNewPasswordConfirmation(event.target.value)}
                          placeholder="Repita a senha"
                          autoComplete="new-password"
                          minLength={6}
                          required
                          className="w-full rounded-xl border border-[#202b42] bg-[#0e1626] py-3 pl-10 pr-12 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPasswordConfirmation((current) => !current)}
                          aria-label={showNewPasswordConfirmation ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-200"
                        >
                          {showNewPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </span>
                    </label>
                  </div>

                  {error && (
                    <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-300">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="theme-gradient flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold shadow-lg transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('verify')}
                    className="w-full rounded-xl border border-[#202b42] py-2.5 text-sm font-bold text-gray-300 transition hover:border-indigo-500 hover:text-white"
                  >
                    Trocar código
                  </button>
                </form>
              )}

              {authMode === 'login' && (
                <button
                  type="button"
                  onClick={() => setShowCheckout(true)}
                  className="mt-4 w-full rounded-xl border border-[#202b42] py-2.5 text-sm font-bold text-gray-300 transition hover:border-indigo-500 hover:text-white"
                >
                  Ainda não tem conta? Criar conta
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
