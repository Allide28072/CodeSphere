import { useState } from 'react';
import { CheckCircle2, Clock, Mail, MapPin, Send, ShieldCheck } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { useToast } from '../context/ToastContext';
import usePageMeta from '../hooks/usePageMeta';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import SocialLinks from '../components/SocialLinks';
import { InlineSpinner } from '../components/Loader';
import { submitContactMessage } from '../lib/publicApi';

const EMPTY_FORM = { name: '', email: '', subject: '', message: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  const { profile, isDemo, localMode } = useSite();
  const { push } = useToast();
  usePageMeta(
    'Contact',
    'Get in touch with Allide’ Ru.Ju.Gi.Ra about a project, a role, or a collaboration.'
  );

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = 'Please add your name.';
    if (!form.email.trim()) {
      next.email = 'Please add an email address.';
    } else if (!EMAIL_PATTERN.test(form.email.trim())) {
      next.email = 'That email address does not look right.';
    }
    if (!form.subject.trim()) next.subject = 'Please add a subject.';
    if (!form.message.trim()) {
      next.message = 'Please write a short message.';
    } else if (form.message.trim().length < 20) {
      next.message = 'A little more detail would help — at least 20 characters.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await submitContactMessage(form);
      setForm(EMPTY_FORM);
      setSent(true);
      push({
        type: 'success',
        title: 'Message sent',
        message: 'Thanks for reaching out. I will get back to you as soon as I can.',
      });
    } catch (error) {
      push({
        type: 'error',
        title: 'Message not sent',
        message: error.message || 'Something went wrong. Please try again or use email instead.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  const contactDisabled = isDemo && !localMode;

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let’s start a conversation."
        description="Have a project, a role, or a question in mind? Send a message with a little context and I will reply with an honest answer."
      />

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <Reveal className="card p-6 sm:p-8">
            {sent ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                  <CheckCircle2 className="h-6 w-6" />
                </span>
                <h2 className="mt-5 font-display text-3xl tracking-tight">Message received.</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                  Thanks for reaching out. I read every message and will reply as soon as I can.
                </p>
                <button type="button" onClick={() => setSent(false)} className="btn-outline mt-6">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow">Message</p>
                    <h2 className="mt-2 font-display text-3xl tracking-tight">Tell me more.</h2>
                  </div>
                  <span className="hidden items-center gap-1.5 text-xs text-muted sm:inline-flex">
                    <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                    Your details stay private
                  </span>
                </div>

                {contactDisabled ? (
                  <div className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-800 dark:text-amber-200">
                    The contact form is not connected in preview mode. Configure Supabase to start
                    receiving messages
                    {profile.email ? (
                      <>
                        , or email{' '}
                        <a href={`mailto:${profile.email}`} className="font-medium underline">
                          {profile.email}
                        </a>
                      </>
                    ) : null}
                    .
                  </div>
                ) : null}

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="field">
                    <label htmlFor="contact-name" className="field-label">
                      Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      autoComplete="name"
                      value={form.name}
                      onChange={(event) => update('name', event.target.value)}
                      className="input"
                      placeholder="Your name"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    />
                    {errors.name ? (
                      <p id="contact-name-error" className="text-xs text-red-600 dark:text-red-300">
                        {errors.name}
                      </p>
                    ) : null}
                  </div>
                  <div className="field">
                    <label htmlFor="contact-email" className="field-label">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(event) => update('email', event.target.value)}
                      className="input"
                      placeholder="you@example.com"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    />
                    {errors.email ? (
                      <p id="contact-email-error" className="text-xs text-red-600 dark:text-red-300">
                        {errors.email}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="field mt-5">
                  <label htmlFor="contact-subject" className="field-label">
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={form.subject}
                    onChange={(event) => update('subject', event.target.value)}
                    className="input"
                    placeholder="What is this about?"
                    aria-invalid={Boolean(errors.subject)}
                    aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                  />
                  {errors.subject ? (
                    <p id="contact-subject-error" className="text-xs text-red-600 dark:text-red-300">
                      {errors.subject}
                    </p>
                  ) : null}
                </div>

                <div className="field mt-5">
                  <label htmlFor="contact-message" className="field-label">
                    <span>Message</span>
                    <span className="font-normal normal-case tracking-normal text-muted">
                      {form.message.trim().length} characters
                    </span>
                  </label>
                  <textarea
                    id="contact-message"
                    value={form.message}
                    onChange={(event) => update('message', event.target.value)}
                    className="textarea"
                    placeholder="A little about the project, the role, or the question…"
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                  />
                  {errors.message ? (
                    <p id="contact-message-error" className="text-xs text-red-600 dark:text-red-300">
                      {errors.message}
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-relaxed text-muted">
                    I usually respond within a few days.
                  </p>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting || contactDisabled}
                  >
                    {submitting ? <InlineSpinner /> : <Send className="h-4 w-4" />}
                    {submitting ? 'Sending…' : 'Send message'}
                  </button>
                </div>
              </form>
            )}
          </Reveal>

          <Reveal delay={80} className="space-y-4">
            <div className="card p-6">
              <p className="eyebrow">Details</p>
              <dl className="mt-4 space-y-4">
                <div className="flex items-start gap-3 border-b border-line pb-4">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div className="min-w-0">
                    <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">Email</dt>
                    <dd className="mt-0.5 text-sm text-ink">
                      {profile.email ? (
                        <a href={`mailto:${profile.email}`} className="hover:text-accent">
                          {profile.email}
                        </a>
                      ) : (
                        <span className="text-muted">Available on request</span>
                      )}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3 border-b border-line pb-4">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">Location</dt>
                    <dd className="mt-0.5 text-sm text-ink">
                      {profile.location || 'Remote-friendly'}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">
                      Availability
                    </dt>
                    <dd className="mt-0.5 text-sm text-ink">
                      {profile.availability || 'Open to opportunities'}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="card p-6">
              <p className="eyebrow">Elsewhere</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Prefer another channel? These links go to the places I am most active.
              </p>
              <div className="mt-4">
                <SocialLinks profile={profile} showLabels />
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface2 p-6">
              <p className="font-display text-2xl leading-tight tracking-tight">
                Good conversations start with context.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                A sentence about what you are building, who it is for, and what you need help with
                is more useful than a long brief.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
