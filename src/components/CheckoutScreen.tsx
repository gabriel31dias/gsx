import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, Copy, Eye, EyeOff, Loader2, QrCode } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
const DEFAULT_LOGIN_WALLPAPER = '/default-login-wallpaper.png';

// ponytail: mesma resolução de id do AuthContext (?id= ou primeiro segmento do path)
const producerId =
  new URLSearchParams(window.location.search).get('id') ||
  window.location.pathname.replace(/^\/+/, '').split('/')[0] ||
  '';

interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number | string;
}

interface PixResult {
  qrcode: string;
  expiration_date?: string;
}

interface ViaCepResponse {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

const brl = (value: number | string) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const planPriceValue = (value: number | string) => (
  typeof value === 'number' ? value : Number(value.replace(',', '.'))
);

const isFreePlan = (plan: Plan) => !(planPriceValue(plan.price) > 0);

const maskCep = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
};

export const CheckoutScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { theme } = useAuth();
  const [step, setStep] = useState<'personal' | 'address' | 'plans' | 'pix'>('personal');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', cpf: '', password: '', confirmPassword: '', cep: '', rua: '', bairro: '', cidade: '', uf: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cepMessage, setCepMessage] = useState('');
  const [error, setError] = useState('');
  const [pix, setPix] = useState<PixResult | null>(null);
  const [orderId, setOrderId] = useState('');
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const query = producerId ? `?id=${encodeURIComponent(producerId)}` : '';
    fetch(`${API_BASE_URL}/api/v1/plans${query}`)
      .then((r) => r.json())
      .then((data) => {
        const list: Plan[] = data.plans ?? [];
        setPlans(list);
        setPlanId(list[0]?.id ?? '');
      })
      .catch(() => setError('Não foi possível carregar os planos.'));
  }, []);

  // Polling: enquanto o PIX está na tela, consulta o status do pedido até virar 'paid'.
  useEffect(() => {
    if (step !== 'pix' || !orderId || paid) return;
    const timer = setInterval(async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/api/v1/checkout/transactions/${orderId}`);
        const data = await r.json();
        if (data.paid) setPaid(true);
      } catch {
        // ponytail: falha transitória de rede -> próximo tick tenta de novo
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [step, orderId, paid]);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Auto-completa rua/bairro/cidade pelo CEP via ViaCEP quando houver 8 dígitos.
  const handleCep = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = maskCep(e.target.value);
    setForm((prev) => ({ ...prev, cep: value }));
    setCepMessage('');

    const cep = value.replace(/\D/g, '');
    if (cep.length !== 8) {
      setIsCepLoading(false);
      return;
    }

    setIsCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = (await response.json()) as ViaCepResponse;
      if (!response.ok || data.erro) {
        setCepMessage('CEP não encontrado. Preencha o endereço manualmente.');
        return;
      }
      setForm((prev) => ({
        ...prev,
        cep: value,
        rua: data.logradouro || prev.rua,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        uf: data.uf || prev.uf,
      }));
      setCepMessage('Endereço preenchido pelo CEP.');
    } catch {
      setCepMessage('Não foi possível consultar o CEP. Preencha manualmente.');
    } finally {
      setIsCepLoading(false);
    }
  };

  // Avança validando os campos do passo (required nativo do <form>).
  const goTo = (next: 'address' | 'plans') => (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (next === 'address' && form.password !== form.confirmPassword) {
      setError('A confirmação de senha não confere.');
      return;
    }
    setStep(next);
  };

  // Passo 2 -> 3: gera o PIX com o plano escolhido.
  const generatePix = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const { cep, rua, bairro, cidade, uf, confirmPassword, ...rest } = form;
      const address = `${rua}, ${bairro}, ${cidade}${uf ? `/${uf}` : ''} - CEP ${cep}`;
      const response = await fetch(`${API_BASE_URL}/api/v1/checkout/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: producerId, plan_id: planId, ...rest, address }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || (data.errors && data.errors[0]) || 'Falha ao concluir o cadastro.');

      // Plano gratuito: sem PIX, cadastro já sai com o plano ativo.
      if (data.free) {
        setOrderId(data.order_id);
        setPaid(true);
        setStep('pix');
        return;
      }

      if (!data.pix?.qrcode) throw new Error('A gateway não retornou o código PIX.');
      setPix(data.pix);
      setOrderId(data.order_id);
      setStep('pix');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const freeSelected = plans.some((plan) => plan.id === planId && isFreePlan(plan));

  const copy = async () => {
    if (!pix?.qrcode) return;
    await navigator.clipboard.writeText(pix.qrcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const field = (
    label: string,
    key: keyof typeof form,
    type = 'text',
    required = true,
  ) => (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold text-gray-300">{label}</span>
      <input
        type={type}
        value={form[key]}
        onChange={update(key)}
        required={required}
        className="w-full rounded-xl border border-[#202b42] bg-[#0e1626] px-3.5 py-2 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />
    </label>
  );
  const loginWallpaper = theme.wallpaperUrl || DEFAULT_LOGIN_WALLPAPER;
  const secondaryButtonClass = 'flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#202b42] px-4 py-2.5 text-sm font-bold text-gray-300 transition hover:border-indigo-500/50 hover:bg-white/5 hover:text-white';
  const primaryButtonClass = 'theme-gradient flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold transition hover:brightness-110';
  const stepBack = () => {
    if (step === 'address') setStep('personal');
    else if (step === 'plans') setStep('address');
    else onBack();
  };
  const stepIndicator = (
    <ol className="mb-4 flex w-full items-center justify-between border-b border-[#1b253b] pb-3 text-[9px] font-bold uppercase tracking-wider">
      {[
        { key: 'personal', label: 'Dados' },
        { key: 'address', label: 'Endereço' },
        { key: 'plans', label: 'Plano' },
      ].map(({ key, label }, index) => {
        const order = ['personal', 'address', 'plans'];
        const active = order.indexOf(step) >= index;
        return (
          <li key={key} className="flex items-center gap-1.5">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border text-[9px] ${
                active ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-[#202b42] text-gray-600'
              }`}
            >
              {index + 1}
            </span>
            <span className={active ? 'text-gray-300' : 'text-gray-600'}>{label}</span>
          </li>
        );
      })}
    </ol>
  );

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

        <section className="flex min-h-screen items-center justify-center px-5 py-3 sm:px-8 lg:py-4">
          <div className="w-full max-w-sm animate-fadeIn xl:max-w-md">
            <BrandLogo compact showSubtitle={false} className="mb-4 lg:hidden" />

            {step === 'pix' && paid ? (
          <div className="rounded-[28px] border border-emerald-500/30 bg-[#0b101e]/90 p-7 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-400" />
            <h2 className="text-2xl font-extrabold">
              {freeSelected ? 'Cadastro concluído!' : 'Pagamento confirmado!'}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              {freeSelected
                ? 'Seu plano gratuito já está ativo. Confirme seu e-mail e faça login para entrar na plataforma.'
                : 'Seu acesso foi liberado. Faça login com seu e-mail para entrar na plataforma.'}
            </p>
            <button
              type="button"
              onClick={onBack}
              className="theme-gradient mx-auto mt-6 flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold"
            >
              Ir para o login
            </button>
          </div>
        ) : step === 'pix' && pix ? (
          <div className="rounded-3xl border border-[#1b253b] bg-[#0b101e]/90 p-4 text-center sm:p-5">
            <QrCode className="mx-auto mb-2 h-7 w-7 text-indigo-400" />
            <h2 className="text-xl font-extrabold leading-tight">Pague com PIX para liberar o acesso</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
              Escaneie o QR Code ou copie o código abaixo. Seu acesso é liberado após a confirmação do pagamento.
            </p>

            <img
              alt="QR Code PIX"
              className="mx-auto my-4 h-44 w-44 rounded-xl bg-white p-1.5 sm:h-48 sm:w-48"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encodeURIComponent(pix.qrcode)}`}
            />

            <div className="max-h-20 overflow-y-auto break-all rounded-xl border border-[#202b42] bg-[#0e1626] p-2.5 text-left font-mono text-[10px] leading-relaxed text-gray-300">
              {pix.qrcode}
            </div>
            <button
              type="button"
              onClick={copy}
              className="theme-gradient mx-auto mt-3 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copiado!' : 'Copiar código PIX'}
            </button>
            <p className="mt-3 flex items-center justify-center gap-2 text-[11px] text-gray-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Aguardando confirmação do pagamento...
            </p>
            {pix.expiration_date && (
              <p className="mt-2 text-[10px] text-gray-500">
                Expira em {new Date(pix.expiration_date).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        ) : step === 'plans' ? (
          <div className="rounded-3xl border border-[#1b253b] bg-[#0b101e]/90 p-5 sm:p-6">
            {stepIndicator}
            <h2 className="mb-1 text-xl font-extrabold">Escolha seu plano</h2>
            <p className="mb-4 text-xs text-gray-500">
              {freeSelected
                ? 'Plano gratuito: seu acesso é liberado na hora, sem pagamento.'
                : 'Selecione um plano para gerar o PIX de pagamento.'}
            </p>

            <div className="space-y-2">
              {plans.length === 0 && (
                <p className="text-sm text-gray-500">Nenhum plano disponível no momento.</p>
              )}
              {plans.map((plan) => (
                <label
                  key={plan.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-3 text-sm transition ${
                    planId === plan.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-[#202b42] bg-[#0e1626]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="plan"
                      checked={planId === plan.id}
                      onChange={() => setPlanId(plan.id)}
                    />
                    <span>
                      <span className="block font-bold">{plan.name}</span>
                      {plan.description && (
                        <span className="block text-xs text-gray-500">{plan.description}</span>
                      )}
                    </span>
                  </span>
                  <span className="font-mono text-gray-300">
                    {isFreePlan(plan) ? 'Gratuito' : brl(plan.price)}
                  </span>
                </label>
              ))}
            </div>

            {error && (
              <div role="alert" className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                {error}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={stepBack}
                className={secondaryButtonClass}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
              <button
                type="button"
                onClick={generatePix}
                disabled={isSubmitting || !planId}
                className={`${primaryButtonClass} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : freeSelected ? <Check className="h-4 w-4" /> : <QrCode className="h-4 w-4" />}
                {isSubmitting ? 'Enviando...' : freeSelected ? 'Criar conta grátis' : 'Gerar PIX'}
              </button>
            </div>
          </div>
        ) : step === 'address' ? (
          <form onSubmit={goTo('plans')} className="rounded-3xl border border-[#1b253b] bg-[#0b101e]/90 p-4 sm:p-5">
            {stepIndicator}
            <h2 className="mb-1 text-xl font-extrabold">Endereço</h2>
            <p className="mb-3 text-xs text-gray-500">Informe o CEP para completar automaticamente.</p>

            <div className="space-y-2.5">
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-gray-300">CEP</span>
                <span className="relative block">
                  <input
                    type="text"
                    value={form.cep}
                    onChange={handleCep}
                    required
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="00000-000"
                    aria-busy={isCepLoading}
                    className="w-full rounded-xl border border-[#202b42] bg-[#0e1626] px-3.5 py-2 pr-10 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  {isCepLoading && (
                    <Loader2 className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-indigo-400" />
                  )}
                </span>
                {cepMessage && (
                  <span className={`mt-1 block text-[10px] ${cepMessage.includes('preenchido') ? 'text-emerald-400' : 'text-amber-300'}`}>
                    {cepMessage}
                  </span>
                )}
              </label>
              {field('Rua', 'rua')}
              <div className="grid gap-2.5 sm:grid-cols-[1fr_1fr_72px]">
                {field('Bairro', 'bairro')}
                {field('Cidade', 'cidade')}
                {field('UF', 'uf')}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={stepBack}
                className={secondaryButtonClass}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
              <button
                type="submit"
                className={primaryButtonClass}
              >
                Continuar
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={goTo('address')} className="rounded-3xl border border-[#1b253b] bg-[#0b101e]/90 p-4 sm:p-5">
            {stepIndicator}
            <h2 className="mb-1 text-xl font-extrabold">Dados pessoais</h2>
            <p className="mb-3 text-xs text-gray-500">Preencha seus dados para criar a conta.</p>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="sm:col-span-2">
              {field('Nome completo', 'name')}
              </div>
              {field('E-mail', 'email', 'email')}
              {field('Telefone', 'phone', 'tel')}
              {field('CPF', 'cpf')}
              <div className="grid gap-2.5 sm:col-span-2 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-gray-300">Senha de acesso</span>
                  <span className="relative block">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={update('password')}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Mínimo 6 caracteres"
                      className="w-full rounded-xl border border-[#202b42] bg-[#0e1626] px-3.5 py-2 pr-11 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-gray-300">Confirmar senha</span>
                  <span className="relative block">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={update('confirmPassword')}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Digite a senha novamente"
                      className="w-full rounded-xl border border-[#202b42] bg-[#0e1626] px-3.5 py-2 pr-11 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-200"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </span>
                </label>
              </div>
            </div>

            {error && (
              <div role="alert" className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-300">
                {error}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={onBack}
                className={secondaryButtonClass}
              >
                <ArrowLeft className="h-4 w-4" />
                Login
              </button>
              <button
                type="submit"
                className={primaryButtonClass}
              >
                Continuar
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </button>
            </div>
          </form>
        )}
          </div>
        </section>
      </div>
    </main>
  );
};
