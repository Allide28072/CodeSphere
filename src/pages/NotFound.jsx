import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

export default function NotFound() {
  usePageMeta('Page not found', 'The page you were looking for could not be found.');

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 surface-grid opacity-40" aria-hidden="true" />
      <div className="container-page relative flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">Error / 404</p>
        <p className="mt-6 font-display text-[8rem] leading-none tracking-tighter text-ink/15 sm:text-[11rem]">
          404
        </p>
        <h1 className="mt-2 display-title text-4xl sm:text-5xl">This page took a wrong turn.</h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          The page you were looking for does not exist, or it may have moved. The rest of the site is
          still here.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn-primary">
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
          <Link to="/projects" className="btn-outline">
            Browse projects
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
