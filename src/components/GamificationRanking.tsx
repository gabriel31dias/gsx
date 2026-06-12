import React from 'react';
import { usePlatform } from '../context/PlatformContext';
import { Trophy, Star, Award, Zap, Shield, Sparkles } from 'lucide-react';

export const GamificationRanking: React.FC = () => {
  const { allUsers, currentUser, badges } = usePlatform();

  // Sort users by points ascending
  const sortedStudents = [...allUsers].sort((a, b) => b.points - a.points);
  
  // Find current active user ranking position
  const currentRankIndex = sortedStudents.findIndex(u => u.id === currentUser.id);

  return (
    <div className="bg-[#070a13] min-h-screen text-white max-w-7xl mx-auto px-4 lg:px-10 py-8 space-y-8 pb-20 animate-fadeIn">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1b253b]/50 pb-5">
        <div>
          <span className="text-[10px] bg-indigo-500/10 text-indigo-305 text-indigo-300 font-extrabold px-3 py-1 rounded-md border border-indigo-500/20 uppercase tracking-widest block w-fit mb-2 font-mono">
            Estatísticas & Reconhecimento
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-gray-100">Leaderboard de Estudos (XP)</h2>
        </div>

        <div className="bg-[#0e1424] border border-[#1b253b] px-4 py-2.5 rounded-2xl flex items-center gap-3">
          <Trophy className="w-5 h-5 text-amber-500 animate-pulse" />
          <div className="text-xs">
            <p className="text-gray-400 font-medium leading-none">Sua Posição Escolar</p>
            <p className="font-extrabold text-gray-200 mt-1">#{currentRankIndex + 1} de {sortedStudents.length} Desenvolvedores</p>
          </div>
        </div>
      </div>

      {/* Main grids split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEADERBOARD STUDENT TABLE */}
        <div className="lg:col-span-2 bg-[#0e1424] border border-[#1b253b]/80 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[#1b253b]/55 pb-3.5 mb-2">
            <h3 className="font-bold text-sm text-gray-200">Quadro de Líderes Semanal</h3>
            <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider">Pontos Consolidados</span>
          </div>

          <div className="space-y-3">
            {sortedStudents.map((student, idx) => {
              const isSelf = student.id === currentUser.id;
              
              // Decorative rank items
              let rankStyle = "bg-[#182136] text-gray-300";
              if (idx === 0) rankStyle = "bg-amber-500 text-black font-extrabold";
              else if (idx === 1) rankStyle = "bg-slate-300 text-black font-extrabold";
              else if (idx === 2) rankStyle = "bg-amber-700 text-white font-extrabold";

              return (
                <div 
                  key={student.id} 
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
                    isSelf 
                    ? 'bg-indigo-500/10 border-indigo-550 border-indigo-500/35 relative ring-1 ring-indigo-500/10 shadow-lg' 
                    : 'bg-[#090d16]/30 border-[#1b253b] hover:border-indigo-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Rank Badge Counter Circle */}
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold ${rankStyle}`}>
                      {idx + 1}
                    </div>

                    <img 
                      referrerPolicy="no-referrer"
                      src={student.avatar} 
                      alt={student.name} 
                      className="w-10 h-10 rounded-xl object-cover border border-[#1b253b]"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-xs text-gray-200">{student.name}</p>
                        {isSelf && (
                          <span className="bg-indigo-500/15 border border-indigo-500/20 text-[#818cf8] text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider font-mono">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 leading-none mt-1">Bootcamp Estudante • Plano {student.membershipPlan === 'Nenhum' ? 'Standard' : student.membershipPlan}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500/12 text-amber-500/80" />
                    <span className="font-mono font-extrabold text-xs text-amber-400">{student.points} XP</span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* SIDEWAYS COLUMN */}
        <div className="space-y-6">
          
          <div className="bg-[#0e1424] border border-[#1b253b]/80 p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-sm text-gray-200 border-b border-[#1b253b]/60 pb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
              Como acumular XP?
            </h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-300 border border-indigo-505/10 border-indigo-500/20 font-bold shrink-0 font-mono">
                  +50
                </div>
                <div>
                  <p className="font-bold text-gray-300">Assistir Aula Completa</p>
                  <p className="text-gray-500 text-[11px] leading-relaxed mt-0.5">Marque a aula como concluída no player dinâmico de vídeo.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-300 border border-indigo-505/10 border-indigo-500/20 font-bold shrink-0 font-mono">
                  +100
                </div>
                <div>
                  <p className="font-bold text-gray-300">Aprovação em Avaliação</p>
                  <p className="text-gray-500 text-[11px] leading-relaxed mt-0.5">Obtenha nota igual ou superior no quiz prático do curso.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-300 border border-indigo-505/10 border-indigo-500/20 font-bold shrink-0 font-mono">
                  +400
                </div>
                <div>
                  <p className="font-bold text-gray-300">Emissão de Diploma</p>
                  <p className="text-gray-500 text-[11px] leading-relaxed mt-0.5">Conclua 100% de qualquer trilha para publicar certificado verificado.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-300 border border-indigo-505/10 border-indigo-500/20 font-bold shrink-0 font-mono">
                  +10
                </div>
                <div>
                  <p className="font-bold text-gray-300">Interação em Live</p>
                  <p className="text-gray-500 text-[11px] leading-relaxed mt-0.5">Participe dos webinars enviando perguntas ou respondendo enquetes.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Micro Status tier progression card with purple glow */}
          <div className="p-6 bg-gradient-to-br from-indigo-950/20 via-indigo-950/5 to-transparent border border-indigo-500/25 rounded-3xl space-y-4 shadow-lg shadow-indigo-500/5">
            <h4 className="font-bold text-xs text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <Shield className="w-4 h-4 text-indigo-400" />
              LIGA ALURADEV PLATINUM
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Consiga atingir a meta superior de <strong>2.000 XP</strong> de estudos em andamento até o fim deste período letivo para obter acesso automático e integral a mentorias fechadas de engenharia de software com professores internacionais!
            </p>
            <div className="space-y-2">
              <div className="w-full bg-[#1b243b]/40 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min((currentUser.points / 2000) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 text-right">{currentUser.points} / 2.000 XP para Próximo Tier</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
