import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  GraduationCap,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import usePageMeta from '../hooks/usePageMeta';
import ProjectCard from '../components/ProjectCard';
import Reveal from '../components/Reveal';
import SkillsGrid from '../components/SkillsGrid';
import SocialLinks from '../components/SocialLinks';

const TOOLKIT = [
  'React',
  'JavaScript',
  'Node.js',
  'Laravel',
  'Flutter',
  'PostgreSQL',
  'Tailwind CSS',
  'Figma',
];

export default function Home() {
  const { profile, projects, skills, categories, featuredProjects } = useSite();
  usePageMeta(null, profile.intro);

  const selected = (featuredProjects.length ? featuredProjects : projects).slice(0, 3);
  const year = new Date().getFullYear();

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 surface-grid opacity-50" aria-hidden="true" />
        <div className="container-page relative">
          <div className="grid gap-14 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
            <div className="animate-fade-up">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-500" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                    {profile.availability || 'Open to opportunities'}
                  </span>
                </span>
                <span className="eyebrow">Portfolio / {year}</span>
              </div>

              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.26em] text-accent">
                {profile.full_name}
              </p>
              <h1 className="mt-4 display-title text-[clamp(2.9rem,6vw,5.6rem)]">
                {profile.headline ||
                  'I build websites and software with care, clarity, and a developer’s curiosity.'}
              </h1>
              <p className="mt-7 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                {profile.intro}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/projects" className="btn-primary">
                  Explore projects
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link to="/contact" className="btn-outline">
                  Get in touch
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6 text-xs text-muted">
                <span className="inline-flex items-center gap-2">
                  <Code2 className="h-3.5 w-3.5 text-accent" />
                  {profile.professional_title || 'Web & Software Developer'}
                </span>
                <span className="inline-flex items-center gap-2">
                  <GraduationCap className="h-3.5 w-3.5 text-accent" />
                  Software development student
                </span>
                {profile.location ? (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-accent" />
                    {profile.location}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="relative animate-fade-up" style={{ animationDelay: '120ms' }}>
              <div className="absolute -inset-3 rounded-[2rem] border border-line/70" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
                <div className="flex items-center justify-between border-b border-line bg-surface2/60 px-5 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-line" />
                    <span className="h-2 w-2 rounded-full bg-line" />
                    <span className="h-2 w-2 rounded-full bg-accent/70" />
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                    developer.profile
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>

                <div className="p-6 sm:p-7">
                  <div className="flex items-start gap-4">
                    <div className="monogram-tile h-16 w-16 shrink-0 text-2xl">
                      <span className="font-display italic text-ink/70">AR</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-2xl leading-tight tracking-tight">
                        {profile.full_name}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {profile.professional_title || 'Web & Software Developer'}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
                    {[
                      ['Focus', 'Web · Mobile · UI'],
                      ['Stack', 'React · Node · Laravel'],
                      ['Learning', 'Testing · Architecture'],
                      ['Status', 'Open to work'],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-surface p-3.5">
                        <dt className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted">
                          {label}
                        </dt>
                        <dd className="mt-1.5 text-[11px] leading-snug text-ink">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-5 rounded-xl border border-line bg-bg/60 p-4 font-mono text-[11px] leading-relaxed">
                    <p>
                      <span className="text-accent">$</span> whoami
                    </p>
                    <p className="text-muted">developer · student · builder</p>
                    <p className="mt-2">
                      <span className="text-accent">$</span> current_focus
                    </p>
                    <p className="text-muted">shipping considered interfaces</p>
                    <p className="mt-2">
                      <span className="text-accent">$</span> status
                    </p>
                    <p>
                      <span className="text-emerald-500">●</span> learning in public
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 right-4 hidden rounded-full border border-accent/30 bg-accent-soft px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-accent sm:block">
                Building & learning
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line py-5">
            <span className="eyebrow">Working with</span>
            {TOOLKIT.map((item) => (
              <span key={item} className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Selected work</p>
              <h2 className="mt-3 display-title text-4xl sm:text-5xl">
                Projects I’m building and refining.
              </h2>
            </div>
            <Link to="/projects" className="link-arrow">
              All projects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          {selected.length ? (
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {selected.map((project, index) => (
                <Reveal
                  key={project.id}
                  delay={index * 70}
                  className={index === 0 ? 'lg:col-span-2' : ''}
                >
                  <ProjectCard project={project} categories={categories} feature={index === 0} />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal className="mt-10 rounded-2xl border border-dashed border-line bg-surface/50 p-10 text-center">
              <Sparkles className="mx-auto h-5 w-5 text-accent" />
              <h3 className="mt-4 font-display text-2xl">New work is being prepared.</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
                Projects will appear here as they are published. In the meantime, feel free to get in
                touch about what we could build together.
              </p>
              <Link to="/contact" className="btn-outline btn-sm mt-5">
                Start a conversation
              </Link>
            </Reveal>
          )}
        </div>
      </section>

      <section className="border-y border-line bg-surface/40">
        <div className="container-page section">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <Reveal>
              <p className="eyebrow">Toolkit</p>
              <h2 className="mt-3 display-title text-4xl sm:text-5xl">
                Languages, frameworks, and tools I work with.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
                A practical toolkit built through coursework and personal projects. No invented
                proficiency scores — just the tools I reach for and keep learning.
              </p>
              <Link to="/skills" className="link-arrow mt-6">
                See the full skills page
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
            <SkillsGrid skills={skills} limit={4} compact />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <p className="eyebrow">About</p>
            <h2 className="mt-3 display-title text-4xl sm:text-5xl">
              A developer in progress, by design.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              {profile.biography?.split('\n\n')[0] ||
                profile.intro}
            </p>
            <ul className="mt-8 space-y-4">
              {[
                ['01', 'Clarity over cleverness', 'Code and interfaces should be easy to understand.'],
                ['02', 'Build to learn', 'Every project is a chance to test an idea properly.'],
                ['03', 'Care for the details', 'Small decisions shape how software feels to use.'],
              ].map(([number, title, copy]) => (
                <li key={number} className="flex gap-4 border-t border-line pt-4">
                  <span className="font-mono text-[10px] text-accent">{number}</span>
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">{copy}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/about" className="link-arrow mt-7">
              Read the full story
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <Reveal delay={100} className="order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-3xl border border-line bg-surface2">
              <div className="absolute inset-0 surface-grid opacity-70" aria-hidden="true" />
              <div className="relative flex aspect-[4/5] max-h-[520px] flex-col justify-between p-8 sm:p-10">
                <div className="flex items-start justify-between">
                  <span className="eyebrow">Profile / 01</span>
                  <span className="h-2 w-2 rounded-full bg-accent" />
                </div>
                <div className="text-center">
                  <p className="font-display text-[7rem] leading-none tracking-tight text-ink/15 sm:text-[9rem]">
                    AR
                  </p>
                </div>
                <div>
                  <p className="font-display text-3xl leading-tight tracking-tight">
                    {profile.full_name}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    {profile.professional_title || 'Web & Software Developer'}
                  </p>
                  <div className="mt-4 h-px w-full bg-line" />
                  <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted">
                    Learning, building, and improving — one project at a time.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pb-20 sm:pb-24 lg:pb-28">
        <div className="container-page">
          <Reveal className="relative overflow-hidden rounded-3xl border border-accent/20 bg-accent-soft px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
            <div className="pointer-events-none absolute inset-0 surface-grid opacity-30" aria-hidden="true" />
            <div className="relative max-w-3xl">
              <p className="eyebrow text-accent">Next step</p>
              <h2 className="mt-4 display-title text-4xl sm:text-5xl lg:text-6xl">
                Have a project, an idea, or a question?
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                I’m open to junior opportunities, internships, freelance work, and collaborative
                projects. Tell me what you’re working on — I’ll be honest about whether I’m the right
                fit.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/contact" className="btn-primary">
                  Start a conversation
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link to="/services" className="btn-outline">
                  View services
                </Link>
                <SocialLinks profile={profile} className="ml-1" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
