export default function Logo({ iconOnly = false, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Shield + Signal SVG Mark */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Shield body */}
        <path
          d="M16 2L4 7V16C4 22.627 9.373 28 16 30C22.627 28 28 22.627 28 16V7L16 2Z"
          fill="url(#shield-grad)"
          opacity="0.15"
        />
        <path
          d="M16 2L4 7V16C4 22.627 9.373 28 16 30C22.627 28 28 22.627 28 16V7L16 2Z"
          stroke="url(#shield-grad)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Signal bars inside shield */}
        <rect x="10" y="18" width="2.5" height="5" rx="1" fill="#38BDF8" />
        <rect x="14.75" y="14" width="2.5" height="9" rx="1" fill="#38BDF8" />
        <rect x="19.5" y="10" width="2.5" height="13" rx="1" fill="#38BDF8" opacity="0.6" />
        {/* Dot accent on top */}
        <circle cx="16" cy="8" r="1.5" fill="#38BDF8" />

        <defs>
          <linearGradient id="shield-grad" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wordmark — hidden if iconOnly */}
      {!iconOnly && (
        <span
          className="text-[17px] font-bold tracking-tight font-display text-slate-900 dark:text-slate-100 leading-none"
        >
          Whistle<span className="text-sky-500">blower</span>
        </span>
      )}
    </div>
  );
}
