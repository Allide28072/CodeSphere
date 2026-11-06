export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-16 text-center ${className}`}
    >
      {Icon ? (
        <span className="grid h-12 w-12 place-items-center rounded-full border border-line bg-surface text-muted">
          <Icon className="h-5 w-5" />
        </span>
      ) : null}
      <h3 className="mt-5 font-display text-2xl tracking-tight">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
