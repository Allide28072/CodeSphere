import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Save, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import usePageMeta from '../../hooks/usePageMeta';
import AdminHeader from '../../components/admin/AdminHeader';
import Loader, { InlineSpinner } from '../../components/Loader';
import { fetchProfile, saveProfile } from '../../lib/adminApi';

const EMPTY = {
  headline: '',
  intro: '',
  availability: '',
};

export default function HomepageAdmin() {
  usePageMeta('Homepage content');
  const { push } = useToast();

  const [values, setValues] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await fetchProfile();
      setValues({
        headline: profile?.headline || '',
        intro: profile?.intro || '',
        availability: profile?.availability || '',
      });
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

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await saveProfile(values);
      push({
        type: 'success',
        title: 'Homepage updated',
        message: 'The hero section now shows your latest content.',
      });
    } catch (saveError) {
      push({
        type: 'error',
        title: 'Could not save homepage',
        message: saveError.message || 'Please try again.',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        eyebrow="Content"
        title="Homepage"
        description="The first thing visitors read. Keep the hero content short, specific, and honest."
        action={
          <Link to="/" target="_blank" rel="noreferrer" className="btn-outline btn-sm">
            <ExternalLink className="h-3.5 w-3.5" />
            View homepage
          </Link>
        }
      />

      {error ? (
        <div className="flex flex-col gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300 sm:flex-row sm:items-center sm:justify-between">
          <p>Could not load homepage content: {error.message}</p>
          <button type="button" onClick={load} className="btn-outline btn-sm shrink-0">
            Try again
          </button>
        </div>
      ) : null}

      {loading ? (
        <Loader label="Loading homepage" />
      ) : error ? null : (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <form onSubmit={handleSubmit} className="card p-5 sm:p-6">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-surface2 text-accent">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-2xl tracking-tight">Hero section</h2>
                <p className="text-xs text-muted">Shown at the top of the public homepage.</p>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <div className="field">
                <label htmlFor="homepage-availability" className="field-label">
                  Availability
                </label>
                <input
                  id="homepage-availability"
                  value={values.availability}
                  onChange={(event) => update('availability', event.target.value)}
                  className="input"
                  placeholder="Open to opportunities and collaborative projects"
                />
                <p className="field-hint">A short status line shown beside the portfolio label.</p>
              </div>

              <div className="field">
                <label htmlFor="homepage-headline" className="field-label">
                  Headline
                </label>
                <textarea
                  id="homepage-headline"
                  value={values.headline}
                  onChange={(event) => update('headline', event.target.value)}
                  className="textarea min-h-[110px]"
                  placeholder="I build websites and software with care, clarity, and a developer’s curiosity."
                />
                <p className="field-hint">The large statement at the top of the page.</p>
              </div>

              <div className="field">
                <label htmlFor="homepage-intro" className="field-label">
                  Introduction
                </label>
                <textarea
                  id="homepage-intro"
                  value={values.intro}
                  onChange={(event) => update('intro', event.target.value)}
                  className="textarea"
                  placeholder="A short paragraph about what you do and what you are learning."
                />
                <p className="field-hint">
                  Used on the homepage and as the site description in search results.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-line pt-5">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <InlineSpinner /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving…' : 'Save homepage'}
              </button>
            </div>
          </form>

          <div className="space-y-4">
            <div className="card overflow-hidden">
              <div className="border-b border-line bg-surface2/60 px-5 py-3">
                <p className="eyebrow">Preview</p>
              </div>
              <div className="p-5">
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface2 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-500" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                    {values.availability || 'Open to opportunities'}
                  </span>
                </span>
                <h3 className="mt-4 font-display text-3xl leading-tight tracking-tight">
                  {values.headline || 'Your headline will appear here.'}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {values.intro || 'Your introduction will appear here.'}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface2/60 p-4">
              <p className="eyebrow">Tip</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                The name, title, biography, and links live under Profile &amp; About. This page only
                controls the homepage hero.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
