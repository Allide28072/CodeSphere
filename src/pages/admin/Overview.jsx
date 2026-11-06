import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle2,
  FolderKanban,
  Mail,
  Plus,
  RefreshCw,
  Star,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import usePageMeta from '../../hooks/usePageMeta';
import AdminHeader from '../../components/admin/AdminHeader';
import StatCard from '../../components/admin/StatCard';
import EmptyState from '../../components/EmptyState';
import Loader, { InlineSpinner } from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';
import { fetchDashboardStats, fetchRecentProjects } from '../../lib/adminApi';
import { formatDate } from '../../lib/format';

const QUICK_ACTIONS = [
  {
    to: '/admin/projects/new',
    label: 'Add a project',
    description: 'Create a new case study',
    icon: Plus,
  },
  {
    to: '/admin/homepage',
    label: 'Edit homepage',
    description: 'Update the hero content',
    icon: UserRound,
  },
  {
    to: '/admin/messages',
    label: 'Read messages',
    description: 'See what people sent',
    icon: Mail,
  },
];

export default function Overview() {
  usePageMeta('Admin overview');
  const { user } = useAuth();
  const { push } = useToast();

  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [nextStats, nextRecent] = await Promise.all([
        fetchDashboardStats(),
        fetchRecentProjects(5),
      ]);
      setStats(nextStats);
      setRecent(nextRecent);
      setError(null);
    } catch (loadError) {
      setError(loadError);
      if (isRefresh) {
        push({
          type: 'error',
          title: 'Could not refresh',
          message: loadError.message || 'Please try again.',
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Overview"
        title={`Welcome back${user?.email ? `, ${user.email.split('@')[0]}` : ''}.`}
        description="A quick snapshot of the portfolio content and recent activity."
        action={
          <button
            type="button"
            onClick={() => load(true)}
            className="btn-outline btn-sm"
            disabled={refreshing}
          >
            {refreshing ? <InlineSpinner /> : <RefreshCw className="h-3.5 w-3.5" />}
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        }
      />

      {error ? (
        <div className="flex flex-col gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300 sm:flex-row sm:items-center sm:justify-between">
          <p>Could not load dashboard data: {error.message}</p>
          <button type="button" onClick={() => load()} className="btn-outline btn-sm shrink-0">
            Try again
          </button>
        </div>
      ) : null}

      {loading ? (
        <Loader label="Loading dashboard" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Projects"
              value={stats?.total ?? 0}
              hint="All project records"
              icon={FolderKanban}
            />
            <StatCard
              label="Published"
              value={stats?.published ?? 0}
              hint="Visible on the public site"
              icon={CheckCircle2}
            />
            <StatCard
              label="Featured"
              value={stats?.featured ?? 0}
              hint="Highlighted on the homepage"
              icon={Star}
              accent
            />
            <StatCard
              label="Unread"
              value={stats?.unread ?? 0}
              hint="Contact messages to review"
              icon={Mail}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <section className="card overflow-hidden">
              <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
                <div>
                  <h2 className="font-display text-2xl tracking-tight">Recent projects</h2>
                  <p className="mt-0.5 text-xs text-muted">The five most recently created.</p>
                </div>
                <Link to="/admin/projects" className="link-arrow text-xs">
                  View all
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {recent.length ? (
                <ul className="divide-y divide-line">
                  {recent.map((project) => (
                    <li key={project.id}>
                      <Link
                        to={`/admin/projects/${project.id}/edit`}
                        className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface2/60"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-surface2 font-mono text-[10px] uppercase text-muted">
                          {project.title?.slice(0, 2) || 'PR'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{project.title}</p>
                          <p className="mt-0.5 truncate text-xs text-muted">
                            {project.category || 'Uncategorised'} ·{' '}
                            {formatDate(project.created_at) || 'No date'}
                          </p>
                        </div>
                        <div className="hidden items-center gap-2 sm:flex">
                          {project.featured ? (
                            <Star className="h-3.5 w-3.5 text-accent" aria-label="Featured" />
                          ) : null}
                          {project.published ? (
                            <span className="tag">Live</span>
                          ) : (
                            <span className="tag">Draft</span>
                          )}
                        </div>
                        <StatusBadge status={project.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-5">
                  <EmptyState
                    icon={FolderKanban}
                    title="No projects yet."
                    description="Add the first project to start building the portfolio."
                    action={
                      <Link to="/admin/projects/new" className="btn-primary btn-sm">
                        <Plus className="h-3.5 w-3.5" />
                        Add a project
                      </Link>
                    }
                    className="border-0 bg-transparent py-10"
                  />
                </div>
              )}
            </section>

            <section className="card p-5">
              <h2 className="font-display text-2xl tracking-tight">Quick actions</h2>
              <ul className="mt-4 space-y-2">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <li key={action.to}>
                      <Link
                        to={action.to}
                        className="flex items-center gap-3 rounded-xl border border-line bg-surface2/50 px-3.5 py-3 transition-colors hover:border-ink/20 hover:bg-surface2"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-accent">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-ink">{action.label}</span>
                          <span className="block text-xs text-muted">{action.description}</span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted" />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-5 rounded-xl border border-line bg-surface2/60 p-4">
                <p className="eyebrow">Reminder</p>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Projects stay hidden on the public site until they are marked as published.
                </p>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
