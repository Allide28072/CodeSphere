export default function PageHeader({ eyebrow, title, description, aside, children }) {
  return (
    <header className="relative overflow-hidden border-b border-line">
      <div className="pointer-events-none absolute inset-0 surface-grid opacity-40" aria-hidden="true" />
      <div className="container-page relative py-14 sm:py-20 lg:py-24">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h1 className="mt-5 display-title text-5xl sm:text-6xl lg:text-7xl">{title}</h1>
            {description ? (
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                {description}
              </p>
            ) : null}
            {children}
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
      </div>
    </header>
  );
}
