import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import usePageMeta from '../../hooks/usePageMeta';
import Logo from '../../components/Logo';
import ThemeToggle from '../../components/ThemeToggle';
import { InlineSpinner } from '../../components/Loader';

export default function Login() {
  usePageMeta('Admin sign in', 'Sign in to manage the portfolio content.');
  const { signIn, session, isAdmin, loading, configured, localMode } = useAuth();
  const { error: siteError } = useSite();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from || '/admin';
  const schemaMissing =
    siteError?.code === 'PGRST205' ||
    siteError?.message?.includes('Could not find the table');
  const projectRef = import.meta.env.VITE_SUPABASE_URL?.match(
    /https:\/\/([^.]+)\.supabase\.co/
  )?.[1];

  useEffect(() => {
    if (!loading && session && isAdmin) {
      navigate(redirectTo, { replace: true });
    }
  }, [loading, session, isAdmin, navigate, redirectTo]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      push({ type: 'success', title: 'Signed in', message: 'Welcome back.' });
      navigate(redirectTo, { replace: true });
    } catch (signInError) {
      const message =
        signInError.message === 'Invalid login credentials'
          ? 'Those credentials were not recognised. Check the email and password and try again.'
          : signInError.message || 'Sign in failed. Please try again.';
      setError(message);
      push({ type: 'error', title: 'Could not sign in', message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-shell relative flex flex-col">
      <div className="pointer-events-none absolute inset-0 surface-grid opacity-40" aria-hidden="true" />

      <header className="relative border-b border-line/70">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="card p-6 shadow-soft sm:p-8">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-accent2/25 bg-gradient-to-br from-accent2-soft to-accent-soft text-accent2">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <p className="mt-5 eyebrow">Super Admin</p>
            <h1 className="mt-2 font-display text-4xl tracking-tight">Sign in</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Manage projects, the homepage, skills, categories, and messages.
            </p>

            {!configured && !localMode ? (
              <div className="mt-6 flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-800 dark:text-amber-200">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Supabase is not configured. Add <code className="font-mono">VITE_SUPABASE_URL</code>{' '}
                  and <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to your{' '}
                  <code className="font-mono">.env</code> file, then reload the site.
                </p>
              </div>
            ) : null}

            {configured && schemaMissing && !localMode ? (
              <div className="mt-6 flex gap-3 rounded-xl border border-accent/25 bg-accent-soft p-4 text-xs leading-relaxed text-accent">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Supabase is connected, but the database tables are missing. Run{' '}
                  <code className="font-mono">supabase/schema.sql</code> in the{' '}
                  {projectRef ? (
                    <a
                      href={`https://supabase.com/dashboard/project/${projectRef}/sql/new`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium underline"
                    >
                      SQL editor
                    </a>
                  ) : (
                    'SQL editor'
                  )}
                  , then reload this page.
                </p>
              </div>
            ) : null}

            {localMode ? (
              <div className="mt-6 flex gap-3 rounded-xl border border-accent/25 bg-accent-soft p-4 text-xs leading-relaxed text-accent">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Local preview mode is active. Sign in with any email and password{' '}
                  <code className="font-mono">28072</code>. Content changes are saved in this
                  browser until Supabase is configured.
                </p>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="field">
                <label htmlFor="admin-email" className="field-label">
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="input"
                  placeholder="admin@example.com"
                  required
                  disabled={!configured && !localMode}
                />
              </div>

              <div className="field">
                <label htmlFor="admin-password" className="field-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="input pr-11"
                    placeholder="••••••••"
                    required
                    disabled={!configured && !localMode}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted transition-colors hover:bg-surface2 hover:text-ink"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error ? (
                <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-700 dark:text-red-300">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={submitting || (!configured && !localMode)}
              >
                {submitting ? <InlineSpinner /> : <LockKeyhole className="h-4 w-4" />}
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-muted">
              {localMode
                ? 'Local preview access uses password 28072. Configure Supabase for real admin accounts.'
                : 'Super Admin access is granted per account. Contact the site owner if you need it.'}
            </p>
          </div>

          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to website
          </Link>
        </div>
      </main>
    </div>
  );
}
