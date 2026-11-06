import { useCallback, useEffect, useState } from 'react';
import { Save, UserRound } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import usePageMeta from '../../hooks/usePageMeta';
import AdminHeader from '../../components/admin/AdminHeader';
import Loader, { InlineSpinner } from '../../components/Loader';
import { fetchProfile, saveProfile } from '../../lib/adminApi';
import { initials } from '../../lib/format';

const EMPTY = {
  full_name: '',
  professional_title: '',
  biography: '',
  approach: '',
  goals: '',
  email: '',
  location: '',
  github_url: '',
  linkedin_url: '',
  instagram_url: '',
  avatar_url: '',
  resume_url: '',
};

export default function ProfileAdmin() {
  usePageMeta('Profile & about');
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
        full_name: profile?.full_name || '',
        professional_title: profile?.professional_title || '',
        biography: profile?.biography || '',
        approach: profile?.approach || '',
        goals: profile?.goals || '',
        email: profile?.email || '',
        location: profile?.location || '',
        github_url: profile?.github_url || '',
        linkedin_url: profile?.linkedin_url || '',
        instagram_url: profile?.instagram_url || '',
        avatar_url: profile?.avatar_url || '',
        resume_url: profile?.resume_url || '',
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
        title: 'Profile saved',
        message: 'Your profile and about content have been updated.',
      });
    } catch (saveError) {
      push({
        type: 'error',
        title: 'Could not save profile',
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
        title="Profile & About"
        description="The personal details, story, and links shown across the About page and contact sections."
        action={
          <button type="submit" form="profile-form" className="btn-primary btn-sm" disabled={saving}>
            {saving ? <InlineSpinner /> : <Save className="h-3.5 w-3.5" />}
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        }
      />

      {error ? (
        <div className="flex flex-col gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300 sm:flex-row sm:items-center sm:justify-between">
          <p>Could not load profile: {error.message}</p>
          <button type="button" onClick={load} className="btn-outline btn-sm shrink-0">
            Try again
          </button>
        </div>
      ) : null}

      {loading ? (
        <Loader label="Loading profile" />
      ) : error ? null : (
        <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <section className="card p-5 sm:p-6">
              <div className="flex items-center gap-3 border-b border-line pb-4">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-surface2 text-accent">
                  <UserRound className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-2xl tracking-tight">Identity</h2>
                  <p className="text-xs text-muted">Name, title, and public image.</p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-4">
                {values.avatar_url ? (
                  <img
                    src={values.avatar_url}
                    alt=""
                    className="h-16 w-16 rounded-2xl border border-line object-cover"
                  />
                ) : (
                  <span className="monogram-tile h-16 w-16 shrink-0 text-2xl">
                    <span className="font-display italic text-ink/70">
                      {initials(values.full_name)}
                    </span>
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-display text-xl leading-tight tracking-tight">
                    {values.full_name || 'Your name'}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {values.professional_title || 'Professional title'}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                <div className="field">
                  <label htmlFor="profile-full-name" className="field-label">
                    Full name
                  </label>
                  <input
                    id="profile-full-name"
                    value={values.full_name}
                    onChange={(event) => update('full_name', event.target.value)}
                    className="input"
                    placeholder="Your name"
                  />
                </div>

                <div className="field">
                  <label htmlFor="profile-title" className="field-label">
                    Professional title
                  </label>
                  <input
                    id="profile-title"
                    value={values.professional_title}
                    onChange={(event) => update('professional_title', event.target.value)}
                    className="input"
                    placeholder="Web & Software Developer"
                  />
                </div>

                <div className="field">
                  <label htmlFor="profile-avatar" className="field-label">
                    Avatar URL
                  </label>
                  <input
                    id="profile-avatar"
                    type="url"
                    value={values.avatar_url}
                    onChange={(event) => update('avatar_url', event.target.value)}
                    className="input"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="field-hint">Optional. Leave empty to show a monogram instead.</p>
                </div>

                <div className="field">
                  <label htmlFor="profile-resume" className="field-label">
                    Resume URL
                  </label>
                  <input
                    id="profile-resume"
                    type="url"
                    value={values.resume_url}
                    onChange={(event) => update('resume_url', event.target.value)}
                    className="input"
                    placeholder="https://example.com/resume.pdf"
                  />
                </div>
              </div>
            </section>

            <section className="card p-5 sm:p-6">
              <div className="border-b border-line pb-4">
                <h2 className="font-display text-2xl tracking-tight">Story</h2>
                <p className="text-xs text-muted">
                  These paragraphs appear on the About page. Separate paragraphs with a blank line.
                </p>
              </div>

              <div className="mt-5 space-y-5">
                <div className="field">
                  <label htmlFor="profile-biography" className="field-label">
                    Biography
                  </label>
                  <textarea
                    id="profile-biography"
                    value={values.biography}
                    onChange={(event) => update('biography', event.target.value)}
                    className="textarea min-h-[180px]"
                    placeholder="How you got here, what you are working on, and how you think about software."
                  />
                </div>

                <div className="field">
                  <label htmlFor="profile-approach" className="field-label">
                    Approach
                  </label>
                  <textarea
                    id="profile-approach"
                    value={values.approach}
                    onChange={(event) => update('approach', event.target.value)}
                    className="textarea"
                    placeholder="How you work through a project."
                  />
                </div>

                <div className="field">
                  <label htmlFor="profile-goals" className="field-label">
                    Goals
                  </label>
                  <textarea
                    id="profile-goals"
                    value={values.goals}
                    onChange={(event) => update('goals', event.target.value)}
                    className="textarea"
                    placeholder="What you are working toward."
                  />
                </div>
              </div>
            </section>
          </div>

          <section className="card p-5 sm:p-6">
            <div className="border-b border-line pb-4">
              <h2 className="font-display text-2xl tracking-tight">Contact & links</h2>
              <p className="text-xs text-muted">
                Used across the site for contact buttons and social links.
              </p>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="field">
                <label htmlFor="profile-email" className="field-label">
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={values.email}
                  onChange={(event) => update('email', event.target.value)}
                  className="input"
                  placeholder="you@example.com"
                />
              </div>

              <div className="field">
                <label htmlFor="profile-location" className="field-label">
                  Location
                </label>
                <input
                  id="profile-location"
                  value={values.location}
                  onChange={(event) => update('location', event.target.value)}
                  className="input"
                  placeholder="City, Country"
                />
              </div>

              <div className="field">
                <label htmlFor="profile-github" className="field-label">
                  GitHub URL
                </label>
                <input
                  id="profile-github"
                  type="url"
                  value={values.github_url}
                  onChange={(event) => update('github_url', event.target.value)}
                  className="input"
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="field">
                <label htmlFor="profile-linkedin" className="field-label">
                  LinkedIn URL
                </label>
                <input
                  id="profile-linkedin"
                  type="url"
                  value={values.linkedin_url}
                  onChange={(event) => update('linkedin_url', event.target.value)}
                  className="input"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="field">
                <label htmlFor="profile-instagram" className="field-label">
                  Instagram URL
                </label>
                <input
                  id="profile-instagram"
                  type="url"
                  value={values.instagram_url}
                  onChange={(event) => update('instagram_url', event.target.value)}
                  className="input"
                  placeholder="https://instagram.com/username"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-line pt-5">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <InlineSpinner /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving…' : 'Save profile'}
              </button>
            </div>
          </section>
        </form>
      )}
    </div>
  );
}
