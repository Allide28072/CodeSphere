import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { categoryLabel } from '../lib/format';
import MediaPlaceholder from './MediaPlaceholder';
import StatusBadge from './StatusBadge';

export default function ProjectCard({ project, categories = [], feature = false }) {
  const technologies = project.technologies || [];
  const visibleTech = technologies.slice(0, feature ? 5 : 3);
  const extraTech = technologies.length - visibleTech.length;

  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group card card-hover flex h-full flex-col overflow-hidden"
      aria-label={`View project: ${project.title}`}
    >
      <div className={`relative overflow-hidden ${feature ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}>
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={`${project.title} project thumbnail`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.035]"
          />
        ) : (
          <MediaPlaceholder
            title={project.title}
            label={categoryLabel(categories, project.category)}
            className="h-full w-full"
          />
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
          <span className="rounded-full border border-white/20 bg-black/45 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white backdrop-blur-md">
            {categoryLabel(categories, project.category)}
          </span>
          <StatusBadge status={project.status} className="bg-surface/90 backdrop-blur-md" />
        </div>
      </div>

      <div className={`flex flex-1 flex-col ${feature ? 'p-6 sm:p-8' : 'p-6'}`}>
        <div className="flex items-start justify-between gap-4">
          <h3
            className={`font-display leading-tight tracking-tight ${
              feature ? 'text-3xl sm:text-4xl' : 'text-2xl'
            }`}
          >
            {project.title}
          </h3>
          <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-ink">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
        <p className={`mt-3 text-muted ${feature ? 'max-w-2xl text-sm leading-relaxed' : 'line-clamp-2 text-sm leading-relaxed'}`}>
          {project.summary}
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
          {visibleTech.map((tech) => (
            <span key={tech} className="tag">
              {tech}
            </span>
          ))}
          {extraTech > 0 ? <span className="tag">+{extraTech}</span> : null}
        </div>
      </div>
    </Link>
  );
}
