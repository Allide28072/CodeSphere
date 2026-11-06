import { useCallback, useEffect, useState } from 'react';
import { Check, Pencil, Plus, Tags, Trash2, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import usePageMeta from '../../hooks/usePageMeta';
import AdminHeader from '../../components/admin/AdminHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import Loader, { InlineSpinner } from '../../components/Loader';
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '../../lib/adminApi';
import { slugify } from '../../lib/format';

export default function CategoriesAdmin() {
  usePageMeta('Manage categories');
  const { push } = useToast();

  const [categories, setCategories] = useState([]);
  const [values, setValues] = useState({ name: '', slug: '' });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', slug: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const nextCategories = await fetchCategories();
      setCategories(nextCategories);
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

  async function handleCreate(event) {
    event.preventDefault();
    const name = values.name.trim();
    if (!name) {
      push({ type: 'error', title: 'Missing name', message: 'Give the category a name.' });
      return;
    }

    const duplicate = categories.some(
      (category) => category.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      push({
        type: 'error',
        title: 'Already exists',
        message: `A category called “${name}” already exists.`,
      });
      return;
    }

    setCreating(true);
    try {
      const created = await createCategory({ name, slug: values.slug });
      setCategories((current) => [...current, created]);
      setValues({ name: '', slug: '' });
      push({
        type: 'success',
        title: 'Category added',
        message: `“${created.name}” is now available for projects.`,
      });
    } catch (createError) {
      push({
        type: 'error',
        title: 'Could not add category',
        message: createError.message || 'Please try again.',
      });
    } finally {
      setCreating(false);
    }
  }

  function startEdit(category) {
    setEditingId(category.id);
    setEditValues({ name: category.name, slug: category.slug });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValues({ name: '', slug: '' });
  }

  async function saveEdit(event) {
    event.preventDefault();
    const name = editValues.name.trim();
    if (!name) {
      push({ type: 'error', title: 'Missing name', message: 'Give the category a name.' });
      return;
    }

    const duplicate = categories.some(
      (category) =>
        category.id !== editingId && category.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      push({
        type: 'error',
        title: 'Already exists',
        message: `A category called “${name}” already exists.`,
      });
      return;
    }

    setSavingEdit(true);
    try {
      const updated = await updateCategory(editingId, editValues);
      setCategories((current) =>
        current.map((category) => (category.id === editingId ? updated : category))
      );
      push({ type: 'success', title: 'Category updated', message: 'Your changes were saved.' });
      cancelEdit();
    } catch (editError) {
      push({
        type: 'error',
        title: 'Could not update category',
        message: editError.message || 'Please try again.',
      });
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteCategory(pendingDelete.id);
      setCategories((current) => current.filter((category) => category.id !== pendingDelete.id));
      push({
        type: 'success',
        title: 'Category deleted',
        message: `“${pendingDelete.name}” was removed.`,
      });
      setPendingDelete(null);
    } catch (deleteError) {
      push({
        type: 'error',
        title: 'Could not delete category',
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
        title="Categories"
        description="Categories organise projects and power the filters on the public Projects page."
      />

      <form onSubmit={handleCreate} className="card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="field flex-1">
            <label htmlFor="category-name" className="field-label">
              Name
            </label>
            <input
              id="category-name"
              value={values.name}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  name: event.target.value,
                  slug: current.slug || slugify(event.target.value),
                }))
              }
              className="input"
              placeholder="Web Applications"
            />
          </div>

          <div className="field flex-1">
            <label htmlFor="category-slug" className="field-label">
              Slug
            </label>
            <input
              id="category-slug"
              value={values.slug}
              onChange={(event) =>
                setValues((current) => ({ ...current, slug: event.target.value }))
              }
              className="input font-mono text-xs"
              placeholder="web-applications"
            />
          </div>

          <button type="submit" className="btn-primary shrink-0" disabled={creating}>
            {creating ? <InlineSpinner /> : <Plus className="h-4 w-4" />}
            {creating ? 'Adding…' : 'Add category'}
          </button>
        </div>
        <p className="mt-3 text-xs text-muted">
          Leave the slug empty to generate one from the name automatically.
        </p>
      </form>

      {error ? (
        <div className="flex flex-col gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300 sm:flex-row sm:items-center sm:justify-between">
          <p>Could not load categories: {error.message}</p>
          <button type="button" onClick={load} className="btn-outline btn-sm shrink-0">
            Try again
          </button>
        </div>
      ) : null}

      {loading ? (
        <Loader label="Loading categories" />
      ) : error ? null : categories.length ? (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-[1fr_12rem_8rem] gap-4 border-b border-line bg-surface2/60 px-5 py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-muted sm:grid">
            <span>Name</span>
            <span>Slug</span>
            <span className="text-right">Actions</span>
          </div>
          <ul className="divide-y divide-line">
            {categories.map((category) => {
              const isEditing = editingId === category.id;
              return (
                <li key={category.id} className="px-4 py-4 sm:px-5">
                  {isEditing ? (
                    <form onSubmit={saveEdit} className="grid gap-3 sm:grid-cols-[1fr_12rem_8rem] sm:items-center">
                      <input
                        value={editValues.name}
                        onChange={(event) =>
                          setEditValues((current) => ({ ...current, name: event.target.value }))
                        }
                        className="input"
                        aria-label="Category name"
                        autoFocus
                      />
                      <input
                        value={editValues.slug}
                        onChange={(event) =>
                          setEditValues((current) => ({ ...current, slug: event.target.value }))
                        }
                        className="input font-mono text-xs"
                        aria-label="Category slug"
                        placeholder={slugify(editValues.name)}
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="submit"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 transition-colors hover:bg-emerald-500/15 dark:text-emerald-300"
                          aria-label="Save category"
                          disabled={savingEdit}
                        >
                          {savingEdit ? <InlineSpinner /> : <Check className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-surface2 hover:text-ink"
                          aria-label="Cancel editing"
                          disabled={savingEdit}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-[1fr_12rem_8rem] sm:items-center">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{category.name}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-muted sm:hidden">
                          /{category.slug}
                        </p>
                      </div>
                      <p className="hidden truncate font-mono text-xs text-muted sm:block">
                        /{category.slug}
                      </p>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEdit(category)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-surface2 hover:text-ink"
                          aria-label={`Edit ${category.name}`}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(category)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300"
                          aria-label={`Delete ${category.name}`}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <EmptyState
          icon={Tags}
          title="No categories yet."
          description="Add at least one category before creating projects."
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this category?"
        description={
          pendingDelete
            ? `“${pendingDelete.name}” will be removed from the category list. Projects keep their existing category text.`
            : ''
        }
        confirmLabel="Delete category"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
      />
    </div>
  );
}
