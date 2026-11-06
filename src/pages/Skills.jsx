import { Link } from 'react-router-dom';
import { ArrowUpRight, Layers, Wrench } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import usePageMeta from '../hooks/usePageMeta';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import SkillsGrid, { groupSkills } from '../components/SkillsGrid';

export default function Skills() {
  const { skills } = useSite();
  usePageMeta(
    'Skills',
    'The languages, frameworks, databases, and tools Allide’ Ru.Ju.Gi.Ra uses to build websites, applications, and software.'
  );

  const groups = groupSkills(skills);

  return (
    <>
      <PageHeader
        eyebrow="Skills"
        title="A practical toolkit, still growing."
        description="A clear look at the languages, frameworks, and tools I work with. No invented proficiency scores — just the things I reach for, practise, and keep learning."
        aside={
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-5">
              <Layers className="h-4 w-4 text-accent" />
              <p className="mt-4 font-display text-3xl leading-none tracking-tight">
                {groups.length}
              </p>
              <p className="mt-1.5 text-xs text-muted">Skill groups</p>
            </div>
            <div className="card p-5">
              <Wrench className="h-4 w-4 text-accent" />
              <p className="mt-4 font-display text-3xl leading-none tracking-tight">
                {skills.length}
              </p>
              <p className="mt-1.5 text-xs text-muted">Tools listed</p>
            </div>
          </div>
        }
      />

      <section className="section">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">The toolkit</p>
            <h2 className="mt-3 display-title text-4xl sm:text-5xl">
              Grouped by the kind of work they do.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted sm:text-base">
              I use these tools across coursework and personal projects. Some are familiar, some are
              still new — each one is here because it helps me build something useful.
            </p>
          </Reveal>

          <div className="mt-10">
            <SkillsGrid skills={skills} />
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface/40">
        <div className="container-page section">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <Reveal>
              <p className="eyebrow">How I learn</p>
              <h2 className="mt-3 display-title text-4xl sm:text-5xl">
                Projects first, tutorials second.
              </h2>
            </Reveal>
            <Reveal delay={80} className="space-y-5 text-sm leading-relaxed text-muted sm:text-base">
              <p>
                I learn best by building something I actually want to exist. A project gives every
                concept a reason to be there: a database table has to hold real data, an interface
                has to survive a small screen, and an error message has to make sense to someone
                else.
              </p>
              <p>
                When I get stuck, I read the documentation, isolate the problem, and write down what
                changed. That habit matters more to me than collecting a long list of technologies.
              </p>
              <Link to="/projects" className="link-arrow mt-2">
                See what I have built
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <Reveal className="flex flex-col items-start gap-6 rounded-3xl border border-line bg-surface p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
                Need one of these skills on your team?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                I am open to junior opportunities, internships, and projects where I can contribute
                and keep growing.
              </p>
            </div>
            <Link to="/contact" className="btn-primary shrink-0">
              Start a conversation
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
