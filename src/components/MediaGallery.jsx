import { useEffect, useState } from 'react';
import { Play, X } from 'lucide-react';

export default function MediaGallery({ media = [], title = 'Project media' }) {
  const [active, setActive] = useState(null);
  const items = media.filter((item) => item?.url);

  useEffect(() => {
    if (!active) return undefined;

    function onKeyDown(event) {
      if (event.key === 'Escape') setActive(null);
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [active]);

  if (!items.length) return null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const isVideo = item.media_type === 'video';
          return (
            <button
              key={item.id || item.url}
              type="button"
              onClick={() => setActive(item)}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-surface2 text-left"
              aria-label={`Open ${isVideo ? 'video' : 'image'} ${index + 1} of ${items.length}`}
            >
              {isVideo ? (
                <>
                  <video
                    src={item.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-black/20">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md">
                      <Play className="ml-0.5 h-5 w-5" />
                    </span>
                  </span>
                </>
              ) : (
                <img
                  src={item.url}
                  alt={item.alt_text || `${title} — image ${index + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              )}
              <span className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-8 font-mono text-[9px] uppercase tracking-[0.14em] text-white/85">
                <span>{isVideo ? 'Video' : 'Image'}</span>
                <span>
                  {String(index + 1).padStart(2, '0')}/{String(items.length).padStart(2, '0')}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Media preview"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="max-h-[88vh] w-full max-w-5xl animate-scale-in overflow-hidden rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {active.media_type === 'video' ? (
              <video
                src={active.url}
                controls
                autoPlay
                playsInline
                className="max-h-[88vh] w-full bg-black"
              >
                Your browser does not support this video.
              </video>
            ) : (
              <img
                src={active.url}
                alt={active.alt_text || `${title} preview`}
                className="max-h-[88vh] w-full object-contain"
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
