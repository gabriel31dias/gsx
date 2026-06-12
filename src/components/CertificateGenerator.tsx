import React, { useRef } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { X, Award, Shield, Printer, Check, Copy } from 'lucide-react';

interface CertificateGeneratorProps {
  courseId: string;
  onClose: () => void;
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({ courseId, onClose }) => {
  const { certificates, currentUser, courses } = usePlatform();
  const printRef = useRef<HTMLDivElement>(null);

  const course = courses.find(c => c.id === courseId);
  const cert = certificates.find(c => c.courseId === courseId);

  if (!course || !cert) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#0e1424] border border-[#1b253b] p-6 rounded-2xl max-w-sm text-center text-white space-y-4">
          <p className="text-indigo-400 font-bold font-mono">Certificado não localizado.</p>
          <p className="text-xs text-gray-400">Certifique-se de completar 100% das aulas deste módulo para emiti-lo.</p>
          <button onClick={onClose} className="bg-indigo-600 px-4 py-2 rounded-xl text-xs font-bold font-mono text-white cursor-pointer hover:bg-indigo-500">Fechar</button>
        </div>
      </div>
    );
  }

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    window.print();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(cert.verificationCode);
    alert(`Código de autenticação copiado para área de transferência: ${cert.verificationCode}`);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0e1424] border border-[#1b253b] rounded-3xl max-w-4xl w-full p-6 space-y-6 text-white shadow-2xl relative">
        
        {/* Modal Top header controls */}
        <div className="flex items-center justify-between border-b border-[#1b253b]/60 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400 animate-pulse" />
            <span className="font-bold text-xs text-gray-200">Emissor de Certificados AluraDev</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-[#090d16] hover:bg-[#12192c] transition text-xs font-bold px-3 py-1.5 rounded-xl border border-[#1b253b] cursor-pointer"
            >
              <Printer className="w-4 h-4 text-gray-400" />
              Imprimir / Salvar PDF
            </button>
            <button 
              onClick={onClose} 
              className="p-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINT TARGET CONTAINER FRAME */}
        <div 
          ref={printRef}
          className="bg-zinc-950 p-6 md:p-12 rounded-2xl border-4 border-indigo-500/30 relative overflow-hidden flex flex-col justify-between aspect-auto md:aspect-[1.414/1] max-w-full text-center shadow-inner gap-6 md:gap-0"
          style={{
            backgroundImage: 'radial-gradient(ellipse at center, rgba(11, 16, 32, 1) 0%, rgba(5, 5, 8, 1) 100%)'
          }}
          id={`printable-certificate-${courseId}`}
        >
          {/* Decorative Classic Watermark Corners */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-indigo-500/20" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-indigo-500/20" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-indigo-500/20" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-indigo-500/20" />

          {/* Golden Seal Backdrop Graphic element */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/5 rounded-full filter blur-xl" />

          {/* Certificate header */}
          <div className="space-y-2 mt-4 text-center">
            <div className="inline-flex items-center justify-center gap-1 bg-indigo-505/10 bg-indigo-500/10 border border-indigo-500/25 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-indigo-400">
              <Award className="w-3.5 h-3.5" />
              <span>CERTIFICADO DE CAPACITAÇÃO EM ENGENHARIA</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-sans mt-3">
              ALURA<span className="text-indigo-405 text-indigo-400">DEV</span> MEMBER
            </h1>
            <p className="text-[10px] text-gray-500 tracking-wider uppercase font-mono mt-1">EMISSÃO DIGITAL DE MÉRITO CORPORATIVO</p>
          </div>

          {/* Central statement text */}
          <div className="my-8 md:my-10 space-y-4">
            <p className="text-xs md:text-xs text-gray-450 text-gray-400 italic">Concedemos o presente diploma de especialização técnica ao aluno(a)</p>
            <h2 className="text-xl md:text-3xl font-bold text-indigo-300 underline decoration-indigo-500/30 decoration-wavy underline-offset-8 drop-shadow-md">
              {cert.studentName}
            </h2>
            <p className="text-xs md:text-xs text-gray-300 max-w-xl mx-auto leading-relaxed mt-2">
              por haver assistido integralmente e aprovado nos questionários analíticos de proficiência técnica referente ao bootcamp de especialização profissional:
            </p>
            <h3 className="text-sm md:text-sm font-bold text-white px-4 py-1.5 bg-white/5 rounded-xl border border-[#1b253b] w-fit mx-auto mt-2 shadow-sm">
              {cert.courseName}
            </h3>
          </div>

          {/* Certificate metadata footer with sign and QR code */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-[#1b253b]/60 mt-2">
            
            {/* Hour details & signatures */}
            <div className="text-left space-y-3.5">
              <div className="space-y-0.5 text-xs text-gray-400">
                <p>Carga Horária: <strong className="text-white">{cert.hours}</strong></p>
                <p>Data de Conclusão: <strong className="text-white">{cert.date}</strong></p>
              </div>

              <div className="border-t border-[#1b253b] w-36 pt-1">
                <p className="text-[10px] text-gray-400 font-bold">Diretoria Acadêmica</p>
                <p className="text-[9px] text-gray-550 text-gray-500 font-mono">AluraDev Brasil Inc.</p>
              </div>
            </div>

            {/* Central Seal badge stamp */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-10 h-10 rounded-full border border-indigo-500/30 bg-zinc-950 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/5">
                <Shield className="w-5 h-5 fill-indigo-500/10" />
              </div>
              <span className="text-[9px] text-gray-500 font-mono">AUTENTICADO</span>
            </div>

            {/* QR block with validation link */}
            <div className="flex items-center gap-3 bg-black/40 border border-[#1b253b] px-3 py-2 rounded-xl text-left scale-90 sm:scale-100">
              {/* Custom SVG QR Code Simulator */}
              <div className="w-12 h-12 bg-white p-1 rounded-lg shrink-0 flex flex-wrap gap-0.5">
                <div className="grid grid-cols-6 gap-0.5 w-full h-full">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`rounded-[1px] ${
                        (i % 5 === 0 || i < 6 || i % 6 === 0 || (i > 30 && i % 3 === 0)) 
                        ? 'bg-black' 
                        : 'bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="text-[10px] space-y-1">
                <p className="font-bold text-gray-300">Autenticação Digital</p>
                <p className="font-mono text-gray-500 uppercase tracking-tighter text-[9px]">{cert.verificationCode}</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleCopyCode(); }}
                  className="text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
                >
                  <Copy className="w-3 h-3" />
                  Copiar Código
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Secondary Validation instructions for recruiters */}
        <div className="bg-[#090d16] border border-[#1b253b]/80 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-between text-xs text-gray-400 text-left">
          <p className="leading-snug max-w-lg mb-2 sm:mb-0 text-xs">
            A autenticação do certificado eletrônico da rede <strong>AluraDev</strong> pode ser embutida diretamente em currículos no LinkedIn ou portfólios no GitHub para legitimar suas competências de engenharia de software para recrutadores de todo o mundo.
          </p>
          <div className="flex items-center gap-1.5 shrink-0 font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <Check className="w-4 h-4" />
            Emissão Verificada
          </div>
        </div>

      </div>
    </div>
  );
};
