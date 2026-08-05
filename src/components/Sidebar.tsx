import React, { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { 
  Compass, 
  Trophy, 
  Tv, 
  CreditCard, 
  ShieldAlert, 
  X, 
  Flame, 
  User, 
  ChevronLeft,
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
  const { currentUser, activeScreen, navigateTo, certificates, xpProgress } = usePlatform();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const navItems = [
    { id: 'home', label: 'Início & Catálogo', icon: Layout, desc: 'Aulas, ementas e trilhas' },
    // ponytail: ocultos por enquanto — reativar quando as páginas estiverem prontas
    // { id: 'ranking', label: 'Estatísticas & Ranking', icon: Trophy, desc: 'Quadro de líderes de XP' },
    // { id: 'live', label: 'Webinars Ao Vivo', icon: Compass, desc: 'Mentorias e lives ativas' },
    { id: 'plans', label: 'Upgrade de Planos', icon: CreditCard, desc: 'Certificações premium' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-[#090d16] border-r border-[#1a2333]/60 h-screen sticky top-0 shrink-0 text-white select-none z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64 lg:w-72'}`}>
        <div className={`flex flex-col h-full justify-between space-y-6 ${isCollapsed ? 'p-3' : 'p-5'}`}>
          
          {/* Top Branding Section */}
          <div className="space-y-6">
            <div className={`flex items-center gap-2 pt-2 ${isCollapsed ? 'justify-center' : 'justify-between px-2'}`}>
              {!isCollapsed && (
                <div
                  onClick={() => navigateTo('home')}
                  className="flex min-w-0 cursor-pointer"
                  id="sidebar-logo"
                >
                  <BrandLogo showSubtitle={false} />
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsCollapsed((current) => !current)}
                aria-label={isCollapsed ? 'Expandir menu' : 'Minimizar menu'}
                title={isCollapsed ? 'Expandir menu' : 'Minimizar menu'}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#1b253b] bg-[#0e1626] text-gray-400 transition hover:border-indigo-500/40 hover:bg-indigo-600/10 hover:text-white"
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>

            {/* Quick Micro Profile Progress details */}
            <div 
              onClick={() => navigateTo('profile')}
              className={`bg-[#0e1626] border border-[#1b263b] rounded-2xl hover:border-indigo-550 hover:bg-[#121c32] hover:border-indigo-500/40 transition-all cursor-pointer group relative shadow-md ${isCollapsed ? 'flex justify-center overflow-visible p-2' : 'overflow-hidden p-4'}`}
              title={isCollapsed ? `${currentUser.name} - Editar perfil` : undefined}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                <img 
                  referrerPolicy="no-referrer"
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-xl object-cover border border-[#1e2a42] group-hover:scale-102 transition"
                />
                {!isCollapsed && <div className="text-left">
                  <h4 className="font-bold text-xs text-gray-200 line-clamp-1 group-hover:text-white transition">
                    {currentUser.name}
                  </h4>
                  <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-450 text-indigo-400 font-extrabold px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider block w-fit mt-1">
                    Plano {currentUser.membershipPlan === 'Nenhum' ? 'Standard' : currentUser.membershipPlan}
                  </span>
                </div>}
              </div>

              {/* Progress dynamic indicators (XP/nível reais) */}
              {!isCollapsed && <div className="mt-3.5 space-y-1">
                <div className="flex justify-between items-center text-[9px] text-gray-400">
                  <span className="font-bold flex items-center gap-0.5 text-amber-500">
                    <Flame className="w-3" />
                    {xpProgress?.points ?? currentUser.points} XP
                  </span>
                  <span>Nível {xpProgress?.level ?? 1}</span>
                </div>
                <div className="w-full bg-[#162136] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="theme-gradient h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(xpProgress?.percent ?? 0, 100)}%` }}
                  />
                </div>
                {xpProgress && (
                  <p className="text-[8px] text-gray-500 font-mono pt-0.5">
                    {xpProgress.xp_into_level}/{xpProgress.xp_for_next_level} XP p/ nível {xpProgress.level + 1}
                  </p>
                )}
              </div>}
            </div>
          </div>

          {/* Navigation Links vertical list */}
          <nav className="flex-1 space-y-1.5 pt-2">
            {!isCollapsed && <span className="text-[9px] text-gray-500 uppercase tracking-widest px-3 font-semibold block mb-2 font-mono">
              Navegação Principal
            </span>}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id as any)}
                  aria-label={item.label}
                  className={`flex items-center text-left transition-all duration-200 group relative cursor-pointer ${
                    isCollapsed
                      ? 'z-10 h-11 w-14 overflow-hidden rounded-2xl border border-transparent hover:z-50 hover:w-[14.5rem] hover:border-indigo-400/25 hover:bg-[#111827] hover:shadow-[0_16px_34px_rgba(0,0,0,0.38)] focus-visible:z-50 focus-visible:w-[14.5rem] focus-visible:border-indigo-400/25 focus-visible:bg-[#111827] focus-visible:shadow-[0_16px_34px_rgba(0,0,0,0.38)]'
                      : 'w-full gap-3 rounded-xl px-3 py-2.5'
                  } ${
                    isActive
                    ? isCollapsed
                      ? 'bg-indigo-500/15 text-white ring-1 ring-indigo-500/25'
                      : 'text-white bg-indigo-500/10 border-l-4 border-indigo-500 font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={isCollapsed ? `flex h-11 w-14 shrink-0 items-center justify-center transition-colors duration-200 ${isActive ? 'text-indigo-300' : ''}` : 'contents'}>
                    <Icon className={`w-4.5 h-4.5 transition-colors group-hover:scale-105 duration-200 shrink-0 ${isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-gray-200'}`} />
                  </span>
                  {isCollapsed && (
                    <span className="pr-4 text-xs font-bold tracking-normal text-gray-100 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                  {!isCollapsed && <div className="text-xs">
                    <p className="font-bold leading-tight">{item.label}</p>
                    <span className={`text-[9px] block font-normal mt-0.5 ${isActive ? 'text-indigo-300/80' : 'text-gray-500'}`}>{item.desc}</span>
                  </div>}
                  {isActive && !isCollapsed && <ChevronRight className="w-4 h-4 ml-auto text-indigo-400 shrink-0" />}
                </button>
              );
            })}

            {/* Special Section conditional: Admin screen role based */}
            {currentUser.role === UserRole.ADMIN && (
              <div className="pt-4 border-t border-[#1a2333]/50 mt-3">
                <button
                  onClick={() => navigateTo('admin')}
                  aria-label="Painel Admin"
                  className={`flex items-center text-left transition-all duration-200 group relative cursor-pointer ${
                    isCollapsed
                      ? 'z-10 h-11 w-14 overflow-hidden rounded-2xl border border-transparent hover:z-50 hover:w-[12.5rem] hover:border-purple-400/25 hover:bg-[#181326] hover:shadow-[0_16px_34px_rgba(0,0,0,0.38)] focus-visible:z-50 focus-visible:w-[12.5rem] focus-visible:border-purple-400/25 focus-visible:bg-[#181326] focus-visible:shadow-[0_16px_34px_rgba(0,0,0,0.38)]'
                      : 'w-full gap-3 rounded-xl px-3 py-2.5'
                  } ${
                    activeScreen === 'admin'
                    ? isCollapsed
                      ? 'bg-purple-500/15 text-purple-200 ring-1 ring-purple-500/25'
                      : 'text-purple-300 bg-purple-500/10 border-l-4 border-purple-500 font-bold'
                    : 'text-purple-400/80 hover:text-purple-300 hover:bg-purple-950/10'
                  }`}
                >
                  <span className={isCollapsed ? 'flex h-11 w-14 shrink-0 items-center justify-center transition-colors duration-200' : 'contents'}>
                    <ShieldAlert className="w-4.5 h-4.5 text-purple-500 shrink-0" />
                  </span>
                  {isCollapsed && (
                    <span className="pr-4 text-xs font-bold tracking-normal text-purple-100 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 whitespace-nowrap">
                      Painel Admin
                    </span>
                  )}
                  {!isCollapsed && <div className="text-xs">
                    <p className="font-bold leading-tight">Painel Admin</p>
                    <span className="text-[9px] text-gray-500 block font-normal mt-0.5 font-mono">Controle de aulas</span>
                  </div>}
                </button>
              </div>
            )}
          </nav>

          <button 
            onClick={() => navigateTo('profile')}
            aria-label="Editar Perfil"
            className={`group relative text-center flex items-center bg-[#12192c] text-[9px] uppercase font-bold tracking-widest text-indigo-300 border border-[#1a253d] transition-all duration-200 hover:bg-indigo-600/15 hover:text-white hover:border-indigo-500/50 cursor-pointer ${
              isCollapsed
                ? 'z-10 h-11 w-14 overflow-hidden justify-start rounded-2xl hover:z-50 hover:w-44 hover:bg-[#111827] hover:shadow-[0_16px_34px_rgba(0,0,0,0.38)] focus-visible:z-50 focus-visible:w-44 focus-visible:bg-[#111827] focus-visible:shadow-[0_16px_34px_rgba(0,0,0,0.38)]'
                : 'w-full justify-center gap-1.5 rounded-xl py-2.5'
            }`}
          >
            <span className={isCollapsed ? 'flex h-11 w-14 shrink-0 items-center justify-center' : 'contents'}>
              <User className="w-3 h-3" />
            </span>
            {isCollapsed && (
              <span className="pr-4 tracking-normal opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 whitespace-nowrap">
                Editar Perfil
              </span>
            )}
            {!isCollapsed && 'Editar Perfil'}
          </button>

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
