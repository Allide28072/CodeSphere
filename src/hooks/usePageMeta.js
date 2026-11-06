import { useEffect } from 'react';

const BASE_TITLE = 'Allide’ Ru.Ju.Gi.Ra — Web & Software Developer';

export default function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} — Allide’ Ru.Ju.Gi.Ra` : BASE_TITLE;

    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', description);
    }
  }, [title, description]);
}
