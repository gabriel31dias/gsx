import React, { useState, useEffect } from 'react';
import { Radio, Users, Send, MapPin, Sparkles, MessageSquare } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

export const LiveStreamArea: React.FC = () => {
  const { currentUser, addPoints } = usePlatform();
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Rodrigo Brandão', msg: 'Melhor aula interativa que assisti hoje!', time: '22:31' },
    { id: 2, user: 'Maria Antônia', msg: 'Estou com dificuldades de configurar a porta do Postgres local.', time: '22:32' },
    { id: 3, user: 'Carlos Henrique', msg: 'O instrutor vai disponibilizar esse layout no GitHub?', time: '22:32' },
  ]);
  const [typedMessage, setTypedMessage] = useState('');
  const [viewerCount, setViewerCount] = useState(1480);

  // Simulate incoming chat messages
  useEffect(() => {
    const chatInterval = setInterval(() => {
      const mockNames = ['Júlio Verne', 'Helena Mota', 'Tadeu Salles', 'Vanessa Costa', 'Ana Julia'];
      const mockQuotes = [
        'Sensacional essa explicação sobre conciliação e renderização!',
        'No TypeScript de alta performance precisa utilizar herança de tipos?',
        'Nossa, que design incrível desse portal AluraDev!',
        'PIX copiado! Acabei de assinar o plano Master Premium.',
        'AluraDev é mil vezes melhor que concorrentes clássicos 🎉'
      ];

      const rollName = mockNames[Math.floor(Math.random() * mockNames.length)];
      const rollQuote = mockQuotes[Math.floor(Math.random() * mockQuotes.length)];
      const nowH = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      setChatMessages(prev => [...prev, { id: Date.now(), user: rollName, msg: rollQuote, time: nowH }].slice(-15));
      setViewerCount(v => v + Math.floor(Math.random() * 11) - 5);
    }, 4500);

    return () => clearInterval(chatInterval);
  }, []);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      user: currentUser.name,
      msg: typedMessage,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    setTypedMessage('');
    addPoints(10); // Reward active live participation point
  };

  return (
    <div className="bg-[#070a13] min-h-screen text-white max-w-7xl mx-auto px-4 lg:px-10 py-8 space-y-6 pb-20 animate-fadeIn">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1b253b]/50 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
            <span className="text-xs text-indigo-400 font-extrabold tracking-widest uppercase font-mono">TRANSMISSÃO EM TEMPO REAL (LIVE)</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-105 text-gray-100">Live Class: Arquitetura de Software em Cloud Run</h2>
        </div>

        <div className="bg-[#0e1424] border border-[#1b253b] px-3.5 py-1.5 rounded-xl font-bold text-xs text-indigo-300 flex items-center gap-2 w-fit">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>{viewerCount} Assistindo agora</span>
        </div>
      </div>

      {/* Main split: stream player and chat sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Stream Simulator Panel */}
        <div className="flex-1 space-y-4">
          <div className="relative aspect-[16/9] w-full bg-[#090d16] rounded-2xl border border-[#1b253b] shadow-2xl flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#070a13] via-indigo-950/10 to-black/80" />
            
            {/* Live Indicator Icon */}
            <span className="absolute top-4 left-4 bg-indigo-600 text-white font-extrabold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>AO VIVO</span>
            </span>

            {/* Simulated Speaker View */}
            <div className="z-10 text-center space-y-4 max-w-sm px-4">
              <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 rounded-3xl mx-auto shadow-2xl shadow-indigo-550/25">
                <img 
                  referrerPolicy="no-referrer"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                  alt="Live Host" 
                  className="w-full h-full object-cover rounded-[20px]"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400 font-medium">Instrutora Responsável</p>
                <p className="font-extrabold text-base text-white">Marina Rocha de Alencar</p>
                <p className="text-xs text-indigo-400 flex items-center gap-1 justify-center">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  São Paulo Campus HQ
                </p>
              </div>

              <div className="bg-[#0e1424]/90 border border-[#1b253b]/60 p-3 rounded-xl text-xs text-gray-400 leading-relaxed text-center font-sans">
                <span>Esta live aula interativa abordará a integração nativa de APIs REST estruturadas no Cloud Run da GCP.</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0e1424] border border-[#1b253b] p-5 rounded-2xl flex items-center gap-4 text-xs text-gray-455 text-gray-400 shadow-md">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-300 rounded-xl">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <p className="font-bold text-gray-200 mb-0.5">Pontuação Ativa Ativada!</p>
              <p className="leading-relaxed">Envie dúvidas ou feedbacks construtivos no painel do chat para receber pontos de experiência extra no seu perfil escolar!</p>
            </div>
          </div>
        </div>

        {/* Realtime Live Chat block */}
        <div className="w-full lg:w-80 bg-[#0e1424] border border-[#1b253b] rounded-2xl p-4 flex flex-col justify-between h-[520px] shadow-2xl">
          <div className="flex items-center gap-1.5 border-b border-[#1b253b]/50 pb-2.5 mb-3">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-xs text-gray-200">Chat Interativo Real-Time</span>
          </div>

          {/* Messages wrapper */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[360px] text-xs">
            {chatMessages.map(item => (
              <div key={item.id} className="space-y-0.5 leading-relaxed">
                <div className="flex items-baseline justify-between gap-2">
                  <strong className="text-indigo-300 font-bold block truncate max-w-40">{item.user}</strong>
                  <span className="text-[9px] text-gray-500 font-mono">{item.time}</span>
                </div>
                <p className="text-gray-300 font-normal">{item.msg}</p>
              </div>
            ))}
          </div>

          {/* Form write input */}
          <form onSubmit={handleSendChat} className="flex gap-2 pt-3 border-t border-[#1b253b]/60 mt-2">
            <input 
              type="text"
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              placeholder="Digite aqui para enviar ao chat..."
              className="flex-grow bg-[#090d16] border border-[#1b253b] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
            />
            <button 
              type="submit"
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition cursor-pointer shrink-0 border border-indigo-400/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
