import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  ImagePlus,
  Save,
  Star,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import usePageMeta from '../../hooks/usePageMeta';
import AdminHeader from '../../components/admin/AdminHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import Loader, { InlineSpinner } from '../../components/Loader';
import MediaPlaceholder from '../../components/MediaPlaceholder';
import TagInput from '../../components/TagInput';
import {
  createMediaRecord,
  createProject,
  deleteMediaRecord,
  fetchCategories,
  fetchProject,
  fetchProjectMediaForAdmin,
  updateMediaAlt,
  updateProject,
  uploadMediaFile,
  validateMediaFile,
} from '../../lib/adminApi';
import {
  ALLOWED_MEDIA_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  PROJECT_STATUSES,
} from '../../lib/constants';
import { slugify } from '../../lib/format';

const EMPTY = {
  title: '',
  slug: '',
  summary: '',
  description: '',
  category: '',
  technologies: [],
  features: [],
  status: 'completed',
  published: false,
  featured: false,
  thumbnail_url: '',
  live_url: '',
  github_url: '',
};

export default function ProjectEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { push } = useToast();
  usePageMeta(isNew ? 'New project' : 'Edit project');

  const [values, setValues] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [media, setMedia] = useState([]);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingMediaDelete, setPendingMediaDelete] = useState(null);
  const [deletingMedia, setDeletingMedia] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const nextCategories = await fetchCategories();
      setCategories(nextCategories);

      if (isNew) {
        setValues((current) => ({
          ...current,
          category: current.category || nextCategories[0]?.name || '',
        }));
        setMedia([]);
      } else {
        const [project, projectMedia] = await Promise.all([
          fetchProject(id),
          fetchProjectMediaForAdmin(id),
        ]);

        if (!project) {
          setError(new Error('This project could not be found. It may have been deleted.'));
          return;
        }

        setValues({
          title: project.title || '',
          slug: project.slug || '',
          summary: project.summary || '',
          description: project.description || '',
          category: project.category || '',
          technologies: project.technologies || [],
          features: project.features || [],
          status: project.status || 'completed',
          published: Boolean(project.published),
          featured: Boolean(project.featured),
          thumbnail_url: project.thumbnail_url || '',
          live_url: project.live_url || '',
          github_url: project.github_url || '',
        });
        setSlugTouched(true);
        setMedia(projectMedia);
      }

      setError(null);
    } catch (loadError) {
      setError(loadError);
    } finally {
      setLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    load();
  }, [load]);

  function update(field, value) {
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === 'title' && !slugTouched ? { slug: slugify(value) } : {}),
    }));
  }

  function generateSlug() {
    setValues((current) => ({ ...current, slug: slugify(current.title) }));
    setSlugTouched(true);
  }

  function validate() {
    if (!values.title.trim()) return 'Add a project title.';
    if (!values.summary.trim()) return 'Add a short summary.';
    if (!values.slug.trim()) return 'Add a slug for the project URL.';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug.trim())) {
      return 'The slug can only contain lowercase letters, numbers, and hyphens.';
    }
    if (!values.category) return 'Choose a category.';
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      push({ type: 'error', title: 'Check the form', message: validationError });
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const created = await createProject(values);
        push({
          type: 'success',
          title: 'Project created',
          message: 'You can now upload screenshots and other media.',
        });
        navigate(`/admin/projects/${created.id}/edit`, { replace: true });
      } else {
        await updateProject(id, values);
        push({
          type: 'success',
          title: 'Project updated',
          message: 'Your changes are now saved.',
        });
        navigate('/admin/projects');
      }
    } catch (saveError) {
      push({
        type: 'error',
        title: 'Could not save project',
        message: saveError.message || 'Please try again.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleFiles(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length || isNew) return;

    let nextOrder = media.length;

    for (const file of files) {
      const validationError = validateMediaFile(file);
      if (validationError) {
        push({ type: 'error', title: 'File not accepted', message: validationError });
        continue;
      }

      setUploading(true);
      setUploadProgress(0);
      try {
        const uploaded = await uploadMediaFile(file, id, setUploadProgress);
        const record = await createMediaRecord({
          projectId: id,
          url: uploaded.url,
          path: uploaded.path,
          mediaType: uploaded.media_type,
          altText: file.name.replace(/\.[^.]+$/, ''),
          sortOrder: nextOrder,
        });
        setMedia((current) => [...current, record]);
        nextOrder += 1;
        push({
          type: 'success',
          title: 'Media uploaded',
          message: `${file.name} is now part of this project.`,
        });
      } catch (uploadError) {
        push({
          type: 'error',
          title: 'Could not upload file',
          message: uploadError.message || 'Please try again.',
        });
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }
  }

  function updateAltText(mediaId, value) {
    setMedia((current) =>
      current.map((item) => (item.id === mediaId ? { ...item, alt_text: value } : item))
    );
  }

  async function saveAltText(item) {
    try {
      await updateMediaAlt(item.id, item.alt_text);
    } catch (altError) {
      push({
        type: 'error',
        title: 'Could not save alt text',
        message: altError.message || 'Please try again.',
      });
    }
  }

  async function handleDeleteMedia() {
    if (!pendingMediaDelete) return;
    setDeletingMedia(true);
    try {
      await deleteMediaRecord(pendingMediaDelete);
      setMedia((current) => current.filter((item) => item.id !== pendingMediaDelete.id));
      push({
        type: 'success',
        title: 'Media removed',
        message: 'The file was deleted from storage and the project.',
      });
      setPendingMediaDelete(null);
    } catch (deleteError) {
      push({
        type: 'error',
        title: 'Could not remove media',
        message: deleteError.message || 'Please try again.',
      });
    } finally {
      setDeletingMedia(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        eyebrow={isNew ? 'New' : 'Edit'}
        title={isNew ? 'Add a project' : 'Edit project'}
        description={
          isNew
            ? 'Create the project record first, then add screenshots and media.'
            : 'Update the case study, publishing options, and media gallery.'
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/admin/projects" className="btn-outline btn-sm">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
            <button
              type="submit"
              form="project-form"
              className="btn-primary btn-sm"
              disabled={saving || loading}
            >
              {saving ? <InlineSpinner /> : <Save className="h-3.5 w-3.5" />}
              {saving ? 'Saving…' : isNew ? 'Create project' : 'Save changes'}
            </button>
          </div>
        }
      />

      {error ? (
        <div className="flex flex-col gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300 sm:flex-row sm:items-center sm:justify-between">
          <p>{error.message}</p>
          <button type="button" onClick={load} className="btn-outline btn-sm shrink-0">
            Try again
          </button>
        </div>
      ) : null}

      {loading ? (
        <Loader label="Loading project" />
      ) : error ? null : (
        <form id="project-form" onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr] xl:items-start">
          <div className="space-y-6">
            <section className="card p-5 sm:p-6">
              <h2 className="font-display text-2xl tracking-tight">Basics</h2>
              <div className="mt-5 space-y-5">
                <div className="field">
                  <label htmlFor="project-title" className="field-label">
                    Title
                  </label>
                  <input
                    id="project-title"
                    value={values.title}
                    onChange={(event) => update('title', event.target.value)}
                    className="input"
                    placeholder="Ledger"
                  />
                </div>

                <div className="field">
                  <label htmlFor="project-slug" className="field-label">
                    <span>Slug</span>
                    <button
                      type="button"
                      onClick={generateSlug}
                      className="text-[10px] font-medium uppercase tracking-[0.12em] text-accent hover:underline"
                    >
                      Generate
                    </button>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted">/projects/</span>
                    <input
                      id="project-slug"
                      value={values.slug}
                      onChange={(event) => {
                        setSlugTouched(true);
                        update('slug', event.target.value);
                      }}
                      className="input font-mono text-xs"
                      placeholder="ledger"
                    />
                  </div>
                  <p className="field-hint">Lowercase letters, numbers, and hyphens only.</p>
                </div>

                <div className="field">
                  <label htmlFor="project-summary" className="field-label">
                    Summary
                  </label>
                  <textarea
                    id="project-summary"
                    value={values.summary}
                    onChange={(event) => update('summary', event.target.value)}
                    className="textarea min-h-[90px]"
                    placeholder="One or two sentences shown on project cards."
                  />
                </div>

                <div className="field">
                  <label htmlFor="project-description" className="field-label">
                    Description
                  </label>
                  <textarea
                    id="project-description"
                    value={values.description}
                    onChange={(event) => update('description', event.target.value)}
                    className="textarea min-h-[200px]"
                    placeholder="The full case study. Separate paragraphs with a blank line."
                  />
                </div>
              </div>
            </section>

            <section className="card p-5 sm:p-6">
              <h2 className="font-display text-2xl tracking-tight">Details</h2>
              <div className="mt-5 space-y-5">
                <div className="field">
                  <label htmlFor="project-technologies" className="field-label">
                    Technologies
                  </label>
                  <TagInput
                    id="project-technologies"
                    value={values.technologies}
                    onChange={(next) => update('technologies', next)}
                    placeholder="React, PostgreSQL, Flutter…"
                    ariaLabel="Project technologies"
                  />
                  <p className="field-hint">Press Enter or comma to add each tool.</p>
                </div>

                <div className="field">
                  <label htmlFor="project-features" className="field-label">
                    Features
                  </label>
                  <TagInput
                    id="project-features"
                    value={values.features}
                    onChange={(next) => update('features', next)}
                    placeholder="What the project does"
                    ariaLabel="Project features"
                  />
                  <p className="field-hint">Short, concrete points shown under “What it does”.</p>
                </div>
              </div>
            </section>

            <section className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl tracking-tight">Media</h2>
                  <p className="text-xs text-muted">Screenshots and videos for the project gallery.</p>
                </div>
                {!isNew ? (
                  <span className="tag">
                    {media.length} {media.length === 1 ? 'file' : 'files'}
                  </span>
                ) : null}
              </div>

              {isNew ? (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-dashed border-line bg-surface2/50 p-4 text-sm text-muted">
                  <ImagePlus className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <p>
                    Save this project first. Once it exists, you can upload screenshots and videos
                    from this page.
                  </p>
                </div>
              ) : (
                <>
                  <label className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-surface2/40 px-5 py-8 text-center transition-colors hover:border-accent/50 hover:bg-surface2">
                    <UploadCloud className="h-6 w-6 text-accent" />
                    <span className="text-sm font-medium text-ink">
                      {uploading ? `Uploading ${uploadProgress}%…` : 'Upload images or videos'}
                    </span>
                    <span className="text-xs text-muted">
                      JPG, PNG, WebP, MP4, or WebM. Images up to 10 MB, videos up to 100 MB.
                    </span>
                    <input
                      type="file"
                      multiple
                      accept={ALLOWED_MEDIA_TYPES.join(',')}
                      onChange={handleFiles}
                      className="sr-only"
                      disabled={uploading}
                    />
                  </label>

                  {uploading ? (
                    <div className="mt-3">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface2">
                        <div
                          className="h-full bg-accent transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted">Uploading… {uploadProgress}%</p>
                    </div>
                  ) : null}

                  <p className="mt-2 text-[11px] text-muted">
                    Limits follow the storage rules: {MAX_IMAGE_BYTES / (1024 * 1024)} MB for images
                    and {MAX_VIDEO_BYTES / (1024 * 1024)} MB for videos.
                  </p>

                  {media.length ? (
                    <ul className="mt-5 space-y-3">
                      {media.map((item) => (
                        <li
                          key={item.id}
                          className="flex flex-col gap-3 rounded-xl border border-line bg-surface2/40 p-3 sm:flex-row sm:items-center"
                        >
                          <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-line bg-surface">
                            {item.media_type === 'video' ? (
                              <video
                                src={item.url}
                                muted
                                playsInline
                                preload="metadata"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <img
                                src={item.url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="tag">{item.media_type || 'image'}</span>
                              {values.thumbnail_url === item.url ? (
                                <span className="tag border-accent/30 bg-accent-soft text-accent">
                                  Cover
                                </span>
                              ) : null}
                            </div>
                            <input
                              value={item.alt_text || ''}
                              onChange={(event) => updateAltText(item.id, event.target.value)}
                              onBlur={() => saveAltText(item)}
                              className="input py-2 text-xs"
                              placeholder="Describe the image for screen readers"
                              aria-label="Alt text"
                            />
                          </div>

                          <div className="flex items-center gap-1.5 sm:flex-col">
                            <button
                              type="button"
                              onClick={() => update('thumbnail_url', item.url)}
                              className="btn-ghost btn-sm"
                              title="Use as project cover"
                            >
                              Use as cover
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingMediaDelete(item)}
                              className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300"
                              aria-label="Delete media"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-5 rounded-xl border border-dashed border-line bg-surface2/40 p-5 text-center text-sm text-muted">
                      No media uploaded yet.
                    </p>
                  )}
                </>
              )}
            </section>
          </div>

          <div className="space-y-6 xl:sticky xl:top-24">
            <section className="card p-5">
              <h2 className="font-display text-2xl tracking-tight">Publishing</h2>
              <div className="mt-4 space-y-4">
                <div className="field">
                  <label htmlFor="project-category" className="field-label">
                    Category
                  </label>
                  <select
                    id="project-category"
                    value={values.category}
                    onChange={(event) => update('category', event.target.value)}
                    className="select"
                  >
                    {categories.length ? (
                      categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))
                    ) : (
                      <option value="">No categories yet</option>
                    )}
                    {values.category &&
                    !categories.some((category) => category.name === values.category) ? (
                      <option value={values.category}>{values.category}</option>
                    ) : null}
                  </select>
                  {!categories.length ? (
                    <p className="field-hint">
                      <Link to="/admin/categories" className="text-accent hover:underline">
                        Add a category
                      </Link>{' '}
                      before creating projects.
                    </p>
                  ) : null}
                </div>

                <div className="field">
                  <label htmlFor="project-status" className="field-label">
                    Status
                  </label>
                  <select
                    id="project-status"
                    value={values.status}
                    onChange={(event) => update('status', event.target.value)}
                    className="select"
                  >
                    {PROJECT_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 border-t border-line pt-4">
                  <button
                    type="button"
                    onClick={() => update('published', !values.published)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                      values.published
                        ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'border-line bg-surface2/50 text-muted hover:text-ink'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-medium">
                      {values.published ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                      {values.published ? 'Published' : 'Draft'}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em]">
                      {values.published ? 'Live' : 'Hidden'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => update('featured', !values.featured)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                      values.featured
                        ? 'border-accent/30 bg-accent-soft text-accent'
                        : 'border-line bg-surface2/50 text-muted hover:text-ink'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-medium">
                      <Star className={`h-4 w-4 ${values.featured ? 'fill-current' : ''}`} />
                      {values.featured ? 'Featured' : 'Not featured'}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em]">
                      {values.featured ? 'Homepage' : 'Standard'}
                    </span>
                  </button>
                </div>
              </div>
            </section>

            <section className="card p-5">
              <h2 className="font-display text-2xl tracking-tight">Links & cover</h2>
              <div className="mt-4 space-y-4">
                <div className="field">
                  <label htmlFor="project-thumbnail" className="field-label">
                    Cover image URL
                  </label>
                  <div className="overflow-hidden rounded-xl border border-line bg-surface2">
                    {values.thumbnail_url ? (
                      <img
                        src={values.thumbnail_url}
                        alt=""
                        className="aspect-[16/10] w-full object-cover"
                      />
                    ) : (
                      <MediaPlaceholder
                        title={values.title || 'Project'}
                        label={values.category || 'No cover'}
                        className="aspect-[16/10] w-full"
                      />
                    )}
                  </div>
                  <input
                    id="project-thumbnail"
                    type="url"
                    value={values.thumbnail_url}
                    onChange={(event) => update('thumbnail_url', event.target.value)}
                    className="input"
                    placeholder="https://example.com/cover.jpg"
                  />
                  <p className="field-hint">You can also choose a cover from uploaded media.</p>
                </div>

                <div className="field">
                  <label htmlFor="project-live" className="field-label">
                    Live URL
                  </label>
                  <input
                    id="project-live"
                    type="url"
                    value={values.live_url}
                    onChange={(event) => update('live_url', event.target.value)}
                    className="input"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="field">
                  <label htmlFor="project-github" className="field-label">
                    Source code URL
                  </label>
                  <input
                    id="project-github"
                    type="url"
                    value={values.github_url}
                    onChange={(event) => update('github_url', event.target.value)}
                    className="input"
                    placeholder="https://github.com/username/project"
                  />
                </div>

                {!isNew && values.slug ? (
                  <Link
                    to={`/projects/${values.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="link-arrow text-xs"
                  >
                    Preview project page
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            </section>

            <div className="rounded-xl border border-line bg-surface2/60 p-4">
              <p className="eyebrow">Reminder</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Drafts stay hidden from the public site. Featured projects appear in the homepage
                selection.
              </p>
            </div>
          </div>
        </form>
      )}

      <ConfirmDialog
        open={Boolean(pendingMediaDelete)}
        title="Delete this media file?"
        description={
          pendingMediaDelete
            ? 'The file will be removed from storage and from this project. This cannot be undone.'
            : ''
        }
        confirmLabel="Delete media"
        busy={deletingMedia}
        onConfirm={handleDeleteMedia}
        onCancel={() => {
          if (!deletingMedia) setPendingMediaDelete(null);
        }}
      />
    </div>
  );
}
