import React from 'react';

interface NercashLogoProps {
  variant?: 'full' | 'horizontal' | 'compact' | 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export const NercashLogo: React.FC<NercashLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showTagline = false
}) => {
  // Dimensions
  const getIconDimensions = () => {
    switch (size) {
      case 'sm': return { width: 28, height: 28 };
      case 'md': return { width: 36, height: 36 };
      case 'lg': return { width: 48, height: 48 };
      case 'xl': return { width: 72, height: 72 };
      default: return { width: 36, height: 36 };
    }
  };

  const getTextSizes = () => {
    switch (size) {
      case 'sm': return { brand: 'text-sm', sub: 'text-[8px]', slogan: 'text-[7px]' };
      case 'md': return { brand: 'text-lg', sub: 'text-[9px]', slogan: 'text-[9px]' };
      case 'lg': return { brand: 'text-2xl', sub: 'text-[11px]', slogan: 'text-[11px]' };
      case 'xl': return { brand: 'text-4xl', sub: 'text-xs', slogan: 'text-xs' };
      default: return { brand: 'text-lg', sub: 'text-[9px]', slogan: 'text-[9px]' };
    }
  };

  const { width, height } = getIconDimensions();
  const textSizes = getTextSizes();

  // SVG Monogram Icon (3D N-G with Circuit Traces and Glowing Coin)
  const MonogramIcon = (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-[0_0_12px_rgba(34,197,94,0.45)] transition-transform duration-300 hover:scale-105"
    >
      <defs>
        {/* Neon Green Gradient */}
        <linearGradient id="nercash-green-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        {/* Chrome Metallic Silver Gradient */}
        <linearGradient id="nercash-chrome-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#cbd5e1" />
          <stop offset="70%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <linearGradient id="coin-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>

      {/* Circuit Traces Left (Green Neon) */}
      <path d="M12 40H28L36 50" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <circle cx="12" cy="40" r="2.5" fill="#4ade80" />
      <path d="M8 58H22L30 68" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <circle cx="8" cy="58" r="2.5" fill="#4ade80" />
      <path d="M14 76H32" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <circle cx="14" cy="76" r="2.5" fill="#4ade80" />

      {/* Futuristic 3D "N" Letter (Neon Green with Bevel) */}
      <path
        d="M26 88L46 22H62L44 88H26Z"
        fill="url(#nercash-green-grad)"
        stroke="#86efac"
        strokeWidth="1.5"
      />
      <path
        d="M46 22L78 72H60L36 34L46 22Z"
        fill="#16a34a"
        opacity="0.9"
      />
      <path
        d="M50 20L72 20L48 92L30 92L50 20Z"
        stroke="#4ade80"
        strokeWidth="1"
        fill="none"
        filter="url(#neon-glow)"
      />

      {/* Futuristic "C / G" Metallic Chrome Shape */}
      <path
        d="M58 22H102L92 38H68L60 62H88L84 76H56L58 22Z"
        fill="url(#nercash-chrome-grad)"
        stroke="#f8fafc"
        strokeWidth="1"
      />
      <path
        d="M84 76L68 76L64 88H106L112 68H96L98 62L106 62"
        fill="url(#nercash-chrome-grad)"
      />

      {/* Circuit Traces Right */}
      <path d="M68 46H82L88 52" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="88" cy="52" r="2" fill="#86efac" />
      <path d="M64 54H76" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />

      {/* Glowing Neon Green Dollar Coin */}
      <g filter="url(#neon-glow)">
        <circle cx="92" cy="46" r="14" fill="#0f172a" stroke="url(#coin-glow)" strokeWidth="2.5" />
        <circle cx="92" cy="46" r="11" fill="#15803d" fillOpacity="0.4" />
        <text
          x="92"
          y="52"
          textAnchor="middle"
          fontSize="14"
          fontWeight="900"
          fill="#4ade80"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          $
        </text>
      </g>
      {/* Light speed streaks */}
      <line x1="106" y1="44" x2="118" y2="44" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <line x1="106" y1="48" x2="114" y2="48" stroke="#4ade80" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{MonogramIcon}</div>;
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-3">
        {MonogramIcon}

        <div className="flex flex-col">
          {/* Wordmark: nercash */}
          <div className="flex items-baseline leading-none tracking-tight">
            <span className={`font-black italic tracking-tighter text-slate-900 transition-colors dark:text-white ${textSizes.brand}`}>
              ner
            </span>
            <span className={`font-black italic tracking-tighter text-emerald-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)] ${textSizes.brand}`}>
              cash
            </span>
          </div>

          {/* Subtitle with cyber lines */}
          <div className="mt-1 flex items-center gap-1.5">
            <div className="h-[1.5px] w-2.5 bg-gradient-to-r from-transparent to-emerald-500" />
            <span className={`font-bold tracking-[0.22em] text-slate-600 uppercase dark:text-slate-300 ${textSizes.sub}`}>
              Gateway de Pagamento
            </span>
            <div className="h-[1.5px] w-2.5 bg-gradient-to-l from-transparent to-emerald-500" />
          </div>
        </div>
      </div>

      {/* Full Variant extra details (Pillars & Slogan) */}
      {variant === 'full' && (
        <div className="mt-4 border-t border-slate-200/60 pt-3 dark:border-slate-800/80">
          {/* 4 Pillars */}
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <div className="flex flex-col items-center gap-0.5 rounded-lg bg-slate-100/70 p-1.5 dark:bg-slate-800/60">
              <span className="text-emerald-500">🛡️</span>
              <span>Seguro</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-lg bg-slate-100/70 p-1.5 dark:bg-slate-800/60">
              <span className="text-emerald-500">⚡</span>
              <span>Rápido</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-lg bg-slate-100/70 p-1.5 dark:bg-slate-800/60">
              <span className="text-emerald-500">🌐</span>
              <span>Global</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-lg bg-slate-100/70 p-1.5 dark:bg-slate-800/60">
              <span className="text-emerald-500">📈</span>
              <span>Eficiente</span>
            </div>
          </div>

          {/* Slogan */}
          {showTagline && (
            <p className="mt-2.5 text-center font-mono text-[9px] tracking-widest text-slate-500 uppercase dark:text-slate-400">
              Tecnologia • Conexão • Confiança
            </p>
          )}
        </div>
      )}
    </div>
  );
};
