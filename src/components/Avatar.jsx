import { profile } from '../data/content';

const initials = profile.name
  .split(/\s+/)
  .map((word) => word[0])
  .join('')
  .toUpperCase();

/**
 * The profile picture, wherever it appears. While `profile.photo` is empty (no photo chosen yet), a plain
 * placeholder with the initials is shown instead. It is an SVG so it scales to any size it is given.
 * To use a photo again: put the file in public/assets/ and set `photo` in src/data/content.js.
 */
export default function Avatar({ className = 'w-full h-full', alt = '', imgClassName = 'object-cover' }) {
  if (profile.photo) return <img src={profile.photo} alt={alt} className={`${className} ${imgClassName}`} />;
  return (
    <svg viewBox="0 0 100 100" role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true} className={`${className} bg-surface-2 text-subtle`}>
      <text x="50" y="52" textAnchor="middle" dominantBaseline="middle" fontSize="34" fontWeight="800" letterSpacing="1" fill="currentColor">
        {initials}
      </text>
    </svg>
  );
}
