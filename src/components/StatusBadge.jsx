import { statusLabel } from '../lib/format';

const STYLES = {
  completed: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  'in-progress': 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  planned: 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300',
};

export default function StatusBadge({ status, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] ${
        STYLES[status] || STYLES.planned
      } ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabel(status)}
    </span>
  );
}
