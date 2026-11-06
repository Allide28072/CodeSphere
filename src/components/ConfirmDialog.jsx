import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { InlineSpinner } from './Loader';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  busy = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape' && !busy) onCancel?.();
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={() => {
        if (!busy) onCancel?.();
      }}
    >
      <div
        className="w-full max-w-md animate-scale-in rounded-2xl border border-line bg-surface p-6 shadow-lift"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-300">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h2 id="confirm-title" className="font-display text-2xl tracking-tight">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
            ) : null}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn-outline btn-sm" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button type="button" className="btn-danger btn-sm" onClick={onConfirm} disabled={busy}>
            {busy ? <InlineSpinner /> : null}
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
