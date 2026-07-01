import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';

export const LoginScreen: React.FC = () => {
  const { login, theme } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Não foi possível entrar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="theme-background relative min-h-screen overflow-hidden text-white selection:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="theme-glow-primary absolute -left-32 top-[-10rem] h-[30rem] w-[30rem] rounded-full opacity-20 blur-[140px]" />
        <div className="theme-glow-secondary absolute -bottom-44 right-[-8rem] h-[34rem] w-[34rem] rounded-full opacity-15 blur-[150px]" />
        <div className="login-grid absolute inset-0 opacity-30" />
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden border-r border-[#1b253b]/60 px-10 py-10 lg:flex xl:px-20">
          <div className="mx-auto flex w-full max-w-2xl flex-col justify-between">
            <BrandLogo />

            <div className="max-w-xl">
              <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                <GraduationCap className="h-4 w-4" />
                Sua próxima evolução começa aqui
              </div>
              <h1 className="text-4xl font-black leading-[1.08] tracking-tight xl:text-6xl">
                <span className="theme-gradient-text">{theme.heroTitle}</span>{' '}
                <span className="block text-white">{theme.heroHighlight}</span>
              </h1>
              <p className="mt-6 max-w-lg text-sm leading-7 text-gray-400 xl:text-base">
                {theme.heroSubtitle}
              </p>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: BookOpen, value: '+120', label: 'aulas práticas' },
                  { icon: CheckCircle2, value: '24/7', label: 'acesso contínuo' },
                  { icon: ShieldCheck, value: '100%', label: 'ambiente seguro' },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label} className="rounded-2xl border border-[#1b253b] bg-[#0e1424]/70 p-4 backdrop-blur">
                    <Icon className="mb-4 h-4 w-4 text-indigo-400" />
                    <p className="font-mono text-lg font-black text-gray-100">{value}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-gray-600">
              Plataforma avançada de treinamento técnico-científico
            </p>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-md animate-fadeIn">
            <BrandLogo compact showSubtitle={false} className="mb-10 lg:hidden" />

            <div className="rounded-[28px] border border-[#1b253b] bg-[#0b101e]/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9">
              <div className="mb-8">
                <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
                  Área do membro
                </p>
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{theme.loginTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {theme.loginSubtitle}
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-gray-300">E-mail</span>
                  <span className="group relative block">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-indigo-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="voce@exemplo.com"
                      autoComplete="email"
                      required
                      className="w-full rounded-xl border border-[#202b42] bg-[#0e1626] py-3.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-gray-300">Senha</span>
                  <span className="group relative block">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-indigo-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Digite sua senha"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-xl border border-[#202b42] bg-[#0e1626] py-3.5 pl-10 pr-12 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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

                {error && (
                  <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="theme-gradient flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-extrabold shadow-lg transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
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

              <div className="mt-7 flex items-center justify-center gap-2 border-t border-[#1b253b] pt-6 text-[10px] text-gray-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Conexão protegida e acesso exclusivo para membros</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
