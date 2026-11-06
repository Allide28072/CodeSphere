import { useEffect, useRef } from 'react';
import { useSite } from '../context/SiteContext';

function describeError(error) {
  if (!error) {
    return 'Sample content is shown until Supabase is connected. Changes are disabled.';
  }

  const message = error.message || '';
  if (error.code === 'PGRST205' || message.includes('Could not find the table')) {
    return 'Supabase is connected, but the database tables are missing. Run supabase/schema.sql in the SQL editor.';
  }

  return 'Could not reach Supabase, so sample content is shown.';
}

export default function PreviewBanner() {
  const { isDemo, error, localMode } = useSite();
  const ref = useRef(null);

  useEffect(() => {
    if (isDemo && ref.current) {
      ref.current.scrollIntoView({ block: 'nearest' });
    }
  }, [isDemo]);

  if (!isDemo) return null;

  return (
    <div
      ref={ref}
      className="border-b border-accent/20 bg-accent-soft px-5 py-2 text-center text-[11px] text-accent"
    >
      <span className="font-mono uppercase tracking-[0.16em]">
        {localMode ? 'Local preview' : 'Preview mode'}
      </span>
      <span className="mx-2 text-accent/40">·</span>
      <span className="text-ink/70">
        {localMode
          ? 'Content changes are saved in this browser. Configure Supabase to publish them.'
          : describeError(error)}
      </span>
    </div>
  );
}
