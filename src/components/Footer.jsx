import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { NAV_LINKS } from '../lib/constants';
import { useSite } from '../context/SiteContext';
import SocialLinks from './SocialLinks';

export default function Footer() {
  const { profile } = useSite();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface/40">
      <div className="container-page py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_0.6fr_0.6fr]">
          <div>
            <p className="font-fantasy text-[clamp(2.2rem,5vw,4.5rem)] font-bold leading-[0.95] tracking-tight">
              <span className="logo-allide">Allide’</span>{' '}
              <span className="logo-rujugira">Ru.Ju.Gi.Ra</span>
            </p>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
              {profile.professional_title || 'Web & Software Developer'}. Building thoughtful
              websites, applications, and software from a foundation of curiosity and care.
            </p>
            <div className="mt-6">
              <SocialLinks profile={profile} />
            </div>
          </div>

          <div>
            <p className="eyebrow">Explore</p>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow">Elsewhere</p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href={profile.github_url || 'https://github.com'}
                  target={profile.github_url ? '_blank' : undefined}
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-ink"
                >
                  GitHub
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href={profile.linkedin_url || 'https://linkedin.com'}
                  target={profile.linkedin_url ? '_blank' : undefined}
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-ink"
                >
                  LinkedIn
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href={profile.instagram_url || 'https://instagram.com'}
                  target={profile.instagram_url ? '_blank' : undefined}
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-ink"
                >
                  Instagram
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <Link
                  to="/admin/login"
                  className="text-sm text-muted transition-colors hover:text-ink"
                >
                  Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {profile.full_name || 'Allide’ Ru.Ju.Gi.Ra'}. All rights reserved.
          </p>
          <p className="font-mono text-2xs uppercase tracking-[0.16em]">
            React · Vite · Tailwind · Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
