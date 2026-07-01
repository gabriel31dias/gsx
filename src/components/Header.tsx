import React, { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { 
  GraduationCap, 
  User, 
  ShieldAlert, 
  Compass, 
  Trophy, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentUser, activeScreen, navigateTo } = usePlatform();
  const { logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Nova aula liberada!', text: 'Confira "Configurando TypeScript" na ementa avançada.', time: 'há 5 min' },
    { id: 2, title: 'Parabéns!', text: 'Você avançou para o Rank superior de estudos semanais!', time: 'há 2 horas' },
    { id: 3, title: 'Nova Medalha Conquistada', text: 'Você desbloqueou a medalha de especialista.', time: 'ontem' }
  ];

  const getScreenName = () => {
    switch (activeScreen) {
      case 'home':
        return { main: 'Painel Central', sub: 'Trilhas de Estudo de Alta Rotação' };
      case 'learning':
        return { main: 'Espaço de Aprendizado', sub: 'Sessão Prática Avançada' };
      case 'profile':
        return { main: 'Meu Portfólio de Carreira', sub: 'Certificações e Estatísticas Gerais' };
      case 'ranking':
        return { main: 'Dashboard de Medalhas', sub: 'Liga de Capacitação Ativa' };
      case 'live':
        return { main: 'Transmissão Prática', sub: 'Encontro Síncrono e Webinars' };
      case 'plans':
        return { main: 'Upgrades de Matrícula', sub: 'Acesso VIP Ilimitado com Selos Verificados' };
      case 'admin':
        return { main: 'Painel Admin', sub: 'Governança das Trilhas de Desenvolvimento' };
      default:
        return { main: 'Plataforma', sub: 'AluraDev' };
    }
  };

  const screenName = getScreenName();

  return (
    <header className="sticky top-0 z-30 bg-[#090d16]/80 backdrop-blur-md border-b border-[#1b253b]/50 px-4 lg:px-8 py-3.5 text-white">
      <div className="flex items-center justify-between">
        
        {/* Left Section: Breadcrumbs style */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-[#0f1626] border border-[#1b253b] text-gray-300 hover:text-white hover:bg-indigo-600/10 hover:border-indigo-500/30 transition-all md:hidden cursor-pointer"
            id="mobile-drawer-trigger"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Elegant Breadcrumbs layout */}
          <div className="hidden md:flex items-center gap-2 text-xs font-medium">
            <button
              type="button"
              className="text-gray-400 hover:text-indigo-400 font-bold transition cursor-pointer flex items-center gap-1.5" 
              onClick={() => navigateTo('home')}
            >
              <BrandLogo compact showSubtitle={false} />
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#1e2a42]" />
            <span className="text-white font-extrabold">{screenName.main}</span>
            <span className="text-[#1a2333]/70 font-normal">|</span>
            <span className="text-gray-400 font-mono text-[10px] uppercase tracking-wider">{screenName.sub}</span>
          </div>

          <div className="md:hidden flex items-center gap-1.5 cursor-pointer" onClick={() => navigateTo('home')}>
            <BrandLogo compact showSubtitle={false} />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          
          {/* Notification bell dropdown list */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 border border-transparent hover:border-indigo-500/20 hover:bg-[#12192d] rounded-full relative transition-all cursor-pointer"
            >
              <Bell className="w-4.5 h-4.5 text-gray-300 hover:text-indigo-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-505 bg-[#818cf8] rounded-full animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3.5 w-[calc(100vw-32px)] sm:w-80 bg-[#0e1424] border border-[#1b253b] rounded-2xl shadow-2xl p-4 overflow-hidden z-50 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#1b253b] pb-2 mb-2">
                  <h4 className="font-extrabold text-xs text-gray-100">Notificações Acadêmicas</h4>
                  <span onClick={() => setShowNotifications(false)} className="text-[10px] text-indigo-400 cursor-pointer hover:underline">Marcar como lidas</span>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2.5 hover:bg-[#12192d] rounded-xl transition-all text-xs border border-transparent hover:border-[#1b253b]/60">
                      <div className="flex justify-between items-start mb-1 text-gray-200 font-bold text-xs">
                        <span>{n.title}</span>
                        <span className="text-[9px] text-[#818cf8] font-mono font-normal">{n.time}</span>
                      </div>
                      <p className="text-gray-400 text-[10px] leading-relaxed">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile link block */}
          <div 
            onClick={() => navigateTo('profile')} 
            className={`flex items-center gap-2.5 cursor-pointer p-1 pr-2 rounded-xl transition-all border ${
              activeScreen === 'profile' 
              ? 'bg-indigo-500/10 border-indigo-500/25 text-white' 
              : 'border-transparent hover:bg-[#12192d] hover:border-[#1b253b]'
            }`}
          >
            <img 
              referrerPolicy="no-referrer" 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-7 h-7 rounded-lg object-cover border border-[#1e2a42] shadow-md"
            />
            <div className="hidden sm:block text-left text-[10px]">
              <p className="font-bold text-gray-200 leading-tight truncate max-w-28">{currentUser.name.split(' ')[0]}</p>
              <span className="text-gray-500 font-semibold font-mono uppercase text-[8px] leading-none block mt-0.5">
                Ver Portfólio
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            aria-label="Sair da plataforma"
            title="Sair"
            className="hidden rounded-xl border border-transparent p-2 text-gray-500 transition hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300 sm:block"
          >
            <LogOut className="h-4 w-4" />
          </button>

        </div>
      </div>
    </header>
  );
};
