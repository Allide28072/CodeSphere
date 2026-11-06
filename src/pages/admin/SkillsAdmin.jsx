import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Sparkles, Trash2, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import usePageMeta from '../../hooks/usePageMeta';
import AdminHeader from '../../components/admin/AdminHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import Loader, { InlineSpinner } from '../../components/Loader';
import { createSkill, deleteSkill, fetchSkills } from '../../lib/adminApi';

export default function SkillsAdmin() {
  usePageMeta('Manage skills');
  const { push } = useToast();

  const [skills, setSkills] = useState([]);
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const nextSkills = await fetchSkills();
      setSkills(nextSkills);
      setError(null);
    } catch (loadError) {
      setError(loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const groups = useMemo(() => {
    const map = new Map();
    skills.forEach((skill) => {
      if (!map.has(skill.category)) map.set(skill.category, []);
      map.get(skill.category).push(skill);
    });
    return Array.from(map, ([groupCategory, items]) => ({ category: groupCategory, items }));
  }, [skills]);

  const categoryOptions = useMemo(
    () => Array.from(new Set(skills.map((skill) => skill.category))),
    [skills]
  );

  async function handleAdd(event) {
    event.preventDefault();
    const nextCategory = category.trim();
    const nextName = name.trim();

    if (!nextCategory || !nextName) {
      push({
        type: 'error',
        title: 'Missing details',
        message: 'Add both a category and a skill name.',
      });
      return;
    }

    const duplicate = skills.some(
      (skill) =>
        skill.category.toLowerCase() === nextCategory.toLowerCase() &&
        skill.name.toLowerCase() === nextName.toLowerCase()
    );

    if (duplicate) {
      push({
        type: 'error',
        title: 'Already listed',
        message: `“${nextName}” is already in ${nextCategory}.`,
      });
      return;
    }

    setAdding(true);
    try {
      const created = await createSkill({ category: nextCategory, name: nextName });
      setSkills((current) => [...current, created]);
      setCategory(nextCategory);
      setName('');
      push({
        type: 'success',
        title: 'Skill added',
        message: `“${created.name}” was added to ${created.category}.`,
      });
    } catch (addError) {
      push({
        type: 'error',
        title: 'Could not add skill',
        message: addError.message || 'Please try again.',
      });
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setBusyId(pendingDelete.id);
    try {
      await deleteSkill(pendingDelete.id);
      setSkills((current) => current.filter((skill) => skill.id !== pendingDelete.id));
      push({
        type: 'success',
        title: 'Skill removed',
        message: `“${pendingDelete.name}” was removed.`,
      });
      setPendingDelete(null);
    } catch (deleteError) {
      push({
        type: 'error',
        title: 'Could not remove skill',
        message: deleteError.message || 'Please try again.',
      });
    } finally {
      setDeleting(false);
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        eyebrow="Content"
        title="Skills"
        description="The languages, frameworks, and tools listed on the Skills page, grouped by category."
      />

      <form onSubmit={handleAdd} className="card p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="field flex-1">
            <label htmlFor="skill-category" className="field-label">
              Category
            </label>
            <input
              id="skill-category"
              list="skill-category-options"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="input"
              placeholder="Frontend, Backend, Databases…"
            />
            <datalist id="skill-category-options">
              {categoryOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>

          <div className="field flex-1">
            <label htmlFor="skill-name" className="field-label">
              Skill
            </label>
            <input
              id="skill-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="input"
              placeholder="React, PostgreSQL, Flutter…"
            />
          </div>

          <button type="submit" className="btn-primary shrink-0" disabled={adding}>
            {adding ? <InlineSpinner /> : <Plus className="h-4 w-4" />}
            {adding ? 'Adding…' : 'Add skill'}
          </button>
        </div>
        <p className="mt-3 text-xs text-muted">
          Choose an existing category or type a new one. Groups appear in the order skills were added.
        </p>
      </form>

      {error ? (
        <div className="flex flex-col gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300 sm:flex-row sm:items-center sm:justify-between">
          <p>Could not load skills: {error.message}</p>
          <button type="button" onClick={load} className="btn-outline btn-sm shrink-0">
            Try again
          </button>
        </div>
      ) : null}

      {loading ? (
        <Loader label="Loading skills" />
      ) : error ? null : groups.length ? (
        <>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
            <span>
              {groups.length} {groups.length === 1 ? 'group' : 'groups'}
            </span>
            <span className="h-1 w-1 rounded-full bg-line" />
            <span>{skills.length} skills listed</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <section key={group.category} className="card flex flex-col p-5">
                <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
                  <h2 className="font-display text-2xl tracking-tight">{group.category}</h2>
                  <span className="font-mono text-2xs text-muted">
                    {String(group.items.length).padStart(2, '0')}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {group.items.map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-flex items-center gap-1 rounded-full border border-line bg-surface2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink"
                    >
                      {skill.name}
                      <button
                        type="button"
                        onClick={() => setPendingDelete(skill)}
                        disabled={busyId === skill.id}
                        className="text-muted transition-colors hover:text-red-600 dark:hover:text-red-300"
                        aria-label={`Remove ${skill.name}`}
                      >
                        {busyId === skill.id ? <InlineSpinner /> : <X className="h-3 w-3" />}
                      </button>
                    </span>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No skills listed yet."
          description="Add the languages, frameworks, and tools you use. They will be grouped automatically."
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Remove this skill?"
        description={
          pendingDelete
            ? `“${pendingDelete.name}” will be removed from ${pendingDelete.category}. This cannot be undone.`
            : ''
        }
        confirmLabel="Remove skill"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
      />

      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface2/60 px-4 py-3 text-xs text-muted">
        <Trash2 className="h-3.5 w-3.5 shrink-0 text-accent" />
        Removing the last skill in a category also removes that group from the public Skills page.
      </div>
    </div>
  );
}
