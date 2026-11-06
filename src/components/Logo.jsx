import { Link } from 'react-router-dom';

export default function Logo({ to = '/', onClick, compact = false }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="group inline-flex flex-col leading-none"
      aria-label="Allide’ Ru.Ju.Gi.Ra — home"
    >
      <span
        className={`logo-allide font-fantasy font-bold tracking-[0.01em] ${
          compact ? 'text-[1.02rem]' : 'text-[1.35rem]'
        }`}
      >
        Allide’
      </span>
      <span
        className={`logo-rujugira font-fantasy font-bold uppercase ${
          compact ? 'mt-1 text-[7px] tracking-[0.24em]' : 'mt-1.5 text-[9px] tracking-[0.3em]'
        }`}
      >
        Ru.Ju.Gi.Ra
      </span>
    </Link>
  );
}
