import React, { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { 
  User, 
  Mail, 
  KeyRound, 
  Award, 
  Heart, 
  History, 
  Settings, 
  Camera, 
  CheckCircle, 
  Star, 
  Trash2,
  Calendar,
  CreditCard,
  Crown
} from 'lucide-react';
import { CertificateGenerator } from './CertificateGenerator';

export const StudentProfile: React.FC = () => {
  const { 
    currentUser, 
    updateProfile, 
    changePassword, 
    certificates, 
    courses, 
    favoriteCourseIds, 
    toggleFavorite, 
    activityLogs, 
    badges, 
    navigateTo 
  } = usePlatform();

  // local states for inputs
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'badges' | 'history' | 'billing'>('profile');
  const [selectedCertCourseId, setSelectedCertCourseId] = useState<string | null>(null);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    updateProfile(name, email, avatar);
    alert("Perfil de aluno atualizado com sucesso!");
  };

  const handleChangePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass.trim() || !currentPass.trim()) {
      alert("Preencha todos os campos correspondentes!");
      return;
    }
    if (newPass !== confirmPass) {
      alert("A nova senha e confirmação diferem!");
      return;
    }
    changePassword(newPass);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    alert("Senha interna modificada com sucesso!");
  };

  const handleAvatarSelect = () => {
    const avatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    ];
    const nextIdx = (avatars.indexOf(avatar) + 1) % avatars.length;
    setAvatar(avatars[nextIdx]);
  };

  const favoriteCourses = courses.filter(c => favoriteCourseIds.includes(c.id));

  return (
    <div className="bg-[#070a13] min-h-screen text-white max-w-7xl mx-auto px-4 lg:px-10 py-8 space-y-8 pb-20 animate-fadeIn">
      
      {/* Profile Header Card */}
      <div className="bg-[#0e1424] border border-[#1b253b]/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-6 z-10">
          {/* Avatar frame */}
          <div className="relative group cursor-pointer" onClick={handleAvatarSelect}>
            <img 
              referrerPolicy="no-referrer"
              src={avatar} 
              alt={currentUser.name} 
              className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-xl"
            />
            <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
              <Camera className="w-5 h-5 text-gray-300" />
            </div>
            <span className="absolute -bottom-1.5 -right-1.5 bg-indigo-600 p-2 rounded-xl font-bold shadow-lg" title="Mudar avatar">
              <Settings className="w-3.5 h-3.5 text-white animate-spin-slow" />
            </span>
          </div>

          <div className="text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight text-white">{currentUser.name}</h2>
              {currentUser.membershipStatus === 'active' && (
                <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase flex items-center gap-1.5 shadow">
                  <Crown className="w-3.5 h-3.5 fill-indigo-500/10 text-indigo-400" />
                  Membro AluraDev {currentUser.membershipPlan === 'Nenhum' ? 'Standard' : currentUser.membershipPlan}
                </span>
              )}
            </div>
            <p className="text-gray-400 text-xs font-mono">{currentUser.email}</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 justify-center md:justify-start">
              <Calendar className="w-3.5 h-3.5" />
              <span>Estudante desde {currentUser.joinedAt}</span>
            </div>
          </div>
        </div>        {/* Level metrics gamification overview */}
        <div className="bg-[#090d16] border border-[#1b253b]/80 p-4 rounded-2xl grid grid-cols-3 gap-3 md:flex md:items-center md:gap-6 md:divide-x md:divide-[#1b253b]/80 z-10 shadow-md w-full md:w-auto">
          <div className="text-center px-1 md:px-2">
            <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider block font-mono">Pontos</span>
            <span className="text-sm md:text-lg font-black text-amber-500 font-mono mt-0.5 block">{currentUser.points} XP</span>
          </div>
          <div className="text-center px-1 md:pl-6 md:pr-2 border-l border-[#1b253b]/80 md:border-none">
            <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider block font-mono">Diplomas</span>
            <span className="text-sm md:text-lg font-black text-indigo-400 font-mono mt-0.5 block">{certificates.length}</span>
          </div>
          <div className="text-center px-1 md:pl-6 md:pr-2 border-l border-[#1b253b]/80 md:border-none">
            <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider block font-mono">Medalhas</span>
            <span className="text-sm md:text-lg font-black text-purple-400 font-mono mt-0.5 block">
              {badges.filter(b => b.unlockedAt).length} / {badges.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main split tab layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Navigation layout tab sidebar */}
        <div className="w-full lg:w-[25%] flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2.5 lg:pb-0 gap-2 lg:gap-0 lg:space-y-2 shrink-0 scrollbar-none">
          {[
            { id: 'profile', label: 'Dados do Perfil', icon: Settings },
            { id: 'favorites', label: 'Meus Favoritos', icon: Heart },
            { id: 'badges', label: 'Minhas Conquistas', icon: Award },
            { id: 'history', label: 'Histórico de Estudo', icon: History },
            { id: 'billing', label: 'Plano & Cobrança', icon: CreditCard }
          ].map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap shrink-0 lg:w-full text-left font-bold text-xs px-4 py-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                  isTabActive
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-650 text-white border-transparent shadow shadow-indigo-600/20'
                  : 'bg-[#0e1424] text-gray-400 border-[#1b253b] hover:text-white hover:border-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 text-indigo-400" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Active tab content area */}
        <div className="flex-grow bg-[#0e1424] border border-[#1b253b]/80 rounded-3xl p-6 md:p-8 shadow-md">
          
          {/* PROFILE DATA TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Form: Name & Email */}
              <form onSubmit={handleUpdate} className="space-y-4">
                <h3 className="font-bold text-xs text-indigo-400 tracking-wider uppercase border-b border-[#1b253b]/50 pb-2.5 font-mono">Informações Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 block font-semibold">Nome Completo</label>
                    <input 
                      type="text"
                      className="w-full bg-[#090d16] border border-[#1b253b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 block font-semibold">E-mail Cadastrado</label>
                    <input 
                      type="email"
                      className="w-full bg-[#090d16] border border-[#1b253b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white px-5 py-2.5 rounded-xl transition cursor-pointer border border-indigo-400/20"
                >
                  Salvar Alterações
                </button>
              </form>

              {/* Password update segment */}
              <form onSubmit={handleChangePass} className="space-y-4 pt-4 border-t border-[#1b253b]/50">
                <h3 className="font-bold text-xs text-indigo-400 tracking-wider uppercase border-b border-[#1b253b]/50 pb-2.5 font-mono">Alteração de Senha</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 block font-semibold">Senha Atual</label>
                    <input 
                      type="password"
                      className="w-full bg-[#090d16] border border-[#1b253b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 block font-semibold">Nova Senha</label>
                    <input 
                      type="password"
                      className="w-full bg-[#090d16] border border-[#1b253b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Mínimo 6 dígitos"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 block font-semibold">Confirmar Nova Senha</label>
                    <input 
                      type="password"
                      className="w-full bg-[#090d16] border border-[#1b253b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white px-5 py-2.5 rounded-xl transition cursor-pointer border border-indigo-400/20"
                >
                  Modificar Senha
                </button>
              </form>

            </div>
          )}

          {/* FAVORITES VIEW TAB */}
          {activeTab === 'favorites' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="font-bold text-xs text-indigo-400 tracking-wider uppercase border-b border-[#1b253b]/50 pb-2.5 font-mono">Minhas Trilhas Favoritas</h3>
              
              {favoriteCourses.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-6 text-center">Nenhum curso adicionado aos favoritos ainda. Volte para home e faça a curadoria!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteCourses.map(c => (
                    <div key={c.id} className="bg-[#090d16]/30 border border-[#1b253b]/80 p-4 rounded-2xl flex items-center gap-4 justify-between hover:border-indigo-500/35 transition shadow-sm">
                      <div className="flex items-center gap-3">
                        <img 
                          referrerPolicy="no-referrer"
                          src={c.coverImage} 
                          alt={c.title} 
                          className="w-16 h-10 object-cover rounded-lg border border-[#1b253b]/40"
                        />
                        <div className="text-left min-w-0 flex-1">
                          <p className="font-bold text-xs text-gray-200 leading-tight truncate">{c.title}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Professor {c.instructor}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => navigateTo('learning', c.id)}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 transition font-bold text-[10px] uppercase tracking-wider rounded-lg cursor-pointer"
                        >
                          Acessar
                        </button>
                        <button 
                          onClick={() => toggleFavorite(c.id)}
                          className="p-1.5 hover:bg-white/5 text-gray-500 hover:text-rose-500 transition rounded-lg cursor-pointer"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BADGES ACHIEVEMENTS TAB */}
          {activeTab === 'badges' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="font-bold text-xs text-indigo-400 tracking-wider uppercase border-b border-[#1b253b]/50 pb-2.5 font-mono">Central de Conquistas e Medalhas</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {badges.map(b => {
                  const isUnlocked = !!b.unlockedAt;
                  return (
                    <div 
                      key={b.id} 
                      className={`p-4 rounded-2xl border flex items-center gap-4 transition-all duration-300 ${
                        isUnlocked 
                        ? 'bg-purple-950/20 border-purple-500/30 text-white' 
                        : 'bg-[#090d16]/30 border-[#1b253b]/40 opacity-45 text-gray-500 select-none'
                      }`}
                    >
                      <div className={`p-3 rounded-2xl ${isUnlocked ? 'bg-purple-600/20 text-purple-400' : 'bg-[#12192c] text-gray-600'}`}>
                        <Award className="w-5 h-5 shrink-0" />
                      </div>
                      <div className="text-left">
                        <div className="flex gap-2 items-center">
                          <p className="font-bold text-xs text-gray-200 leading-none">{b.title}</p>
                          {isUnlocked && (
                            <span className="bg-purple-500/10 border border-purple-500/20 text-purple-405 text-purple-400 text-[8px] font-bold px-1 rounded uppercase tracking-wider font-mono">
                              Ativo
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">{b.description}</p>
                        {isUnlocked && (
                          <p className="text-[9px] text-gray-500 mt-1 font-mono">Conquistado em {b.unlockedAt}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* HISTORY ACTIVITY LOG TAB */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#1b253b]/50 pb-2 flex-wrap flex items-center justify-between">
                <h3 className="font-bold text-xs text-indigo-400 tracking-wider uppercase font-mono">Histórico Recente de Atividades</h3>
                <span className="text-[10px] text-gray-500 font-mono">Últimos eventos do portal</span>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {activityLogs.length === 0 ? (
                  <p className="text-xs text-gray-500 italic text-center py-6">Nenhuma atividade registrada.</p>
                ) : (
                  activityLogs.map(log => (
                    <div key={log.id} className="p-3 bg-[#090d16]/30 hover:bg-[#090d16]/50 transition rounded-xl border border-[#1b253b]/60 flex items-start gap-3 text-left">
                      <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg mt-0.5 shrink-0">
                        <History className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs flex-1">
                        <p className="text-gray-300 font-medium">{log.description}</p>
                        <span className="text-[9px] text-gray-500 block font-mono mt-0.5">{log.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* BILLING / PLANS MANAGEMENT */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="font-bold text-xs text-indigo-400 tracking-wider uppercase border-b border-[#1b253b]/50 pb-2.5 font-mono">Gerenciamento de Assinatura</h3>
              
              <div className="bg-[#090d16]/50 border border-[#1b253b] p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-left">
                  <p className="text-xs text-gray-505 text-gray-400">Status atual da sua ementa de estudos</p>
                  <p className="text-lg font-black text-white mt-1 uppercase tracking-tight flex items-center gap-1.5">
                    Plano {currentUser.membershipPlan === 'Nenhum' ? 'Grátis' : currentUser.membershipPlan}
                    {currentUser.membershipStatus === 'active' && (
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase font-mono">
                        Ativado
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm leading-relaxed">Suas faturas de renovação são gerenciadas de forma automatizada no portal simulado.</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  {currentUser.membershipPlan !== 'Nenhum' ? (
                    <button 
                      onClick={() => alert("Este plano é simulado. Para fins de demonstração, sua assinatura permanecerá ativa.")}
                      className="w-full md:w-auto bg-[#12192c] hover:bg-[#12192c]/65 text-xs text-gray-300 px-4 py-2.5 rounded-xl border border-[#1b253b] transition cursor-pointer font-bold duration-200"
                    >
                      Gerenciar Cobrança
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigateTo('plans')}
                      className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white px-5 py-2.5 rounded-xl transition cursor-pointer border border-indigo-400/20 shadow-md shadow-indigo-605/10"
                    >
                      Assinar Plano Premium
                    </button>
                  )}
                </div>
              </div>

              {/* Invoices Logs list */}
              <div className="space-y-3">
                <h4 className="font-bold text-[10px] text-gray-400 uppercase tracking-widest text-left font-mono">Invoices e Cobranças Realizadas</h4>
                <div className="border border-[#1b253b]/80 divide-y divide-[#1b253b]/60 rounded-xl overflow-hidden bg-[#090d16]/30 text-xs">
                  <div className="p-3 flex items-center justify-between text-gray-300 font-extrabold bg-[#0e1424] text-[11px] font-mono">
                    <span>Identificador / Data</span>
                    <span>Forma de Envio</span>
                    <span>Total Pago</span>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="text-left">
                      <p className="font-bold text-gray-300">Invoice: DEV-2830219</p>
                      <span className="text-[10px] text-gray-500">31 de Maio, 2026</span>
                    </div>
                    <span className="text-gray-400 font-medium">PIX Instantâneo</span>
                    <span className="text-emerald-400 font-mono font-extrabold font-semibold">R$ 49,90</span>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="text-left">
                      <p className="font-bold text-gray-300">Invoice: DEV-1940251</p>
                      <span className="text-[10px] text-gray-500">30 de Abril, 2026</span>
                    </div>
                    <span className="text-gray-400 font-medium">Cartão de Crédito</span>
                    <span className="text-emerald-400 font-mono font-extrabold font-semibold">R$ 49,90</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Issuing degree helper */}
      {selectedCertCourseId && (
        <CertificateGenerator 
          courseId={selectedCertCourseId} 
          onClose={() => setSelectedCertCourseId(null)} 
        />
      )}

    </div>
  );
};
