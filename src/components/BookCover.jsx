import { useState } from 'react';
import PropTypes from 'prop-types';

// A deterministic gradient per title, used when a book has no (or a broken) cover image.
const GRADIENTS = [
  ['#e9027d', '#6d28d9'], ['#0ea5e9', '#4f46e5'], ['#f59e0b', '#dc2626'],
  ['#10b981', '#0369a1'], ['#ec4899', '#f97316'], ['#8b5cf6', '#ec4899'],
];

const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

const BookCover = ({ src, title, author, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const usable = src && /^(https?:)?\/\//.test(src) && !failed;

  if (usable) {
    return (
      <img
        src={src}
        alt={`Cover of ${title}`}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`object-cover ${className}`}
      />
    );
  }

  const [a, b] = GRADIENTS[hash(title) % GRADIENTS.length];
  return (
    <div
      role="img"
      aria-label={`Cover of ${title}`}
      className={`flex flex-col items-center justify-center text-center text-white p-4 ${className}`}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
    >
      <span className="font-display text-xl sm:text-2xl leading-tight drop-shadow">{title}</span>
      {author && <span className="mt-2 text-xs sm:text-sm opacity-90">{author}</span>}
    </div>
  );
};

BookCover.propTypes = {
  src: PropTypes.string,
  title: PropTypes.string.isRequired,
  author: PropTypes.string,
  className: PropTypes.string,
};

export default BookCover;
