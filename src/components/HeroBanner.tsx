import React, { useState } from 'react';
import { Course } from '../types';
import { Play, Info, Search, Sparkles, Star, BookOpen, Clock, Code, Award } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

interface HeroBannerProps {
  onSearchChange: (query: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSearchChange }) => {
  const { courses, navigateTo } = usePlatform();
  const [searchVal, setSearchVal] = useState('');

  // Find a trending course for the spotlight banner
  const featured: Course = courses.find(c => c.isTrending) || courses[0];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    onSearchChange(e.target.value);
  };

  const handlePlayClicked = () => {
    if (featured) {
      const firstMod = featured.modules[0];
      const firstLes = firstMod?.lessons[0];
      navigateTo('learning', featured.id, firstLes?.id || null);
    }
  };

  if (!featured) return null;

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#0e1628] via-[#090d16] to-[#09090b] border-b border-[#1b253b]/65 text-white">
      {/* Background Cover Overlay Decorative Vector Mesh */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute -bottom-40 -right-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-12 md:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
          
          {/* Main Content Area Left: text elements */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Spotlight Label Badge */}
            <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/35 px-3 py-1 rounded-full text-xs font-bold text-indigo-300 backdrop-blur-md shadow-md w-fit">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>SPOTLIGHT DO MÊS DE ENGENHARIA</span>
            </div>

            {/* Title display */}
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight max-w-2xl leading-[1.125] text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 drop-shadow">
              {featured.title}
            </h1>

            {/* Multi Info Pill Row */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 font-medium pt-1">
              <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg text-amber-400 font-bold border border-amber-500/15">
                <Star className="w-3.5 h-3.5 fill-amber-400/20 text-amber-400" />
                <span>{featured.rating} Estrelas</span>
              </div>
              <span className="text-gray-700">•</span>
              <span className="bg-indigo-505 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-lg font-bold">
                {featured.category}
              </span>
              <span className="text-gray-700">•</span>
              <span className="text-gray-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                {featured.duration} de prática
              </span>
            </div>

            {/* Course Summary Statement */}
            <p className="text-sm md:text-base text-gray-400 max-w-xl leading-relaxed">
              {featured.description}
            </p>

            {/* Hero Interactive CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={handlePlayClicked}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-550 from-indigo-500 to-indigo-650 hover:to-indigo-500 text-white transition-all duration-300 px-6 py-3 rounded-xl font-bold text-sm cursor-pointer shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5"
              >
                <Play className="w-4.5 h-4.5 fill-current" />
                Começar Aula Grátis
              </button>
              
              <button 
                onClick={() => navigateTo('plans')}
                className="flex items-center justify-center gap-2 bg-[#0e1424] hover:bg-[#121a30] text-gray-200 border border-[#1b253b] px-6 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
              >
                <Award className="w-4.5 h-4.5 text-indigo-400" />
                Assinar Plano Premium
              </button>
            </div>

            {/* Smart Search Bar integrated perfectly */}
            <div className="w-full max-w-lg pt-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4.5 h-4.5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchVal}
                onChange={handleSearch}
                placeholder="Busque aulas, tecnologias ou instrutores... (Ex: React, Go, SQL)"
                className="w-full bg-[#0e1424]/60 backdrop-blur-md text-white border border-[#1b253b] rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-gray-500 shadow-xl"
              />
            </div>

          </div>

          {/* Right Area Column: Beautiful cover placeholder glass box structure */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative group mx-auto max-w-sm">
              {/* Outer decorative halo blur glowing effect */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              
              {/* Real Box Frame Container */}
              <div className="relative bg-[#0b101e] border border-[#1a2333] p-3 rounded-[24px] shadow-2xl">
                <div className="relative aspect-[16/10] rounded-[18px] overflow-hidden bg-slate-900 border border-[#1a2333]/40">
                  <img 
                    referrerPolicy="no-referrer"
                    src={featured.coverImage} 
                    alt={featured.title} 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-4">
                    <span className="text-[9px] bg-indigo-500/20 text-indigo-300 py-0.5 px-2 font-mono uppercase font-bold tracking-wider rounded border border-indigo-500/10 block w-fit mb-1.5">
                      Próxima Turma Ativa
                    </span>
                    <p className="font-extrabold text-xs text-white line-clamp-1">{featured.instructor}</p>
                    <p className="text-[10px] text-gray-400">Arquiteto de Software Principal</p>
                  </div>
                </div>

                <div className="mt-4 p-2 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-350">
                      <Code className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold text-gray-300 text-xs">Aprenda na Prática</span>
                    </div>
                    <p className="text-[10pt] text-gray-400 line-clamp-1">Suporte VIP por profissionais de IA</p>
                  </div>
                  <button 
                    onClick={handlePlayClicked}
                    className="p-3 bg-[#12192c] hover:bg-indigo-600 hover:text-white text-indigo-400 rounded-xl transition border border-[#1b253b] cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
