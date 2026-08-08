import React from 'react';
import { usePlatform } from '../context/PlatformContext';
import { Award, RefreshCw } from 'lucide-react';

const formatDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(parsed);
};

export const AchievementsArea: React.FC = () => {
  const { badges, achievementsLoading, achievementsError, refreshAchievements } = usePlatform();

  const unlockedCount = badges.filter((b) => b.unlockedAt).length;

  return (
    <div className="w-full px-4 py-8 lg:px-10 space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1b253b]/50 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Minhas Conquistas</h1>
          <p className="text-sm text-gray-400">
            {unlockedCount} de {badges.length} medalhas desbloqueadas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refreshAchievements()}
          disabled={achievementsLoading}
          className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono transition hover:text-indigo-400 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${achievementsLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {achievementsError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
          {achievementsError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {achievementsLoading && badges.length === 0 ? (
          [0, 1, 2, 3].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl border border-[#1b253b]/40 bg-[#090d16]/30" />
          ))
        ) : badges.map((b) => {
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
                {b.icon ? (
                  <span className="block text-xl leading-none" aria-hidden="true">{b.icon}</span>
                ) : (
                  <Award className="w-5 h-5 shrink-0" />
                )}
              </div>
              <div className="text-left">
                <div className="flex gap-2 items-center">
                  <p className="font-bold text-xs text-gray-200 leading-none">{b.title}</p>
                  {isUnlocked && (
                    <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] font-bold px-1 rounded uppercase tracking-wider font-mono">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">{b.description}</p>
                {isUnlocked && (
                  <p className="text-[9px] text-gray-500 mt-1 font-mono">
                    Conquistado em {formatDate(b.unlockedAt!)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
