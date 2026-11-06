export default function StatCard({ label, value, hint, icon: Icon, accent = false }) {
  return (
    <div className={`card p-5 ${accent ? 'border-accent/30 bg-accent-soft/40' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        {Icon ? (
          <span className={`text-muted ${accent ? 'text-accent' : ''}`}>
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <p className="mt-4 font-display text-4xl leading-none tracking-tight">{value}</p>
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
