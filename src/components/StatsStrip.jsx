import { useEffect, useState } from 'react';
import { api } from '../api';

// Live numbers from the database. Renders nothing if the API is unavailable.
const StatsStrip = () => {
  const [s, setS] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api('/api/stats').then((d) => { if (!cancelled) setS(d); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!s) return null;
  const items = [
    ['Books', s.books],
    ['Genres', s.genres],
    ['Reviews', s.reviews],
    ['Readers', s.readers],
  ];

  return (
    <section className="bg-neutral-900 text-white">
      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {items.map(([label, n]) => (
          <div key={label}>
            <p className="font-display text-4xl text-brand">{Number(n).toLocaleString()}</p>
            <p className="text-sm uppercase tracking-wider text-gray-300 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsStrip;
