import React, { useState } from 'react';
import { Search, Sparkles, BookOpen, ShieldCheck, BarChart3 } from 'lucide-react';

interface HeroBannerProps {
  onSearchChange: (query: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSearchChange }) => {
  const [searchVal, setSearchVal] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    onSearchChange(e.target.value);
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#0e1628] via-[#090d16] to-[#09090b] border-b border-[#1b253b]/65 text-white">
      {/* Background Cover Overlay Decorative Vector Mesh */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute -bottom-40 -right-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-12 md:py-20 relative z-10">
        <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-12 lg:items-center">
          <div className="space-y-6 text-left lg:col-span-7">
            
            {/* Spotlight Label Badge */}
            <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/35 px-3 py-1 rounded-full text-xs font-bold text-indigo-300 backdrop-blur-md shadow-md w-fit">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>CATÁLOGO OFICIAL ALURADEV</span>
            </div>

            {/* Title display */}
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight max-w-2xl leading-[1.125] text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 drop-shadow">
              Aprenda no seu ritmo. Evolua com prática.
            </h1>

            <p className="text-sm md:text-base text-gray-400 max-w-xl leading-relaxed">
              Consulte abaixo somente os cursos disponíveis para sua conta, carregados diretamente da plataforma.
            </p>

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

          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative mx-auto max-w-sm">
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <div className="relative space-y-3 rounded-[24px] border border-[#1a2333] bg-[#0b101e] p-5 shadow-2xl">
                {[
                  { icon: BookOpen, title: 'Catálogo sincronizado', text: 'Cursos retornados pela API da sua conta.' },
                  { icon: BarChart3, title: 'Progresso real', text: 'Percentuais e acessos vindos do backend.' },
                  { icon: ShieldCheck, title: 'Acesso autenticado', text: 'Dados protegidos pelo seu token de sessão.' },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex items-center gap-4 rounded-2xl border border-[#1b253b] bg-[#0e1424] p-4">
                    <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-gray-200">{title}</p>
                      <p className="mt-1 text-[10px] leading-4 text-gray-500">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
