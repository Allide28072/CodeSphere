import { useState } from 'react';
import { X } from 'lucide-react';

export default function TagInput({
  value = [],
  onChange,
  placeholder = 'Type and press Enter',
  id,
  ariaLabel,
}) {
  const [draft, setDraft] = useState('');

  function addTags(raw) {
    const incoming = raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (!incoming.length) return;
    const next = [...value];
    incoming.forEach((item) => {
      if (!next.some((existing) => existing.toLowerCase() === item.toLowerCase())) {
        next.push(item);
      }
    });
    onChange(next);
    setDraft('');
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTags(draft);
    } else if (event.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div
      className="flex min-h-[46px] w-full flex-wrap items-center gap-1.5 rounded-xl border border-line bg-surface px-2.5 py-2 transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20"
    >
      {value.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-1 rounded-full border border-line bg-surface2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink"
        >
          {item}
          <button
            type="button"
            onClick={() => onChange(value.filter((existing) => existing !== item))}
            className="text-muted transition-colors hover:text-accent"
            aria-label={`Remove ${item}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTags(draft)}
        onPaste={(event) => {
          const text = event.clipboardData.getData('text');
          if (text.includes(',')) {
            event.preventDefault();
            addTags(text);
          }
        }}
        placeholder={value.length ? '' : placeholder}
        className="min-w-[110px] flex-1 bg-transparent px-1.5 py-1 text-sm text-ink outline-none placeholder:text-muted/60"
        aria-label={ariaLabel}
      />
    </div>
  );
}
