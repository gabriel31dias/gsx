import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DEFAULT_LOGO_URL = '/logo-bluevision.png';

interface BrandLogoProps {
  compact?: boolean;
  showSubtitle?: boolean;
  iconOnly?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  compact = false,
  showSubtitle = true,
  iconOnly = false,
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
        className={`${iconOnly ? 'h-8 w-8 rounded-lg object-contain' : compact ? 'h-8 max-w-36' : 'h-10 max-w-44'} object-left ${className}`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  if (iconOnly) {
    return (
      <img
        src={DEFAULT_LOGO_URL}
        alt="Logo padrão da plataforma"
        className={`h-8 w-8 rounded-lg object-contain brightness-0 invert ${className}`}
      />
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={DEFAULT_LOGO_URL}
        alt="Logo padrão da plataforma"
        className={`${compact ? 'h-8 max-w-36' : 'h-10 max-w-44'} w-auto object-contain object-left brightness-0 invert`}
      />
      {showSubtitle && (
        <div className="flex flex-col">
          <span className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-gray-500">
            Hub de carreira
          </span>
        </div>
      )}
    </div>
  );
};
