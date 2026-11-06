import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  FolderKanban,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import usePageMeta from '../../hooks/usePageMeta';
import AdminHeader from '../../components/admin/AdminHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import Loader, { InlineSpinner } from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';
import {
  deleteProjectRecord,
  fetchAllProjects,
  fetchCategories,
  setProjectFlag,
} from '../../lib/adminApi';
import { PROJECT_STATUSES } from '../../lib/constants';
import { categoryLabel, formatDate } from '../../lib/format';

export default function ProjectsAdmin() {
  usePageMeta('Manage projects');
  const { push } = useToast();

  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [visibility, setVisibility] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [nextProjects, nextCategories] = await Promise.all([
        fetchAllProjects(),
        fetchCategories(),
      ]);
      setProjects(nextProjects);
      setCategories(nextCategories);
      setError(null);
    } catch (loadError) {
      setError(loadError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return projects.filter((project) => {
      if (status !== 'all' && project.status !== status) return false;
      if (category !== 'all' && project.category !== category) return false;
      if (visibility === 'published' && !project.published) return false;
      if (visibility === 'draft' && project.published) return false;
      if (!term) return true;
      return [project.title, project.slug, project.summary, ...(project.technologies || [])]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [projects, query, status, category, visibility]);

  const hasFilters =
    query.trim() || status !== 'all' || category !== 'all' || visibility !== 'all';

  function clearFilters() {
    setQuery('');
    setStatus('all');
    setCategory('all');
    setVisibility('all');
  }

  async function toggleFlag(project, field) {
    const nextValue = !project[field];
    setBusyId(project.id);
    try {
      await setProjectFlag(project.id, field, nextValue);
      setProjects((current) =>
        current.map((item) => (item.id === project.id ? { ...item, [field]: nextValue } : item))
      );
      push({
        type: 'success',
        title: field === 'published' ? 'Visibility updated' : 'Featured status updated',
        message:
          field === 'published'
            ? nextValue
              ? 'The project is now live on the public site.'
              : 'The project is now hidden from the public site.'
            : nextValue
              ? 'The project will appear in featured sections.'
              : 'The project was removed from featured sections.',
      });
    } catch (toggleError) {
      push({
        type: 'error',
        title: 'Could not update project',
        message: toggleError.message || 'Please try again.',
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteProjectRecord(pendingDelete);
      setProjects((current) => current.filter((item) => item.id !== pendingDelete.id));
      push({
        type: 'success',
        title: 'Project deleted',
        message: `“${pendingDelete.title}” and its media have been removed.`,
      });
      setPendingDelete(null);
    } catch (deleteError) {
      push({
        type: 'error',
        title: 'Could not delete project',
        message: deleteError.message || 'Please try again.',
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        eyebrow="Content"
        title="Projects"
        description="Create, edit, publish, and remove the projects shown on the public site."
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => load(true)}
              className="btn-outline btn-sm"
              disabled={refreshing}
            >
              {refreshing ? <InlineSpinner /> : <RefreshCw className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{refreshing ? 'Refreshing…' : 'Refresh'}</span>
            </button>
            <Link to="/admin/projects/new" className="btn-primary btn-sm">
              <Plus className="h-3.5 w-3.5" />
              New project
            </Link>
          </div>
        }
      />

      <div className="card p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <label htmlFor="admin-project-search" className="sr-only">
              Search projects
            </label>
            <input
              id="admin-project-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects…"
              className="input pl-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:w-auto xl:grid-cols-3">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="select"
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="select"
              aria-label="Filter by status"
            >
              <option value="all">Any status</option>
              {PROJECT_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              value={visibility}
              onChange={(event) => setVisibility(event.target.value)}
              className="select"
              aria-label="Filter by visibility"
            >
              <option value="all">All visibility</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-xs text-muted">
          <span>
            Showing {filtered.length} of {projects.length} projects
          </span>
          {hasFilters ? (
            <button type="button" onClick={clearFilters} className="btn-ghost btn-sm">
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="flex flex-col gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300 sm:flex-row sm:items-center sm:justify-between">
          <p>Could not load projects: {error.message}</p>
          <button type="button" onClick={() => load()} className="btn-outline btn-sm shrink-0">
            Try again
          </button>
        </div>
      ) : null}

      {loading ? (
        <Loader label="Loading projects" />
      ) : filtered.length ? (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-[1fr_9rem_8rem_5rem_5rem_7rem] gap-4 border-b border-line bg-surface2/60 px-5 py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-muted lg:grid">
            <span>Project</span>
            <span>Category</span>
            <span>Status</span>
            <span className="text-center">Published</span>
            <span className="text-center">Featured</span>
            <span className="text-right">Actions</span>
          </div>
          <ul className="divide-y divide-line">
            {filtered.map((project) => {
              const busy = busyId === project.id;
              return (
                <li
                  key={project.id}
                  className="grid gap-4 px-4 py-4 transition-colors hover:bg-surface2/40 sm:px-5 lg:grid-cols-[1fr_9rem_8rem_5rem_5rem_7rem] lg:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {project.thumbnail_url ? (
                      <img
                        src={project.thumbnail_url}
                        alt=""
                        className="h-10 w-14 shrink-0 rounded-md border border-line object-cover"
                      />
                    ) : (
                      <span className="grid h-10 w-14 shrink-0 place-items-center rounded-md border border-line bg-surface2 font-mono text-[10px] uppercase text-muted">
                        {project.title?.slice(0, 2) || 'PR'}
                      </span>
                    )}
                    <div className="min-w-0">
                      <Link
                        to={`/admin/projects/${project.id}/edit`}
                        className="block truncate text-sm font-medium text-ink hover:text-accent"
                      >
                        {project.title}
                      </Link>
                      <p className="truncate font-mono text-[10px] text-muted">/{project.slug}</p>
                      <p className="mt-0.5 text-[11px] text-muted lg:hidden">
                        {categoryLabel(categories, project.category)} ·{' '}
                        {formatDate(project.updated_at || project.created_at)}
                      </p>
                    </div>
                  </div>

                  <span className="hidden truncate text-xs text-muted lg:block">
                    {categoryLabel(categories, project.category)}
                  </span>

                  <div className="flex items-center justify-between gap-2 lg:justify-start">
                    <span className="text-[10px] uppercase tracking-[0.12em] text-muted lg:hidden">
                      Status
                    </span>
                    <StatusBadge status={project.status} />
                  </div>

                  <div className="flex items-center justify-between gap-2 lg:justify-center">
                    <span className="text-[10px] uppercase tracking-[0.12em] text-muted lg:hidden">
                      Published
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleFlag(project, 'published')}
                      disabled={busy}
                      className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors ${
                        project.published
                          ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                          : 'border-line bg-surface2 text-muted hover:text-ink'
                      }`}
                      aria-label={project.published ? 'Unpublish project' : 'Publish project'}
                      title={project.published ? 'Published' : 'Draft'}
                    >
                      {busy ? (
                        <InlineSpinner />
                      ) : project.published ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 lg:justify-center">
                    <span className="text-[10px] uppercase tracking-[0.12em] text-muted lg:hidden">
                      Featured
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleFlag(project, 'featured')}
                      disabled={busy}
                      className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors ${
                        project.featured
                          ? 'border-accent/30 bg-accent-soft text-accent'
                          : 'border-line bg-surface2 text-muted hover:text-ink'
                      }`}
                      aria-label={project.featured ? 'Unfeature project' : 'Feature project'}
                      title={project.featured ? 'Featured' : 'Not featured'}
                    >
                      <Star className={`h-3.5 w-3.5 ${project.featured ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      to={`/admin/projects/${project.id}/edit`}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-surface2 hover:text-ink"
                      aria-label={`Edit ${project.title}`}
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(project)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300"
                      aria-label={`Delete ${project.title}`}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title={hasFilters ? 'No projects match those filters.' : 'No projects yet.'}
          description={
            hasFilters
              ? 'Try adjusting the search or filters.'
              : 'Add the first project to start building the portfolio.'
          }
          action={
            hasFilters ? (
              <button type="button" onClick={clearFilters} className="btn-outline btn-sm">
                Reset filters
              </button>
            ) : (
              <Link to="/admin/projects/new" className="btn-primary btn-sm">
                <Plus className="h-3.5 w-3.5" />
                Add a project
              </Link>
            )
          }
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this project?"
        description={
          pendingDelete
            ? `“${pendingDelete.title}” will be permanently deleted, including its uploaded media. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete project"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
      />
    </div>
  );
}
