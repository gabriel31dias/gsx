import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BrandLogoProps {
  compact?: boolean;
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  compact = false,
  showSubtitle = true,
  className = '',
}) => {
  const { theme } = useAuth();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [theme.logoUrl]);

  if (theme.logoUrl && !imageFailed) {
    return (
      <img
        src={theme.logoUrl}
        alt="Logo da plataforma"
        className={`${compact ? 'h-8 max-w-36' : 'h-10 max-w-44'} w-auto object-contain object-left ${className}`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`theme-gradient rounded-xl shadow-lg ${compact ? 'p-2' : 'p-2.5'}`}>
        <Sparkles className={compact ? 'h-4 w-4 text-white' : 'h-5 w-5 text-white'} />
      </div>
      <div className="flex flex-col">
        <span className={`${compact ? 'text-sm' : 'text-sm'} font-extrabold tracking-tight text-white leading-none`}>
          ALURA<span className="theme-primary-text ml-0.5">DEV</span>
        </span>
        {showSubtitle && (
          <span className="mt-1 font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-gray-500">
            Hub de carreira
          </span>
        )}
      </div>
    </div>
  );
};
