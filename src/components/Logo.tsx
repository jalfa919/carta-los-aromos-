import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  variant?: 'emblem' | 'inline' | 'stacked';
  overrideLogoUrl?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  showSubtitle = true,
  variant = 'inline',
  overrideLogoUrl,
}) => {
  const store = useStore();
  const [imgError, setImgError] = useState(false);

  const logoSrc = overrideLogoUrl || store?.settings?.logoUrl;
  const storeName = store?.settings?.storeName || 'Kitchen Los Aromos';

  // Sizing definitions
  const dimensions = {
    xs: { img: 'w-7 h-7', title: 'text-xs', subtitle: 'text-[9px]', badge: 28 },
    sm: { img: 'w-9 h-9 sm:w-10 sm:h-10', title: 'text-sm sm:text-base', subtitle: 'text-[10px]', badge: 36 },
    md: { img: 'w-12 h-12 sm:w-14 sm:h-14', title: 'text-base sm:text-lg', subtitle: 'text-[11px]', badge: 52 },
    lg: { img: 'w-16 h-16 sm:w-20 sm:h-20', title: 'text-xl sm:text-2xl', subtitle: 'text-xs', badge: 72 },
    xl: { img: 'w-24 h-24 sm:w-32 sm:h-32', title: 'text-2xl sm:text-3xl', subtitle: 'text-sm', badge: 100 },
  }[size];

  // If we have an image logo and it hasn't errored
  const hasValidImage = Boolean(logoSrc && !imgError);

  if (variant === 'emblem') {
    return (
      <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
        {hasValidImage ? (
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-500/30 via-red-600/30 to-amber-400/20 blur-sm opacity-70 group-hover:opacity-100 transition-opacity" />
            <img
              src={logoSrc}
              alt={storeName}
              onError={() => setImgError(true)}
              className={`${dimensions.img} relative rounded-full object-cover ring-2 ring-amber-400/50 shadow-xl shadow-black/60`}
            />
          </div>
        ) : (
          <VectorEmblem sizeBadge={dimensions.badge} />
        )}
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {hasValidImage ? (
          <div className="relative mb-3 group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-500/40 via-red-600/30 to-amber-300/30 blur-md opacity-80 group-hover:opacity-100 transition-opacity" />
            <img
              src={logoSrc}
              alt={storeName}
              onError={() => setImgError(true)}
              className={`${dimensions.img} relative rounded-full object-cover ring-2 ring-amber-400/60 shadow-2xl shadow-black/80`}
            />
          </div>
        ) : (
          <div className="mb-2">
            <VectorEmblem sizeBadge={dimensions.badge} />
          </div>
        )}

        {showText && (
          <div>
            <h1 className={`font-bold font-display text-white tracking-wide uppercase leading-tight ${dimensions.title}`}>
              {storeName}
            </h1>
            {showSubtitle && (
              <span className={`block font-semibold text-red-400 uppercase tracking-widest mt-0.5 ${dimensions.subtitle}`}>
                Sushi & Fast Food
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default: 'inline' variant (ideal for Header and navbars)
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3.5 select-none ${className}`}>
      {/* Emblem / Badge */}
      {hasValidImage ? (
        <div className="relative shrink-0 group">
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-amber-500/30 via-red-600/30 to-amber-400/20 blur-[2px] opacity-75 group-hover:opacity-100 transition-opacity" />
          <img
            src={logoSrc}
            alt={storeName}
            onError={() => setImgError(true)}
            className={`${dimensions.img} relative rounded-full object-cover ring-1.5 ring-amber-400/50 shadow-md shadow-black/60`}
          />
        </div>
      ) : (
        <div className="shrink-0">
          <VectorEmblem sizeBadge={dimensions.badge} />
        </div>
      )}

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-black font-display text-white tracking-tight uppercase ${dimensions.title}`}>
              {storeName}
            </span>
          </div>
          {showSubtitle && (
            <span className={`font-semibold text-red-400 tracking-wider uppercase ${dimensions.subtitle}`}>
              Sushi &amp; Fast Food
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Fallback high-fidelity SVG badge if no image or image fails
const VectorEmblem: React.FC<{ sizeBadge: number }> = ({ sizeBadge }) => (
  <svg
    viewBox="0 0 100 100"
    width={sizeBadge}
    height={sizeBadge}
    className="w-auto h-full"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="50%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id="crimsonBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#991b1b" />
        <stop offset="100%" stopColor="#450a0a" />
      </linearGradient>
    </defs>

    {/* Outer Gold Ring */}
    <circle cx="50" cy="50" r="47" stroke="url(#goldRing)" strokeWidth="3" fill="#18181b" />
    <circle cx="50" cy="50" r="42" stroke="#dc2626" strokeWidth="1.5" fill="url(#crimsonBg)" />

    {/* Aroma Steam */}
    <path
      d="M 50 32 C 48 26, 54 22, 51 18 C 55 21, 56 26, 52 30 Z"
      fill="#fde047"
    />
    <path
      d="M 45 35 C 43 30, 48 27, 46 23 C 49 26, 50 30, 47 33 Z"
      fill="#fef08a"
    />

    {/* Sushi Roll Icon */}
    <rect x="35" y="36" width="30" height="24" rx="12" fill="#09090b" stroke="#f59e0b" strokeWidth="1.5" />
    <ellipse cx="50" cy="44" rx="11" ry="6" fill="#f87171" />
    <circle cx="50" cy="44" r="3" fill="#ffffff" />

    {/* Text around bottom */}
    <path id="curve" d="M 22 68 A 36 36 0 0 0 78 68" fill="none" />
    <text fill="#fef08a" fontSize="8" fontWeight="bold" letterSpacing="1">
      <textPath href="#curve" startOffset="50%" textAnchor="middle">
        LOS AROMOS
      </textPath>
    </text>
  </svg>
);
