import React from 'react';
import { usePlatform } from '../context/PlatformContext';
import { 
  Compass, 
  Trophy, 
  Tv, 
  CreditCard, 
  ShieldAlert, 
  X, 
  Award, 
  Flame, 
  User, 
  ChevronRight,
  Layout,
  Play,
  LogOut
} from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, activeScreen, navigateTo, certificates, badges } = usePlatform();
  const { logout } = useAuth();

  const navItems = [
    { id: 'home', label: 'Início & Catálogo', icon: Layout, desc: 'Aulas, ementas e trilhas' },
    { id: 'ranking', label: 'Estatísticas & Ranking', icon: Trophy, desc: 'Quadro de líderes de XP' },
    { id: 'live', label: 'Webinars Ao Vivo', icon: Compass, desc: 'Mentorias e lives ativas' },
    { id: 'plans', label: 'Upgrade de Planos', icon: CreditCard, desc: 'Certificações premium' },
  ];

  const unlockedBadges = badges.filter(b => b.unlockedAt).length;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#090d16] border-r border-[#1a2333]/60 h-screen sticky top-0 shrink-0 text-white select-none z-40 transition-all duration-300">
        <div className="flex flex-col h-full justify-between p-5 space-y-6">
          
          {/* Top Branding Section */}
          <div className="space-y-6">
            <div 
              onClick={() => navigateTo('home')} 
              className="flex items-center gap-3 cursor-pointer group px-2 pt-2"
              id="sidebar-logo"
            >
              <BrandLogo />
            </div>

            {/* Quick Micro Profile Progress details */}
            <div 
              onClick={() => navigateTo('profile')}
              className="bg-[#0e1626] border border-[#1b263b] rounded-2xl p-4 hover:border-indigo-550 hover:bg-[#121c32] hover:border-indigo-500/40 transition-all cursor-pointer group relative overflow-hidden shadow-md"
            >
              <div className="flex items-center gap-3">
                <img 
                  referrerPolicy="no-referrer"
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-xl object-cover border border-[#1e2a42] group-hover:scale-102 transition"
                />
                <div className="text-left">
                  <h4 className="font-bold text-xs text-gray-200 line-clamp-1 group-hover:text-white transition">
                    {currentUser.name}
                  </h4>
                  <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-450 text-indigo-400 font-extrabold px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider block w-fit mt-1">
                    Plano {currentUser.membershipPlan === 'Nenhum' ? 'Standard' : currentUser.membershipPlan}
                  </span>
                </div>
              </div>

              {/* Progress dynamic indicators */}
              <div className="mt-3.5 space-y-1">
                <div className="flex justify-between items-center text-[9px] text-gray-400">
                  <span className="font-bold flex items-center gap-0.5 text-amber-500">
                    <Flame className="w-3" />
                    {currentUser.points} XP
                  </span>
                  <span>Meta: 2.000 XP</span>
                </div>
                <div className="w-full bg-[#162136] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="theme-gradient h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((currentUser.points / 2000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links vertical list */}
          <nav className="flex-1 space-y-1.5 pt-2">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest px-3 font-semibold block mb-2 font-mono">
              Navegação Principal
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id as any)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-300 group relative cursor-pointer ${
                    isActive 
                    ? 'text-white bg-indigo-500/10 border-l-4 border-indigo-500 font-bold' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 transition-colors group-hover:scale-105 duration-200 shrink-0 ${isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-gray-200'}`} />
                  <div className="text-xs">
                    <p className="font-bold leading-tight">{item.label}</p>
                    <span className={`text-[9px] block font-normal mt-0.5 ${isActive ? 'text-indigo-300/80' : 'text-gray-500'}`}>{item.desc}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-indigo-400 shrink-0" />}
                </button>
              );
            })}

            {/* Special Section conditional: Admin screen role based */}
            {currentUser.role === UserRole.ADMIN && (
              <div className="pt-4 border-t border-[#1a2333]/50 mt-3">
                <button
                  onClick={() => navigateTo('admin')}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-300 group relative cursor-pointer ${
                    activeScreen === 'admin'
                    ? 'text-purple-300 bg-purple-500/10 border-l-4 border-purple-500 font-bold'
                    : 'text-purple-400/80 hover:text-purple-300 hover:bg-purple-950/10'
                  }`}
                >
                  <ShieldAlert className="w-4.5 h-4.5 text-purple-500 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold leading-tight">Painel Admin</p>
                    <span className="text-[9px] text-gray-500 block font-normal mt-0.5 font-mono">Controle de aulas</span>
                  </div>
                </button>
              </div>
            )}
          </nav>

          {/* Bottom stats block */}
          <div className="bg-[#0e1424] border border-[#1b253b] rounded-2xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between text-xs text-gray-450 text-gray-300 border-b border-[#1b253b] pb-2">
              <span className="font-bold text-[10px] tracking-wider uppercase font-mono text-gray-450 text-gray-400">Progresso Geral</span>
              <Award className="w-4 h-4 text-indigo-400" />
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-[#12192c] p-2 rounded-xl border border-[#1b253b]/40">
                <p className="text-xs font-mono font-black text-indigo-400">{certificates.length}</p>
                <p className="text-[8px] text-gray-500 uppercase tracking-wider mt-0.5 font-mono">Diplomas</p>
              </div>
              <div className="bg-[#12192c] p-2 rounded-xl border border-[#1b253b]/40">
                <p className="text-xs font-mono font-black text-purple-400">{unlockedBadges}</p>
                <p className="text-[8px] text-gray-500 uppercase tracking-wider mt-0.5 font-mono">Medalhas</p>
              </div>
            </div>

            <button 
              onClick={() => navigateTo('profile')}
              className="w-full text-center flex items-center justify-center gap-1.5 py-2 bg-[#12192c] hover:bg-indigo-600/15 rounded-xl text-[9px] uppercase font-bold tracking-widest text-indigo-300 hover:text-white border border-[#1a253d] hover:border-indigo-500/50 transition cursor-pointer"
            >
              <User className="w-3 h-3" />
              Editar Perfil
            </button>
          </div>

        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden transition-opacity"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="w-80 max-w-[85vw] bg-[#090d16] border-r border-[#1b253b] h-full flex flex-col justify-between p-5 space-y-6 text-white absolute left-0 top-0 bottom-0 animate-slideRight"
          >
            <div className="flex items-center justify-between">
              <BrandLogo compact showSubtitle={false} />
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile summary */}
            <div 
              onClick={() => {
                onClose();
                navigateTo('profile');
              }}
              className="bg-[#0e1626] border border-[#1b253b] rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
            >
              <img 
                referrerPolicy="no-referrer"
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-xl object-cover border border-gray-800"
              />
              <div className="text-left flex-1 min-w-0">
                <h4 className="font-bold text-xs text-gray-200 truncate">{currentUser.name}</h4>
                <p className="text-[10px] text-[#818cf8] font-extrabold mt-0.5">Plano {currentUser.membershipPlan}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-grow space-y-1 overflow-y-auto">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold block mb-2 px-1">
                Ementa Geral
              </span>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onClose();
                      navigateTo(item.id as any);
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all relative cursor-pointer ${
                      isActive 
                      ? 'text-white bg-indigo-500/10 border-l-4 border-indigo-500 font-bold' 
                      : 'text-gray-400 hover:text-white hover:bg-[#121623]/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-gray-400'}`} />
                    <div className="text-xs">
                      <p className="font-bold">{item.label}</p>
                      <span className="text-[9px] text-gray-500 font-normal leading-relaxed">{item.desc}</span>
                    </div>
                  </button>
                );
              })}

              {/* Admin section */}
              {currentUser.role === UserRole.ADMIN && (
                <div className="pt-3 border-t border-[#1a2333]/50 mt-2">
                  <button
                    onClick={() => {
                      onClose();
                      navigateTo('admin');
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-purple-300 bg-purple-950/20 rounded-xl text-xs font-bold border-l-4 border-purple-500"
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-500 shrink-0" />
                    <div>
                      <p>Painel Admin</p>
                      <span className="text-[9.5px] text-purple-400 font-normal">Estudos e turmas</span>
                    </div>
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile Stats */}
            <div className="grid grid-cols-2 gap-2 bg-[#0e1424] border border-[#1b253b] p-3 rounded-2xl text-center">
              <div>
                <p className="text-xs font-bold text-indigo-400 font-mono">{currentUser.points} XP</p>
                <p className="text-[8px] text-gray-500 uppercase tracking-wider mt-0.5">Pontos</p>
              </div>
              <div>
                <p className="text-xs font-bold text-purple-400 font-mono">{certificates.length}</p>
                <p className="text-[8px] text-gray-500 uppercase tracking-wider mt-0.5 font-mono">Diplomas</p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/15 bg-red-500/5 px-4 py-2.5 text-xs font-bold text-red-300 transition hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Sair da plataforma
            </button>

          </div>
        </div>
      )}
    </>
  );
};
