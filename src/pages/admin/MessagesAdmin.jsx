import { useCallback, useEffect, useMemo, useState } from 'react';
import { Inbox, Mail, MailOpen, RefreshCw, Reply, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import usePageMeta from '../../hooks/usePageMeta';
import AdminHeader from '../../components/admin/AdminHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import Loader, { InlineSpinner } from '../../components/Loader';
import { deleteMessage, fetchMessages, setMessageRead } from '../../lib/adminApi';
import { formatDate } from '../../lib/format';

export default function MessagesAdmin() {
  usePageMeta('Messages');
  const { push } = useToast();

  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const nextMessages = await fetchMessages();
      setMessages(nextMessages);
      setSelectedId((current) =>
        current && nextMessages.some((message) => message.id === current) ? current : null
      );
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

  const selected = messages.find((message) => message.id === selectedId) || null;
  const unreadCount = useMemo(
    () => messages.filter((message) => !message.is_read).length,
    [messages]
  );

  async function toggleRead(message) {
    const nextRead = !message.is_read;
    setBusyId(message.id);
    try {
      await setMessageRead(message.id, nextRead);
      setMessages((current) =>
        current.map((item) =>
          item.id === message.id ? { ...item, is_read: nextRead } : item
        )
      );
      push({
        type: 'success',
        title: nextRead ? 'Marked as read' : 'Marked as unread',
        message: nextRead
          ? 'This message has been added to the read pile.'
          : 'This message will show as unread again.',
      });
    } catch (toggleError) {
      push({
        type: 'error',
        title: 'Could not update message',
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
      await deleteMessage(pendingDelete.id);
      setMessages((current) => current.filter((message) => message.id !== pendingDelete.id));
      if (selectedId === pendingDelete.id) setSelectedId(null);
      push({
        type: 'success',
        title: 'Message deleted',
        message: `The message from ${pendingDelete.name} was removed.`,
      });
      setPendingDelete(null);
    } catch (deleteError) {
      push({
        type: 'error',
        title: 'Could not delete message',
        message: deleteError.message || 'Please try again.',
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        eyebrow="Inbox"
        title="Messages"
        description="Enquiries sent through the contact form. Open a message to read it in full."
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
          <p>Could not load messages: {error.message}</p>
          <button type="button" onClick={() => load()} className="btn-outline btn-sm shrink-0">
            Try again
          </button>
        </div>
      ) : null}

      {loading ? (
        <Loader label="Loading messages" />
      ) : error ? null : messages.length ? (
        <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-line bg-surface2/60 px-4 py-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                {messages.length} {messages.length === 1 ? 'message' : 'messages'}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
                {unreadCount} unread
              </span>
            </div>
            <ul className="max-h-[65vh] divide-y divide-line overflow-y-auto">
              {messages.map((message) => {
                const active = message.id === selectedId;
                return (
                  <li key={message.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(message.id)}
                      className={`flex w-full items-start gap-3 px-4 py-4 text-left transition-colors ${
                        active ? 'bg-accent-soft/60' : 'hover:bg-surface2/60'
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          message.is_read ? 'bg-line' : 'bg-accent'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span
                            className={`truncate text-sm ${
                              message.is_read ? 'text-ink' : 'font-semibold text-ink'
                            }`}
                          >
                            {message.name}
                          </span>
                          <span className="shrink-0 font-mono text-[9px] text-muted">
                            {formatDate(message.created_at)}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs font-medium text-ink">
                          {message.subject || 'No subject'}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted">
                          {message.message}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {selected ? (
            <section className="card overflow-hidden">
              <div className="border-b border-line px-5 py-4 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="eyebrow">{selected.is_read ? 'Read' : 'Unread'}</p>
                    <h2 className="mt-1 font-display text-3xl leading-tight tracking-tight">
                      {selected.subject || 'No subject'}
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      From <span className="text-ink">{selected.name}</span> ·{' '}
                      <a href={`mailto:${selected.email}`} className="hover:text-accent">
                        {selected.email}
                      </a>
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                      {formatDate(selected.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleRead(selected)}
                      className="btn-outline btn-sm"
                      disabled={busyId === selected.id}
                    >
                      {busyId === selected.id ? (
                        <InlineSpinner />
                      ) : selected.is_read ? (
                        <Mail className="h-3.5 w-3.5" />
                      ) : (
                        <MailOpen className="h-3.5 w-3.5" />
                      )}
                      {selected.is_read ? 'Mark unread' : 'Mark read'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(selected)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300"
                      aria-label="Delete message"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-5 py-5 sm:px-6">
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
                  {selected.message}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-4 sm:px-6">
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(
                    `Re: ${selected.subject || 'Your message'}`
                  )}`}
                  className="btn-primary btn-sm"
                >
                  <Reply className="h-3.5 w-3.5" />
                  Reply by email
                </a>
                <button
                  type="button"
                  onClick={() => toggleRead(selected)}
                  className="btn-ghost btn-sm"
                  disabled={busyId === selected.id}
                >
                  <Mail className="h-3.5 w-3.5" />
                  Toggle read
                </button>
              </div>
            </section>
          ) : (
            <EmptyState
              icon={Mail}
              title="Select a message."
              description="Choose a message from the list to read it here."
              className="lg:min-h-[24rem]"
            />
          )}
        </div>
      ) : (
        <EmptyState
          icon={Inbox}
          title="No messages yet."
          description="Messages sent through the contact form will appear here."
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this message?"
        description={
          pendingDelete
            ? `The message from ${pendingDelete.name} (${pendingDelete.email}) will be permanently deleted.`
            : ''
        }
        confirmLabel="Delete message"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
      />
    </div>
  );
}
