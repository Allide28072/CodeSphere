import { initials } from '../lib/format';

export default function MediaPlaceholder({ title, label, className = '' }) {
  return (
    <div className={`relative overflow-hidden bg-surface2 ${className}`}>
      <div className="absolute inset-0 surface-grid opacity-70" aria-hidden="true" />
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
        <span className="font-display text-6xl italic leading-none text-ink/20 sm:text-7xl">
          {initials(title)}
        </span>
        {label ? <span className="eyebrow text-[9px]">{label}</span> : null}
      </div>
      <span className="absolute bottom-4 left-4 h-1.5 w-1.5 rounded-full bg-accent" />
    </div>
  );
}
