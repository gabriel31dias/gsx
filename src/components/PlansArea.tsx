import React, { useEffect, useState } from 'react';
import { Check, Sparkles, CheckSquare, Loader2, QrCode, Copy, CheckCircle2, CreditCard, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlatform } from '../context/PlatformContext';
import { EMPTY_CARD, cardPayload, maskCardNumber, maskExpiration, type SubscriptionResult } from '../lib/card';

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

interface ApiPlan {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  duration_days?: number;
  features?: string[] | null;
}

const brl = (value: number | string) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const planPriceValue = (value: number | string) => (
  typeof value === 'number' ? value : Number(value.replace(',', '.'))
);

const isFreePlan = (plan: ApiPlan) => !(planPriceValue(plan.price) > 0);

interface PixCheckout {
  orderId: string;
  planName: string;
  qrcode: string; // vazio quando o plano é gratuito (sem PIX)
  expiration?: string;
}

export const PlansArea: React.FC = () => {
  const { session, refreshUser } = useAuth();
  const { refreshXp } = usePlatform();
  const user = session?.user;

  const [plans, setPlans] = useState<ApiPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Checkout PIX autenticado (assinar direto da tela de planos).
  const [subscribingId, setSubscribingId] = useState('');
  const [checkout, setCheckout] = useState<PixCheckout | null>(null);
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Assinatura no cartão: escolha da forma de pagamento -> formulário -> resultado.
  const [pendingPlan, setPendingPlan] = useState<ApiPlan | null>(null);
  const [cardPlan, setCardPlan] = useState<ApiPlan | null>(null);
  // ponytail: cartao vive so neste state ate o POST; limpo logo apos a resposta.
  const [card, setCard] = useState(EMPTY_CARD);
  const [subscription, setSubscription] = useState<SubscriptionResult | null>(null);

  // Plano gratuito assina direto; plano pago pergunta a forma de pagamento antes.
  const startSubscribe = (plan: ApiPlan) => {
    setCheckoutError('');
    if (isFreePlan(plan)) {
      void subscribe(plan, 'pix');
      return;
    }
    setPendingPlan(plan);
  };

  const subscribe = async (plan: ApiPlan, method: 'pix' | 'card') => {
    if (!session?.token) return;
    setSubscribingId(plan.id);
    setCheckoutError('');
    try {
      const body: Record<string, unknown> = { plan_id: plan.id };
      if (method === 'card') {
        body.payment_method = 'card';
        body.card = cardPayload(card);
      }

      const r = await fetch(`${API_BASE_URL}/api/v1/checkout/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
        body: JSON.stringify(body),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || (data.errors && data.errors[0]) || 'Falha ao assinar o plano.');

      // Cartão já foi pra gateway: some do state antes de qualquer re-render.
      if (method === 'card') setCard(EMPTY_CARD);
      setPendingPlan(null);
      setCardPlan(null);

      // Plano gratuito: backend já ativou a assinatura, vai direto pro sucesso.
      if (data.free) {
        setPaid(true);
        setCheckout({ orderId: data.order_id, planName: plan.name, qrcode: '' });
        void refreshUser().catch(() => {});
        void refreshXp();
        return;
      }

      // Cartão: assinatura recorrente, sem QR Code.
      if (data.subscription) {
        setSubscription(data.subscription);
        setPaid(data.status === 'paid');
        setCheckout({ orderId: data.order_id, planName: plan.name, qrcode: '' });
        if (data.status === 'paid') {
          void refreshUser().catch(() => {});
          void refreshXp();
        }
        return;
      }

      if (!data.pix?.qrcode) throw new Error('A gateway não retornou o código PIX.');
      setPaid(false);
      setSubscription(null);
      setCheckout({ orderId: data.order_id, planName: plan.name, qrcode: data.pix.qrcode, expiration: data.pix.expiration_date });
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setSubscribingId('');
    }
  };

  // Polling do pagamento enquanto o modal do PIX está aberto.
  useEffect(() => {
    if (!checkout || paid) return;
    const timer = setInterval(async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/api/v1/checkout/transactions/${checkout.orderId}`);
        const data = await r.json();
        if (data.paid) {
          setPaid(true);
          void refreshUser().catch(() => {}); // atualiza current_plan_id -> marca "Assinado"
          void refreshXp(); // assinatura concede XP -> atualiza menu/perfil
        }
      } catch {
        // ponytail: tenta de novo no próximo tick
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [checkout, paid, refreshUser]);

  const copyPix = async () => {
    if (!checkout) return;
    await navigator.clipboard.writeText(checkout.qrcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeCheckout = () => {
    setCheckout(null);
    setPaid(false);
    setSubscription(null);
  };

  const cancelCardFlow = () => {
    setPendingPlan(null);
    setCardPlan(null);
    setCard(EMPTY_CARD);
  };

  const cardInputClass =
    'w-full rounded-xl border border-[#202b42] bg-[#0e1626] px-3.5 py-2 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

  // Produtor = dono do member (owner_id) ou ?id= da URL (mesma resolução do resto do app).
  const producerId =
    user?.owner_id ||
    new URLSearchParams(window.location.search).get('id') ||
    window.location.pathname.replace(/^\/+/, '').split('/')[0] ||
    '';

  const currentPlanId = user?.current_plan_id ?? null;

  useEffect(() => {
    const query = producerId ? `?id=${encodeURIComponent(producerId)}` : '';
    fetch(`${API_BASE_URL}/api/v1/plans${query}`)
      .then((r) => r.json())
      .then((data) => setPlans(data.plans ?? []))
      .catch(() => setError('Não foi possível carregar os planos.'))
      .finally(() => setLoading(false));
  }, [producerId]);

  return (
    <div className="bg-[#070a13] min-h-screen text-white max-w-7xl mx-auto px-4 lg:px-10 py-8 space-y-12 pb-20 animate-fadeIn">
      <div className="text-center space-y-3 max-w-2xl mx-auto pt-4">
        <span className="text-[10px] bg-indigo-500/10 text-indigo-300 font-extrabold px-3.5 py-1.5 rounded-full border border-indigo-500/25 uppercase tracking-widest inline-block font-mono">
          Planos disponíveis
        </span>
        <h2 className="text-3xl md:text-4.5xl font-extrabold tracking-tight text-white font-sans">
          Escolha seu Plano de Estudos
        </h2>
        <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
          Tenha acesso instantâneo a todo o conteúdo. Assine o plano ideal para você.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : error ? (
        <p className="text-center text-sm text-red-300">{error}</p>
      ) : plans.length === 0 ? (
        <p className="text-center text-sm text-gray-500">Nenhum plano disponível no momento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto pt-2">
          {plans.map((plan, index) => {
            const isCurrent = currentPlanId != null && plan.id === currentPlanId;
            const isPopular = plans.length > 1 && index === plans.length - 1;
            return (
              <div
                key={plan.id}
                className={`bg-[#0e1424] border rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  isCurrent ? 'border-emerald-500/50' : isPopular ? 'border-indigo-500/50 shadow-2xl shadow-indigo-550/5' : 'border-[#1b253b]'
                } hover:scale-101`}
              >
                {isCurrent ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 px-4 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest text-white flex items-center gap-1.5 shadow">
                    <CheckSquare className="w-3.5 h-3.5" />
                    Assinado
                  </span>
                ) : isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest text-white flex items-center gap-1.5 shadow">
                    <Sparkles className="w-3.5 h-3.5" />
                    RECOMENDADO
                  </span>
                )}

                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{plan.description}</p>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1.5 pt-2">
                    <span className="text-3.5xl font-extrabold tracking-tight text-indigo-300 font-mono">
                      {isFreePlan(plan) ? 'Gratuito' : brl(plan.price)}
                    </span>
                    {plan.duration_days ? (
                      <span className="text-gray-500 text-xs font-semibold">/ {plan.duration_days} dias</span>
                    ) : null}
                  </div>

                  {Array.isArray(plan.features) && plan.features.length > 0 && (
                    <div className="space-y-3 pt-5 border-t border-[#1b253b]/60">
                      {plan.features.map((b, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-300">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-8">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full bg-[#12192d] border border-emerald-500/30 text-emerald-400 font-bold text-xs py-3 rounded-2xl cursor-default flex items-center justify-center gap-2"
                    >
                      <CheckSquare className="w-4 h-4 fill-emerald-500/10" />
                      Seu Plano Ativo Atualmente
                    </button>
                  ) : (
                    <button
                      onClick={() => startSubscribe(plan)}
                      disabled={subscribingId === plan.id}
                      className={`w-full font-bold text-xs py-3 rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
                        isPopular
                          ? 'bg-gradient-to-r from-indigo-500 to-[#4f46e5] hover:to-indigo-500 text-white shadow-lg shadow-indigo-650/15'
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      {subscribingId === plan.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : isFreePlan(plan) ? 'Ativar Grátis' : 'Assinar Agora'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {checkoutError && (
        <p className="text-center text-sm text-red-300">{checkoutError}</p>
      )}

      {/* Escolha da forma de pagamento (plano pago) */}
      {pendingPlan && !cardPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md animate-fadeIn rounded-3xl border border-[#1b253b] bg-[#0e1424] p-7 text-white shadow-2xl">
            <button
              onClick={cancelCardFlow}
              className="absolute right-4 top-4 cursor-pointer rounded-lg bg-white/5 p-1 text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="text-xl font-extrabold">Como quer pagar?</h3>
            <p className="mt-1 text-sm text-gray-400">
              Plano <strong className="text-white">{pendingPlan.name}</strong> · {brl(pendingPlan.price)}
            </p>

            <div className="mt-5 space-y-2.5">
              <button
                onClick={() => subscribe(pendingPlan, 'pix')}
                disabled={subscribingId === pendingPlan.id}
                className="flex w-full items-center gap-3 rounded-2xl border border-[#202b42] bg-[#0e1626] p-4 text-left transition hover:border-indigo-500/60 disabled:opacity-60"
              >
                <QrCode className="h-5 w-5 text-indigo-400" />
                <span>
                  <span className="block text-sm font-bold">PIX</span>
                  <span className="block text-xs text-gray-500">Pagamento único, acesso por {pendingPlan.duration_days ?? 30} dias</span>
                </span>
              </button>

              <button
                onClick={() => setCardPlan(pendingPlan)}
                className="flex w-full items-center gap-3 rounded-2xl border border-[#202b42] bg-[#0e1626] p-4 text-left transition hover:border-indigo-500/60"
              >
                <CreditCard className="h-5 w-5 text-indigo-400" />
                <span>
                  <span className="block text-sm font-bold">Cartão de crédito</span>
                  <span className="block text-xs text-gray-500">Assinatura mensal com renovação automática</span>
                </span>
              </button>
            </div>

            {checkoutError && (
              <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">{checkoutError}</p>
            )}
          </div>
        </div>
      )}

      {/* Formulário do cartão */}
      {cardPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <form
            onSubmit={(event) => { event.preventDefault(); void subscribe(cardPlan, 'card'); }}
            className="relative w-full max-w-md animate-fadeIn rounded-3xl border border-[#1b253b] bg-[#0e1424] p-7 text-white shadow-2xl"
          >
            <button
              type="button"
              onClick={cancelCardFlow}
              className="absolute right-4 top-4 cursor-pointer rounded-lg bg-white/5 p-1 text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="text-xl font-extrabold">Dados do cartão</h3>
            <p className="mt-1 text-sm text-gray-400">
              {brl(cardPlan.price)} por mês, renovação automática. Cancele quando quiser.
            </p>

            <div className="mt-5 space-y-2.5">
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-gray-300">Número do cartão</span>
                <input
                  value={card.number}
                  onChange={(e) => setCard((prev) => ({ ...prev, number: maskCardNumber(e.target.value) }))}
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                  required
                  minLength={13}
                  className={`${cardInputClass} font-mono`}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-gray-300">Nome impresso no cartão</span>
                <input
                  value={card.holderName}
                  onChange={(e) => setCard((prev) => ({ ...prev, holderName: e.target.value.toUpperCase() }))}
                  autoComplete="cc-name"
                  placeholder="FULANO DE TAL"
                  required
                  className={`${cardInputClass} uppercase`}
                />
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-gray-300">Validade</span>
                  <input
                    value={card.expiration}
                    onChange={(e) => setCard((prev) => ({ ...prev, expiration: maskExpiration(e.target.value) }))}
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/AAAA"
                    required
                    pattern="\d{2}/\d{2}(\d{2})?"
                    className={`${cardInputClass} font-mono`}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-gray-300">CVV</span>
                  <input
                    value={card.cvv}
                    onChange={(e) => setCard((prev) => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                    required
                    minLength={3}
                    className={`${cardInputClass} font-mono`}
                  />
                </label>
              </div>
            </div>

            <p className="mt-3 flex items-start gap-1.5 text-[11px] text-gray-500">
              <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-400" />
              Os dados do cartão vão direto para a operadora. Guardamos apenas a bandeira, os 4 últimos dígitos e a validade.
            </p>

            {checkoutError && (
              <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">{checkoutError}</p>
            )}

            <button
              type="submit"
              disabled={subscribingId === cardPlan.id}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-[#4f46e5] py-3 text-sm font-extrabold text-white transition hover:to-indigo-500 disabled:opacity-60"
            >
              {subscribingId === cardPlan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              {subscribingId === cardPlan.id ? 'Processando...' : 'Assinar'}
            </button>
          </form>
        </div>
      )}

      {/* Modal de pagamento PIX */}
      {checkout && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1424] border border-[#1b253b] rounded-3xl max-w-md w-full p-7 text-center text-white shadow-2xl relative animate-fadeIn">
            <button
              onClick={closeCheckout}
              className="absolute top-4 right-4 p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {paid ? (
              <>
                <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-400" />
                <h3 className="text-2xl font-extrabold">
                  {subscription ? 'Assinatura ativa!' : checkout.qrcode ? 'Assinatura confirmada!' : 'Plano ativado!'}
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  Seu plano <strong className="text-white">{checkout.planName}</strong> já está ativo.
                  {subscription && ' A renovação acontece automaticamente todo mês.'}
                </p>
                {subscription && (
                  <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-xl border border-[#202b42] bg-[#0e1626] px-3 py-2 font-mono text-xs text-gray-300">
                    <CreditCard className="h-3.5 w-3.5 text-indigo-400" />
                    {subscription.card.brand?.toUpperCase()} •••• {subscription.card.last4} · val. {subscription.card.expiration}
                  </p>
                )}
                <button
                  onClick={closeCheckout}
                  className="mx-auto mt-6 bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl text-sm font-extrabold"
                >
                  Concluir
                </button>
              </>
            ) : subscription ? (
              <>
                <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-indigo-400" />
                <h3 className="text-xl font-extrabold">Confirmando com a operadora…</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Assinatura registrada no cartão {subscription.card.brand?.toUpperCase()} •••• {subscription.card.last4}.
                  Assim que a operadora aprovar, seu acesso é liberado automaticamente.
                </p>
              </>
            ) : (
              <>
                <QrCode className="mx-auto mb-3 h-8 w-8 text-indigo-400" />
                <h3 className="text-xl font-extrabold">Pague com PIX para assinar</h3>
                <p className="mt-1 text-xs text-gray-500">Plano {checkout.planName}. Acesso liberado após a confirmação.</p>

                <img
                  alt="QR Code PIX"
                  className="mx-auto my-5 h-52 w-52 rounded-xl bg-white p-2"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(checkout.qrcode)}`}
                />

                <div className="break-all rounded-xl border border-[#202b42] bg-[#0e1626] p-3 text-left font-mono text-[11px] text-gray-300">
                  {checkout.qrcode}
                </div>
                <button
                  onClick={copyPix}
                  className="mx-auto mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-3 text-sm font-extrabold"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copiado!' : 'Copiar código PIX'}
                </button>
                <p className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Aguardando confirmação do pagamento...
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
