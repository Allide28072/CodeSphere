import { Github, Instagram, Linkedin, Mail } from 'lucide-react';
import { SOCIAL_KEYS } from '../lib/constants';

const ICONS = {
  github_url: Github,
  linkedin_url: Linkedin,
  instagram_url: Instagram,
};

export default function SocialLinks({
  profile,
  showEmail = true,
  showLabels = false,
  className = '',
  iconClassName = 'h-4 w-4',
}) {
  if (!profile) return null;

  const links = SOCIAL_KEYS.filter((item) => profile[item.key]).map((item) => ({
    ...item,
    href: profile[item.key],
    Icon: ICONS[item.key],
    external: true,
  }));

  if (showEmail && profile.email) {
    links.unshift({
      key: 'email',
      label: 'Email',
      href: `mailto:${profile.email}`,
      Icon: Mail,
      external: false,
    });
  }

  if (!links.length) {
    return <p className="text-sm text-muted">Contact links will appear here once added.</p>;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {links.map(({ key, label, href, Icon, external }) => (
        <a
          key={key}
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer noopener' : undefined}
          className={
            showLabels
              ? 'inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-medium text-ink transition-colors hover:border-ink/30 hover:bg-surface2'
              : 'grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/30 hover:text-ink'
          }
          aria-label={label}
          title={label}
        >
          <Icon className={iconClassName} />
          {showLabels ? <span>{label}</span> : null}
        </a>
      ))}
    </div>
  );
}
