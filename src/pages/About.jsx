import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Compass, GraduationCap, MapPin, Target } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import usePageMeta from '../hooks/usePageMeta';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import SkillsGrid from '../components/SkillsGrid';
import SocialLinks from '../components/SocialLinks';
import { initials, splitParagraphs } from '../lib/format';

const PRINCIPLES = [
  {
    number: '01',
    title: 'Clarity over cleverness',
    copy: 'Code and interfaces should be easy to understand. If something needs a long explanation, it can usually be simpler.',
  },
  {
    number: '02',
    title: 'Build to learn',
    copy: 'Every project is a chance to test an idea properly. I would rather ship a small, complete feature than a large one I cannot explain.',
  },
  {
    number: '03',
    title: 'Care for the details',
    copy: 'Spacing, wording, loading states, and error messages all shape how software feels. Those details are part of the work.',
  },
  {
    number: '04',
    title: 'Stay honest',
    copy: 'I am still learning, and I say so. Being clear about what I know — and what I am figuring out — builds better collaborations.',
  },
];

export default function About() {
  const { profile, skills } = useSite();
  usePageMeta('About', profile.intro);

  const biography = splitParagraphs(profile.biography);
  const approach = splitParagraphs(profile.approach);
  const goals = splitParagraphs(profile.goals);

  return (
    <>
      <PageHeader
        eyebrow="About"
        title="A developer in progress, by design."
        description={profile.intro}
        aside={
          <div className="card w-full max-w-sm overflow-hidden">
            <div className="relative border-b border-line bg-surface2 p-6">
              <div className="absolute inset-0 surface-grid opacity-60" aria-hidden="true" />
              <div className="relative flex items-center gap-4">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="h-16 w-16 rounded-2xl border border-line object-cover"
                  />
                ) : (
                  <div className="monogram-tile h-16 w-16 shrink-0 text-2xl">
                    <span className="font-display italic text-ink/70">{initials(profile.full_name)}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-display text-xl leading-tight tracking-tight">
                    {profile.full_name}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {profile.professional_title || 'Web & Software Developer'}
                  </p>
                </div>
              </div>
            </div>
            <dl className="divide-y divide-line">
              <div className="flex items-center gap-3 px-6 py-3.5">
                <GraduationCap className="h-4 w-4 shrink-0 text-accent" />
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">Currently</dt>
                  <dd className="text-xs text-ink">Software development student</dd>
                </div>
              </div>
              {profile.location ? (
                <div className="flex items-center gap-3 px-6 py-3.5">
                  <MapPin className="h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">Based in</dt>
                    <dd className="text-xs text-ink">{profile.location}</dd>
                  </div>
                </div>
              ) : null}
              <div className="flex items-center gap-3 px-6 py-3.5">
                <Compass className="h-4 w-4 shrink-0 text-accent" />
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">Availability</dt>
                  <dd className="text-xs text-ink">
                    {profile.availability || 'Open to opportunities'}
                  </dd>
                </div>
              </div>
            </dl>
            <div className="border-t border-line px-6 py-4">
              <SocialLinks profile={profile} />
            </div>
          </div>
        }
      />

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow">The story</p>
            <h2 className="mt-3 display-title text-4xl sm:text-5xl">
              How I got here — and where I am going.
            </h2>
          </Reveal>
          <Reveal delay={80} className="space-y-5 text-sm leading-relaxed text-muted sm:text-base">
            {biography.length ? (
              biography.map((paragraph, index) => <p key={index}>{paragraph}</p>)
            ) : (
              <p>My biography will appear here once it is added in the admin dashboard.</p>
            )}
          </Reveal>
        </div>
      </section>

      <section className="border-y border-line bg-surface/40">
        <div className="container-page section">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <p className="eyebrow">Approach</p>
              <h2 className="mt-3 display-title text-4xl sm:text-5xl">How I work.</h2>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted sm:text-base">
                {approach.length ? (
                  approach.map((paragraph, index) => <p key={index}>{paragraph}</p>)
                ) : (
                  <p>My working approach will appear here once it is added.</p>
                )}
              </div>
            </Reveal>
            <Reveal delay={100}>
              <p className="eyebrow">Goals</p>
              <h2 className="mt-3 display-title text-4xl sm:text-5xl">What I am working toward.</h2>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted sm:text-base">
                {goals.length ? (
                  goals.map((paragraph, index) => <p key={index}>{paragraph}</p>)
                ) : (
                  <p>My goals will appear here once they are added.</p>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow">Principles</p>
            <h2 className="mt-3 display-title text-4xl sm:text-5xl">The ideas behind the work.</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map((principle, index) => (
              <Reveal key={principle.number} delay={index * 60} className="card p-6 sm:p-8">
                <span className="font-mono text-[10px] text-accent">{principle.number}</span>
                <h3 className="mt-4 font-display text-2xl tracking-tight">{principle.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{principle.copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface/40">
        <div className="container-page section">
          <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Toolkit</p>
              <h2 className="mt-3 display-title text-4xl sm:text-5xl">Tools I reach for.</h2>
            </div>
            <Link to="/skills" className="link-arrow">
              Full skills page
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <div className="mt-10">
            <SkillsGrid skills={skills} limit={4} compact />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <Reveal className="relative overflow-hidden rounded-3xl border border-accent/20 bg-accent-soft px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
            <div className="pointer-events-none absolute inset-0 surface-grid opacity-30" aria-hidden="true" />
            <div className="relative max-w-2xl">
              <span className="inline-flex items-center gap-2 text-accent">
                <Target className="h-4 w-4" />
                <span className="eyebrow text-accent">Let’s build something</span>
              </span>
              <h2 className="mt-4 display-title text-4xl sm:text-5xl">
                Looking for a developer who asks questions?
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-muted sm:text-base">
                I am open to junior roles, internships, freelance work, and collaborations. If you
                are working on something thoughtful, I would like to hear about it.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/contact" className="btn-primary">
                  Get in touch
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link to="/projects" className="btn-outline">
                  See the work
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
