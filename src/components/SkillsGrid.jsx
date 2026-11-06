import Reveal from './Reveal';

export function groupSkills(skills) {
  const groups = [];
  const index = new Map();

  skills.forEach((skill) => {
    if (!index.has(skill.category)) {
      index.set(skill.category, groups.length);
      groups.push({ category: skill.category, items: [] });
    }
    groups[index.get(skill.category)].items.push(skill.name);
  });

  return groups;
}

export default function SkillsGrid({ skills, limit, showIndex = true, compact = false }) {
  const groups = groupSkills(skills);

  return (
    <div className={`grid gap-4 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
      {groups.map((group, groupIndex) => {
        const items = limit ? group.items.slice(0, limit) : group.items;
        const extra = limit ? group.items.length - items.length : 0;

        return (
          <Reveal
            key={group.category}
            delay={Math.min(groupIndex * 50, 250)}
            className="card flex flex-col p-6"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-2xl tracking-tight">{group.category}</h3>
              {showIndex ? (
                <span className="font-mono text-2xs text-muted">
                  {String(groupIndex + 1).padStart(2, '0')}
                </span>
              ) : null}
            </div>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {items.map((item) => (
                <span key={item} className="tag">
                  {item}
                </span>
              ))}
              {extra > 0 ? <span className="tag">+{extra}</span> : null}
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
