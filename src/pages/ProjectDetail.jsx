import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Github,
  Layers,
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import usePageMeta from '../hooks/usePageMeta';
import Loader from '../components/Loader';
import MediaGallery from '../components/MediaGallery';
import MediaPlaceholder from '../components/MediaPlaceholder';
import ProjectCard from '../components/ProjectCard';
import Reveal from '../components/Reveal';
import StatusBadge from '../components/StatusBadge';
import { fetchProjectMedia } from '../lib/publicApi';
import {
  categoryLabel,
  formatDate,
  safeExternalUrl,
  splitParagraphs,
  truncate,
} from '../lib/format';

export default function ProjectDetail() {
  const { slug } = useParams();
  const { projects, categories, getProjectBySlug, loading } = useSite();
  const project = getProjectBySlug(slug);

  const [media, setMedia] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(Boolean(project));
  const [mediaError, setMediaError] = useState(null);

  usePageMeta(
    project?.title || 'Project',
    project ? truncate(project.summary, 155) : undefined
  );

  useEffect(() => {
    let active = true;
    if (!project) {
      setMedia([]);
      setMediaLoading(false);
      return undefined;
    }

    setMediaLoading(true);
    setMediaError(null);

    fetchProjectMedia(project)
      .then((items) => {
        if (active) setMedia(items || []);
      })
      .catch((error) => {
        if (active) setMediaError(error);
      })
      .finally(() => {
        if (active) setMediaLoading(false);
      });

    return () => {
      active = false;
    };
  }, [project]);

  if (!project && loading) {
    return <Loader label="Loading project" />;
  }

  if (!project) {
    return (
      <section className="section">
        <div className="container-page">
          <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-line bg-surface/60 p-10 text-center">
            <p className="eyebrow">Not found</p>
            <h1 className="mt-4 display-title text-4xl">This project is not available.</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              It may have been unpublished, renamed, or removed. The rest of the work is still here.
            </p>
            <Link to="/projects" className="btn-primary mt-6">
              <ArrowLeft className="h-4 w-4" />
              Back to projects
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const paragraphs = splitParagraphs(project.description);
  const technologies = project.technologies || [];
  const features = project.features || [];
  const liveUrl = safeExternalUrl(project.live_url);
  const githubUrl = safeExternalUrl(project.github_url);

  const galleryItems = media.length
    ? media
    : project.thumbnail_url
      ? [
          {
            id: `${project.id}-thumbnail`,
            url: project.thumbnail_url,
            media_type: 'image',
            alt_text: `${project.title} cover`,
          },
        ]
      : [];

  const related = projects
    .filter(
      (item) =>
        item.id !== project.id &&
        (item.category === project.category ||
          (item.technologies || []).some((tech) => technologies.includes(tech)))
    )
    .slice(0, 3);

  return (
    <>
      <div className="border-b border-line bg-surface/40">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3.5">
          <Link to="/projects" className="link-arrow text-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
            All projects
          </Link>
          <div className="flex items-center gap-2">
            <StatusBadge status={project.status} />
            <span className="tag">{categoryLabel(categories, project.category)}</span>
          </div>
        </div>
      </div>

      <header className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 surface-grid opacity-40" aria-hidden="true" />
        <div className="container-page relative py-12 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <p className="eyebrow">Case study / {project.slug}</p>
              <h1 className="mt-5 display-title text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
                {project.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                {project.summary}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {liveUrl ? (
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-primary"
                  >
                    View live
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : null}
                {githubUrl ? (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-outline"
                  >
                    <Github className="h-4 w-4" />
                    Source code
                  </a>
                ) : null}
                {!liveUrl && !githubUrl ? (
                  <span className="text-xs text-muted">
                    Links for this project will be added when they are available.
                  </span>
                ) : null}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-line bg-surface2">
              {project.thumbnail_url ? (
                <img
                  src={project.thumbnail_url}
                  alt={`${project.title} cover`}
                  className="aspect-[16/10] w-full object-cover"
                />
              ) : (
                <MediaPlaceholder
                  title={project.title}
                  label={categoryLabel(categories, project.category)}
                  className="aspect-[16/10] w-full"
                />
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div className="min-w-0">
            <Reveal>
              <p className="eyebrow">Overview</p>
              <div className="mt-5 space-y-5 text-sm leading-relaxed text-muted sm:text-base">
                {paragraphs.length ? (
                  paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
                ) : (
                  <p>{project.summary}</p>
                )}
              </div>
            </Reveal>

            {features.length ? (
              <Reveal delay={60} className="mt-12">
                <p className="eyebrow">What it does</p>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className="flex gap-3 rounded-xl border border-line bg-surface p-4 text-sm leading-relaxed text-muted"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}

            <div className="mt-12">
              <Reveal className="flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Gallery</p>
                  <h2 className="mt-2 display-title text-3xl">Screens and media.</h2>
                </div>
              </Reveal>
              <div className="mt-6">
                {mediaLoading ? (
                  <Loader label="Loading media" />
                ) : mediaError ? (
                  <p className="rounded-xl border border-line bg-surface p-5 text-sm text-muted">
                    Media could not be loaded right now. Please try again later.
                  </p>
                ) : (
                  <MediaGallery media={galleryItems} title={project.title} />
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <p className="eyebrow">Project details</p>
              <dl className="mt-4 space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-line pb-3">
                  <dt className="text-xs text-muted">Category</dt>
                  <dd className="text-right text-xs font-medium text-ink">
                    {categoryLabel(categories, project.category)}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-line pb-3">
                  <dt className="text-xs text-muted">Status</dt>
                  <dd className="text-right text-xs font-medium text-ink">
                    <StatusBadge status={project.status} />
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-line pb-3">
                  <dt className="inline-flex items-center gap-1.5 text-xs text-muted">
                    <Calendar className="h-3.5 w-3.5" />
                    Updated
                  </dt>
                  <dd className="text-right text-xs font-medium text-ink">
                    {formatDate(project.updated_at || project.created_at) || '—'}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="inline-flex items-center gap-1.5 text-xs text-muted">
                    <Layers className="h-3.5 w-3.5" />
                    Stack
                  </dt>
                  <dd className="text-right text-xs font-medium text-ink">
                    {technologies.length} tools
                  </dd>
                </div>
              </dl>
            </div>

            {technologies.length ? (
              <div className="card p-6">
                <p className="eyebrow">Built with</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {technologies.map((tech) => (
                    <span key={tech} className="tag">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-accent/20 bg-accent-soft p-6">
              <p className="font-display text-2xl leading-tight tracking-tight">
                Interested in something similar?
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Tell me about the problem you are trying to solve.
              </p>
              <Link to="/contact" className="btn-primary btn-sm mt-4">
                Start a conversation
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {related.length ? (
        <section className="border-t border-line bg-surface/40">
          <div className="container-page section">
            <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Keep exploring</p>
                <h2 className="mt-3 display-title text-4xl sm:text-5xl">Related projects.</h2>
              </div>
              <Link to="/projects" className="link-arrow">
                All projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <Reveal key={item.id} delay={index * 60}>
                  <ProjectCard project={item} categories={categories} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
