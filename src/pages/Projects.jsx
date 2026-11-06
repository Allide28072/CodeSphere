import { useMemo, useState } from 'react';
import { FolderOpen, Search, SlidersHorizontal, X } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import usePageMeta from '../hooks/usePageMeta';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import ProjectCard from '../components/ProjectCard';
import Reveal from '../components/Reveal';
import { PROJECT_STATUSES } from '../lib/constants';
import { categoryLabel } from '../lib/format';

export default function Projects() {
  const { projects, categories } = useSite();
  usePageMeta(
    'Projects',
    'Websites, applications, and software projects built by Allide’ Ru.Ju.Gi.Ra.'
  );

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return projects.filter((project) => {
      if (category !== 'all') {
        const matchesCategory =
          project.category === category ||
          categoryLabel(categories, project.category) === category;
        if (!matchesCategory) return false;
      }

      if (status !== 'all' && project.status !== status) return false;

      if (!term) return true;

      const haystack = [
        project.title,
        project.summary,
        project.description,
        ...(project.technologies || []),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [projects, categories, query, category, status]);

  const hasFilters = query.trim() || category !== 'all' || status !== 'all';

  function clearFilters() {
    setQuery('');
    setCategory('all');
    setStatus('all');
  }

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Things I have built, and things I am building."
        description="A selection of websites, applications, and design work. Some are complete, some are in progress — each one is an attempt to solve a problem properly."
        aside={
          <div className="card px-6 py-5 text-center">
            <p className="font-display text-4xl leading-none tracking-tight">{projects.length}</p>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Public projects
            </p>
          </div>
        }
      />

      <section className="section">
        <div className="container-page">
          <Reveal className="card p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <label htmlFor="project-search" className="sr-only">
                  Search projects
                </label>
                <input
                  id="project-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name, summary, or technology…"
                  className="input pl-10"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <label htmlFor="project-category" className="sr-only">
                    Filter by category
                  </label>
                  <select
                    id="project-category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="select sm:w-52"
                  >
                    <option value="all">All categories</option>
                    {categories.map((item) => (
                      <option key={item.id || item.slug} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label htmlFor="project-status" className="sr-only">
                    Filter by status
                  </label>
                  <select
                    id="project-status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="select sm:w-44"
                  >
                    <option value="all">Any status</option>
                    {PROJECT_STATUSES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
              <p className="inline-flex items-center gap-2 text-xs text-muted">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Showing {filtered.length} of {projects.length}
              </p>
              {hasFilters ? (
                <button type="button" onClick={clearFilters} className="btn-ghost btn-sm">
                  <X className="h-3.5 w-3.5" />
                  Clear filters
                </button>
              ) : null}
            </div>
          </Reveal>

          {filtered.length ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project, index) => (
                <Reveal key={project.id} delay={Math.min(index * 50, 250)}>
                  <ProjectCard project={project} categories={categories} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-10">
              <EmptyState
                icon={FolderOpen}
                title={hasFilters ? 'No projects match those filters.' : 'No projects published yet.'}
                description={
                  hasFilters
                    ? 'Try a different search term, category, or status.'
                    : 'New work will appear here as it is published. In the meantime, get in touch about what we could build together.'
                }
                action={
                  hasFilters ? (
                    <button type="button" onClick={clearFilters} className="btn-outline btn-sm">
                      Reset filters
                    </button>
                  ) : null
                }
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
