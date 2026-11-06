export default function Loader({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20" role="status">
      <span className="relative grid h-12 w-12 place-items-center rounded-full border border-line bg-surface">
        <span className="font-display text-xl italic">A</span>
        <span className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-accent" />
      </span>
      <span className="font-mono text-2xs uppercase tracking-[0.2em] text-muted">{label}</span>
    </div>
  );
}

export function FullPageLoader({ label = 'Loading' }) {
  return (
    <div className="grid min-h-screen place-items-center bg-bg">
      <Loader label={label} />
    </div>
  );
}

export function InlineSpinner({ className = '' }) {
  return (
    <span
      className={`inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden="true"
    />
  );
}
