import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ExternalLink,
  FolderKanban,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  ShieldCheck,
  Sparkles,
  Tags,
  UserRound,
  X,
} from 'lucide-react';
import { ADMIN_NAV } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { InlineSpinner } from '../Loader';
import Logo from '../Logo';

const ICONS = {
  LayoutDashboard,
  FolderKanban,
  Home,
  UserRound,
  Sparkles,
  Tags,
  Mail,
};

function SidebarContent({ onNavigate, onSignOut, signingOut, email, localMode }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-line px-5">
        <Logo to="/admin" compact />
        <span className="ml-2 whitespace-nowrap rounded-full border border-accent2/25 bg-gradient-to-r from-accent2-soft to-accent-soft px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-accent2">
          {localMode ? 'Local Admin' : 'Super Admin'}
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin navigation">
        {ADMIN_NAV.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-line p-3">
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-surface2 px-3 py-2.5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
            <ShieldCheck className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
              {localMode ? 'Local preview' : 'Signed in'}
            </p>
            <p className="truncate text-xs text-ink">{email || 'Administrator'}</p>
          </div>
        </div>
        <Link
          to="/"
          className="admin-sidebar-link"
          onClick={onNavigate}
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink className="h-4 w-4" />
          View website
        </Link>
        <button
          type="button"
          onClick={onSignOut}
          className="admin-sidebar-link w-full text-red-600 hover:bg-red-500/10 hover:text-red-600 dark:text-red-300"
          disabled={signingOut}
        >
          {signingOut ? <InlineSpinner /> : <LogOut className="h-4 w-4" />}
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { signOut, user, checkError, localMode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      navigate('/admin/login', { replace: true });
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="admin-shell">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 bg-gradient-to-r from-accent2 via-accent to-accent2"
        aria-hidden="true"
      />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-surface/80 backdrop-blur-xl lg:block">
        <SidebarContent
          onNavigate={() => {}}
          onSignOut={handleSignOut}
          signingOut={signingOut}
          email={user?.email}
          localMode={localMode}
        />
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur-xl lg:hidden">
        <Logo to="/admin" compact />
        <div className="flex items-center gap-2">
          <Link to="/" className="btn-ghost btn-sm" target="_blank" rel="noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            Site
          </Link>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-ink"
            aria-label="Open admin menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[60] lg:hidden ${drawerOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!drawerOpen}
      >
        <div
          className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ${
            drawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-72 border-r border-line bg-bg shadow-lift transition-transform duration-300 ease-smooth ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="absolute right-3 top-4 z-10 grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface2 hover:text-ink"
            aria-label="Close admin menu"
          >
            <X className="h-4 w-4" />
          </button>
          <SidebarContent
            onNavigate={() => setDrawerOpen(false)}
            onSignOut={handleSignOut}
            signingOut={signingOut}
            email={user?.email}
            localMode={localMode}
          />
        </aside>
      </div>

      <div className="lg:pl-64">
        {checkError ? (
          <div className="border-b border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            <div className="mx-auto flex max-w-6xl items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Admin access could not be verified. Make sure the Supabase schema and admin user are
                set up correctly.
              </p>
            </div>
          </div>
        ) : null}
        <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
