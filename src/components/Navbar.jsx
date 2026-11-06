import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../lib/constants';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-6 lg:h-20">
        <Logo onClick={() => setOpen(false)} />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative rounded-full px-3.5 py-2 text-sm transition-colors ${
                  isActive ? 'text-ink' : 'text-muted hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive ? (
                    <span className="absolute inset-x-3.5 -bottom-0.5 h-px bg-accent" />
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/contact" className="btn-primary btn-sm hidden sm:inline-flex">
            Let’s talk
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-ink lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-menu"
          className="animate-fade-in border-t border-line bg-bg lg:hidden"
        >
          <nav className="container-page flex flex-col py-4" aria-label="Mobile navigation">
            {NAV_LINKS.map((link, index) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center justify-between border-b border-line/60 py-4 text-lg transition-colors ${
                    isActive ? 'text-accent' : 'text-ink'
                  }`
                }
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <span className="font-display text-2xl">{link.label}</span>
                <span className="font-mono text-2xs text-muted">0{index + 1}</span>
              </NavLink>
            ))}
            <Link to="/contact" className="btn-primary mt-5 w-full">
              Start a conversation
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
