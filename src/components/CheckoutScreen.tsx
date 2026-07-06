import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Check, CheckCircle2, Copy, Loader2, QrCode, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

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

const brl = (value: number | string) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const CheckoutScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [step, setStep] = useState<'personal' | 'address' | 'plans' | 'pix'>('personal');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', cpf: '', password: '', cep: '', rua: '', bairro: '', cidade: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        if (list[0]) setPlanId(list[0].id);
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
    const value = e.target.value;
    setForm((prev) => ({ ...prev, cep: value }));

    const cep = value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) return;
      setForm((prev) => ({
        ...prev,
        rua: data.logradouro || prev.rua,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
      }));
    } catch {
      // ponytail: falhou o ViaCEP -> usuário preenche manual
    }
  };

  // Avança validando os campos do passo (required nativo do <form>).
  const goTo = (next: 'address' | 'plans') => (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setStep(next);
  };

  // Passo 2 -> 3: gera o PIX com o plano escolhido.
  const generatePix = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const { cep, rua, bairro, cidade, ...rest } = form;
      const address = `${rua}, ${bairro}, ${cidade} - CEP ${cep}`;
      const response = await fetch(`${API_BASE_URL}/api/v1/checkout/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: producerId, plan_id: planId, ...rest, address }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || (data.errors && data.errors[0]) || 'Falha ao gerar o PIX.');
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
      <span className="mb-2 block text-xs font-bold text-gray-300">{label}</span>
      <input
        type={type}
        value={form[key]}
        onChange={update(key)}
        required={required}
        className="w-full rounded-xl border border-[#202b42] bg-[#0e1626] py-2.5 px-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />
    </label>
  );

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
              <h1 className="text-4xl font-black leading-[1.08] tracking-tight xl:text-6xl">
                <span className="theme-gradient-text">Garanta seu acesso</span>{' '}
                <span className="block text-white">e comece hoje.</span>
              </h1>
              <p className="mt-6 max-w-lg text-sm leading-7 text-gray-400 xl:text-base">
                Escolha seu plano, pague com PIX e libere na hora todos os cursos, trilhas e certificados da plataforma.
              </p>
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: BookOpen, value: '+120', label: 'aulas práticas' },
                  { icon: CheckCircle2, value: '24/7', label: 'acesso contínuo' },
                  { icon: ShieldCheck, value: 'PIX', label: 'pagamento seguro' },
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

        <section className="flex min-h-screen items-center justify-center px-5 py-6 sm:px-10">
          <div className="w-full max-w-md animate-fadeIn">
            <button
              type="button"
              onClick={() => {
                if (step === 'address') setStep('personal');
                else if (step === 'plans') setStep('address');
                else onBack();
              }}
              className="mb-4 flex w-fit items-center gap-2 text-xs font-bold text-gray-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              {step === 'address' ? 'Voltar aos dados' : step === 'plans' ? 'Voltar ao endereço' : 'Voltar para o login'}
            </button>

            <BrandLogo compact showSubtitle={false} className="mb-8 lg:hidden" />

            {step !== 'pix' && (
              <ol className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                {[
                  { key: 'personal', label: 'Dados' },
                  { key: 'address', label: 'Endereço' },
                  { key: 'plans', label: 'Plano' },
                ].map(({ key, label }, index) => {
                  const order = ['personal', 'address', 'plans'];
                  const active = order.indexOf(step) >= index;
                  return (
                    <li key={key} className="flex flex-1 items-center gap-2">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
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
            )}

            {step === 'pix' && paid ? (
          <div className="rounded-[28px] border border-emerald-500/30 bg-[#0b101e]/90 p-7 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-400" />
            <h2 className="text-2xl font-extrabold">Pagamento confirmado!</h2>
            <p className="mt-2 text-sm text-gray-400">
              Seu acesso foi liberado. Faça login com seu e-mail para entrar na plataforma.
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
          <div className="rounded-[28px] border border-[#1b253b] bg-[#0b101e]/90 p-7 text-center">
            <QrCode className="mx-auto mb-3 h-8 w-8 text-indigo-400" />
            <h2 className="text-2xl font-extrabold">Pague com PIX para liberar o acesso</h2>
            <p className="mt-2 text-sm text-gray-500">
              Escaneie o QR Code ou copie o código abaixo. Seu acesso é liberado após a confirmação do pagamento.
            </p>

            <img
              alt="QR Code PIX"
              className="mx-auto my-6 h-56 w-56 rounded-xl bg-white p-2"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pix.qrcode)}`}
            />

            <div className="break-all rounded-xl border border-[#202b42] bg-[#0e1626] p-3 text-left font-mono text-[11px] text-gray-300">
              {pix.qrcode}
            </div>
            <button
              type="button"
              onClick={copy}
              className="theme-gradient mx-auto mt-4 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copiado!' : 'Copiar código PIX'}
            </button>
            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Aguardando confirmação do pagamento...
            </p>
            {pix.expiration_date && (
              <p className="mt-4 text-[11px] text-gray-500">
                Expira em {new Date(pix.expiration_date).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        ) : step === 'plans' ? (
          <div className="rounded-[28px] border border-[#1b253b] bg-[#0b101e]/90 p-6 sm:p-8">
            <h2 className="mb-1 text-2xl font-extrabold">Escolha seu plano</h2>
            <p className="mb-6 text-sm text-gray-500">Selecione um plano para gerar o PIX de pagamento.</p>

            <div className="space-y-2">
              {plans.length === 0 && (
                <p className="text-sm text-gray-500">Nenhum plano disponível no momento.</p>
              )}
              {plans.map((plan) => (
                <label
                  key={plan.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-4 text-sm transition ${
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
                  <span className="font-mono text-gray-300">{brl(plan.price)}</span>
                </label>
              ))}
            </div>

            {error && (
              <div role="alert" className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={generatePix}
              disabled={isSubmitting || !planId}
              className="theme-gradient mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-extrabold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
              {isSubmitting ? 'Gerando PIX...' : 'Gerar PIX'}
            </button>
          </div>
        ) : step === 'address' ? (
          <form onSubmit={goTo('plans')} className="rounded-[28px] border border-[#1b253b] bg-[#0b101e]/90 p-5 sm:p-7">
            <h2 className="mb-1 text-2xl font-extrabold">Endereço</h2>
            <p className="mb-5 text-sm text-gray-500">Informe o CEP para completar automaticamente.</p>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-gray-300">CEP</span>
                <input
                  type="text"
                  value={form.cep}
                  onChange={handleCep}
                  required
                  inputMode="numeric"
                  placeholder="Digite o CEP para preencher o endereço"
                  className="w-full rounded-xl border border-[#202b42] bg-[#0e1626] py-2.5 px-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </label>
              {field('Rua', 'rua')}
              {field('Bairro', 'bairro')}
              {field('Cidade', 'cidade')}
            </div>

            <button
              type="submit"
              className="theme-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold transition hover:brightness-110"
            >
              Continuar
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </button>
          </form>
        ) : (
          <form onSubmit={goTo('address')} className="rounded-[28px] border border-[#1b253b] bg-[#0b101e]/90 p-5 sm:p-7">
            <h2 className="mb-1 text-2xl font-extrabold">Dados pessoais</h2>
            <p className="mb-5 text-sm text-gray-500">Preencha seus dados para criar a conta.</p>

            <div className="space-y-3">
              {field('Nome completo', 'name')}
              {field('E-mail', 'email', 'email')}
              {field('Telefone', 'phone', 'tel')}
              {field('CPF', 'cpf')}
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-gray-300">Senha de acesso</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={update('password')}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl border border-[#202b42] bg-[#0e1626] py-2.5 px-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <span className="mt-1.5 block text-[11px] text-gray-500">Você usará essa senha para entrar após o pagamento.</span>
              </label>
            </div>

            <button
              type="submit"
              className="theme-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold transition hover:brightness-110"
            >
              Continuar
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </button>
          </form>
        )}
          </div>
        </section>
      </div>
    </main>
  );
};
