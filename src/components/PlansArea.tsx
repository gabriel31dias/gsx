import React, { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { Check, CreditCard, Sparkles, AlertCircle, Copy, CheckSquare } from 'lucide-react';

export const PlansArea: React.FC = () => {
  const { currentUser, subscribeToPlan } = usePlatform();
  const [selectedPlan, setSelectedPlan] = useState<'Standard' | 'Premium' | null>(null);
  const [checkoutMethod, setCheckoutMethod] = useState<'pix' | 'card'>('pix');
  
  // Credit Card Form variables
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [simulatedCheckoutLoading, setSimulatedCheckoutLoading] = useState(false);

  const plans = [
    {
      id: 'Standard' as const,
      title: 'Standard',
      price: 'R$ 29,90',
      period: 'por mês',
      description: 'Ideal para iniciar sua especialização profissional com alta velocidade de carregamento.',
      benefits: [
        'Acesso completo a todas as turmas clássicas',
        'Suporte comunitário via fórum de tópicos',
        'Capacidade de assistir em desktop, mobile e tablet',
        'Quiz básicos de avaliação de aula'
      ],
      isPopular: false
    },
    {
      id: 'Premium' as const,
      title: 'Premium Master',
      price: 'R$ 49,90',
      period: 'por mês',
      description: 'Acesso total de alta qualidade, ideal para desenvolvedores que visam o topo do mercado.',
      benefits: [
        'Acesso ILIMITADO a todos os cursos atuais e futuros',
        'Emissão ilimitada de diplomas digitais verificados',
        'Painel dinâmico de gamificação e ligas',
        'Mentoria fechada com professores no Fórum',
        'Suporte VIP prioritário 24/7'
      ],
      isPopular: true
    }
  ];

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setSimulatedCheckoutLoading(true);
    setTimeout(() => {
      setSimulatedCheckoutLoading(false);
      subscribeToPlan(selectedPlan);
      alert(`Parabéns! Sua assinatura do Plano ${selectedPlan} foi compensada com absoluto sucesso. Bons Estudos!`);
      setSelectedPlan(null);
    }, 1800);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText("00020101021226830014br.gov.bcb.pix2561api.mercadopago.com/v1/payments/73021950");
    alert("Código Copia e Cola do PIX enviado para área de transferência!");
  };

  return (
    <div className="bg-[#070a13] min-h-screen text-white max-w-7xl mx-auto px-4 lg:px-10 py-8 space-y-12 pb-20 animate-fadeIn">
      
      {/* Title Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto pt-4">
        <span className="text-[10px] bg-indigo-500/10 text-indigo-300 font-extrabold px-3.5 py-1.5 rounded-full border border-indigo-500/25 uppercase tracking-widest inline-block font-mono">
          Matrícula Ativa Estudo
        </span>
        <h2 className="text-3xl md:text-4.5xl font-extrabold tracking-tight text-white font-sans">
          Escolha seu Plano de Estudos
        </h2>
        <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
          Tenha acesso instantâneo às melhores ementas técnicas inspiradas no estilo Alura de ensino, embaladas no visual inteligente de alta performance.
        </p>
      </div>

      {/* Plans comparison cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-2">
        {plans.map(plan => {
          const isCurrent = currentUser.membershipPlan === plan.id;
          return (
            <div 
              key={plan.id}
              className={`bg-[#0e1424] border rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                plan.isPopular 
                ? 'border-indigo-500/50 shadow-2xl shadow-indigo-550/5' 
                : 'border-[#1b253b]'
              } hover:scale-101`}
            >
              {plan.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest text-white flex items-center gap-1.5 shadow">
                  <Sparkles className="w-3.5 h-3.5" />
                  RECOMENDADO
                </span>
              )}

              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.title}</h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1.5 pt-2">
                  <span className="text-3.5xl font-extrabold tracking-tight text-indigo-350 text-indigo-300 font-mono">{plan.price}</span>
                  <span className="text-gray-500 text-xs font-semibold">{plan.period}</span>
                </div>

                {/* Benefits listed */}
                <div className="space-y-3 pt-5 border-t border-[#1b253b]/60">
                  {plan.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                {isCurrent ? (
                  <button 
                    disabled 
                    className="w-full bg-[#12192d] border border-emerald-500/30 text-emerald-450 text-emerald-400 font-bold text-xs py-3 rounded-2xl cursor-default flex items-center justify-center gap-2"
                  >
                    <CheckSquare className="w-4 h-4 fill-emerald-500/10" />
                    Seu Plano Ativo Atualmente
                  </button>
                ) : (
                  <button 
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full font-bold text-xs py-3 rounded-2xl cursor-pointer transition-all ${
                      plan.isPopular
                      ? 'bg-gradient-to-r from-indigo-500 to-[#4f46e5] hover:to-indigo-500 text-white shadow-lg shadow-indigo-650/15'
                      : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    Assinar Agora
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CHECKOUT MODAL IF REGISTER SELECTED */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1424] border border-[#1b253b] rounded-3xl max-w-md w-full p-6 space-y-5 text-white shadow-2xl relative animate-fadeIn">
            <button 
              onClick={() => setSelectedPlan(null)}
              className="absolute top-4 right-4 p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-[9px] bg-indigo-500/10 text-indigo-300 font-bold px-2.5 py-1 rounded uppercase font-mono border border-indigo-500/10">Simulador de Transação</span>
              <h3 className="text-md font-extrabold tracking-tight text-white pt-2">Checkout: Assinatura {selectedPlan}</h3>
              <p className="text-xs text-gray-455 text-gray-400">Total a pagar: <strong className="text-white">{selectedPlan === 'Standard' ? 'R$ 29,90' : 'R$ 49,90'} / mês</strong></p>
            </div>

            {/* Simulated selector of checkout providers */}
            <div className="grid grid-cols-2 gap-2 bg-[#090d16] p-1.5 rounded-xl border border-[#1b253b]">
              <button 
                onClick={() => setCheckoutMethod('pix')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${checkoutMethod === 'pix' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
              >
                Chave PIX Instantânea
              </button>
              <button 
                onClick={() => setCheckoutMethod('card')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${checkoutMethod === 'card' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
              >
                Cartão Gateway
              </button>
            </div>

            {/* FORM WRAPPERS BASED ON PAYMENT OPTIONS */}
            {checkoutMethod === 'pix' ? (
              <div className="space-y-4 pt-1 animate-fadeIn">
                <div className="bg-[#090d16] border border-[#1b253b] p-4 rounded-2xl flex flex-col items-center text-center space-y-3">
                  
                  {/* Fake QR visual simulation */}
                  <div className="w-28 h-28 bg-white p-2 rounded-xl flex flex-wrap gap-0.5 items-center justify-center">
                    <div className="grid grid-cols-6 gap-0.5 w-full h-full">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`rounded-[1px] ${
                            (i % 3 === 0 || i < 6 || i % 6 === 0 || (i > 25 && i % 4 === 0)) 
                            ? 'bg-[#090d16]' 
                            : 'bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-xs">
                    <p className="font-bold text-gray-300">Escaneie o QR Code PIX</p>
                    <p className="text-gray-500 text-[10px] mt-0.5">Aprovação imediata em micro-segundos.</p>
                  </div>
                  
                  <button
                    onClick={handleCopyPix}
                    className="flex items-center gap-1.5 bg-[#12192c] hover:bg-indigo-600/15 text-[10px] font-bold text-indigo-300 hover:text-white px-3 py-2 rounded-lg border border-[#1b253b] cursor-pointer w-full justify-center transition uppercase tracking-wider font-mono"
                  >
                    Copiar Código PIX Copia-e-Cola
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCheckoutSubmit}
                  disabled={simulatedCheckoutLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white py-3 rounded-xl disabled:opacity-30 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {simulatedCheckoutLoading ? 'Efetuando transação e emitindo nota...' : 'Confirmar Pagamento Compensado'}
                </button>
              </div>
            ) : (
              // CREDIT CARD OR GATEWAY FORM
              <form onSubmit={handleCheckoutSubmit} className="space-y-4 animate-fadeIn">
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-gray-400 block font-semibold">Número do Cartão</label>
                    <input 
                      type="text"
                      className="w-full bg-[#090d16] border border-[#1b253b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-400 block font-semibold">Nome Impresso</label>
                    <input 
                      type="text"
                      className="w-full bg-[#090d16] border border-[#1b253b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="GABRIEL S SILVA"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-400 block font-semibold">Validade</label>
                      <input 
                        type="text"
                        className="w-full bg-[#090d16] border border-[#1b253b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-400 block font-semibold">CVV</label>
                      <input 
                        type="password"
                        className="w-full bg-[#090d16] border border-[#1b253b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                        value={cardCVV}
                        onChange={(e) => setCardCVV(e.target.value)}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-950/20 border border-blue-500/10 rounded-xl text-[10px] text-gray-500 flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Ambiente Sandboxed: Suporta simulações de Stripe e Mercado Pago de alta fidelidade sem cobrança real.</span>
                </div>

                <button
                  type="submit"
                  disabled={simulatedCheckoutLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white py-3 rounded-xl disabled:opacity-30 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {simulatedCheckoutLoading ? 'Processando assinatura mensal com API...' : 'Ativar Minha Assinatura Mensal'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M18 6 6 18"/>
      <path d="m6 6 12 12"/>
    </svg>
  );
}
