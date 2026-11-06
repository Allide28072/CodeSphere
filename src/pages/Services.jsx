import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Check,
  Code2,
  MonitorSmartphone,
  PenTool,
  Smartphone,
  Wrench,
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import usePageMeta from '../hooks/usePageMeta';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';

const SERVICES = [
  {
    icon: Code2,
    title: 'Website development',
    summary:
      'Responsive marketing sites and web applications built with React, Vite, and Tailwind CSS, backed by an API when the project needs one.',
    points: [
      'Semantic, accessible front-end builds',
      'React and Vite single-page applications',
      'Node.js or Laravel APIs and integrations',
      'Deployment and hosting setup',
    ],
  },
  {
    icon: Smartphone,
    title: 'Application development',
    summary:
      'Cross-platform mobile and desktop applications with Flutter and Dart, designed around the way people will actually use them.',
    points: [
      'Flutter apps for Android and desktop',
      'Offline-first data and sync flows',
      'Supabase or PostgreSQL back ends',
      'Build, test, and release support',
    ],
  },
  {
    icon: PenTool,
    title: 'UI/UX and front-end',
    summary:
      'Interface design and front-end implementation — from content structure and wireframes to a polished, responsive component system.',
    points: [
      'Wireframes and interface structure',
      'Design tokens and reusable components',
      'Responsive and mobile-first layouts',
      'Accessibility and focus states',
    ],
  },
  {
    icon: MonitorSmartphone,
    title: 'Improvements and support',
    summary:
      'Practical help with an existing project: fixing layout issues, improving performance, cleaning up code, or finishing an unfinished feature.',
    points: [
      'Bug fixing and debugging',
      'Responsive and layout fixes',
      'Code review and cleanup',
      'Small features and iterations',
    ],
  },
];

const PROCESS = [
  {
    number: '01',
    title: 'Understand the problem',
    copy: 'We start with what the project needs to do and who it is for. I ask questions before choosing any tools.',
  },
  {
    number: '02',
    title: 'Agree on a small scope',
    copy: 'I break the work into clear, testable pieces so there is something real to review early — not a surprise at the end.',
  },
  {
    number: '03',
    title: 'Build and check',
    copy: 'I build in small increments, check the experience on real devices, and keep you updated as the work moves forward.',
  },
  {
    number: '04',
    title: 'Hand over clearly',
    copy: 'You get the code, a short explanation of how it is structured, and notes on anything that still needs attention.',
  },
];

export default function Services() {
  const { profile } = useSite();
  usePageMeta(
    'Services',
    'Website and application development, UI/UX, and front-end support from Allide’ Ru.Ju.Gi.Ra.'
  );

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Thoughtful builds, honest scope."
        description="I help with websites, applications, and front-end work — with clear communication and a focus on the details that make software feel considered."
        aside={
          <div className="card w-full max-w-xs p-6">
            <p className="eyebrow">Availability</p>
            <p className="mt-3 font-display text-2xl leading-tight tracking-tight">
              {profile.availability || 'Open to opportunities'}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Junior roles, internships, freelance projects, and collaborations.
            </p>
            <Link to="/contact" className="btn-primary btn-sm mt-5 w-full">
              Start a conversation
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        }
      />

      <section className="section">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">What I can help with</p>
            <h2 className="mt-3 display-title text-4xl sm:text-5xl">
              Four ways I usually work with people.
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {SERVICES.map((service, index) => {
              const Icon = service.icon;
              return (
                <Reveal key={service.title} delay={index * 60} className="card flex flex-col p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface2 text-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-2xs text-muted">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl tracking-tight sm:text-3xl">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{service.summary}</p>
                  <ul className="mt-5 space-y-2.5 border-t border-line pt-5">
                    {service.points.map((point) => (
                      <li key={point} className="flex gap-2.5 text-xs leading-relaxed text-muted">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface/40">
        <div className="container-page section">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <Reveal>
              <p className="eyebrow">Process</p>
              <h2 className="mt-3 display-title text-4xl sm:text-5xl">How a project moves.</h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
                No long, mysterious timelines. Each step is meant to make the next one easier to
                understand.
              </p>
            </Reveal>
            <div>
              {PROCESS.map((step, index) => (
                <Reveal
                  key={step.number}
                  delay={index * 60}
                  className="flex gap-5 border-t border-line py-6 first:border-t-0 first:pt-0"
                >
                  <span className="font-mono text-[11px] text-accent">{step.number}</span>
                  <div>
                    <h3 className="font-display text-xl tracking-tight">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.copy}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal className="card p-8 sm:p-10">
            <Wrench className="h-5 w-5 text-accent" />
            <h2 className="mt-5 display-title text-4xl">A note on scope and price.</h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted">
              <p>
                I am early in my career, so I keep engagements small and honest. We agree on the
                scope, the deliverables, and a fair rate before work begins — no hidden extras, no
                vague promises.
              </p>
              <p>
                If something is outside what I can do well, I will say so and point you toward a
                better fit. That is part of doing the work properly.
              </p>
            </div>
          </Reveal>
          <Reveal delay={80} className="flex flex-col justify-between rounded-2xl border border-accent/20 bg-accent-soft p-8 sm:p-10">
            <div>
              <p className="eyebrow text-accent">Next step</p>
              <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight">
                Tell me what you are trying to build.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                A short description is enough to start. I will reply with questions, an honest
                assessment, and a suggested next step.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact" className="btn-primary">
                Get in touch
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link to="/projects" className="btn-outline">
                View projects
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
