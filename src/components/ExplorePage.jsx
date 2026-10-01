import { useEffect, useMemo, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../api';
import { GENRES } from '../config';
import BookCard from './BookCard';

const ExplorePage = () => {
  const { slug } = useParams();
  const current = GENRES.find((g) => g.slug === slug);
  const [books, setBooks] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!current) return;
    let cancelled = false;
    setStatus('loading');
    setQuery('');
    api(`/api/books${current.genre ? `?genre=${encodeURIComponent(current.genre)}` : ''}`)
      .then((data) => { if (!cancelled) { setBooks(data); setStatus('ready'); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setStatus('error'); } });
    return () => { cancelled = true; };
  }, [current]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  }, [books, query]);

  if (!current) return <Navigate to="/explore/all" replace />;

  return (
    <section className="fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold text-left font-display text-ink">
          {current.label} <span className="text-brand">Books</span>
        </h1>
        <label className="relative block w-full sm:w-72">
          <span className="sr-only">Search books</span>
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or author…"
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </label>
      </div>

      {status === 'loading' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-[28rem] rounded-2xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 p-6" role="alert">
          <p className="font-semibold">Couldn&apos;t load books</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {status === 'ready' && shown.length === 0 && (
        <p className="text-gray-500 py-16">
          {query ? `No books match “${query}”.` : `No ${current.label} books found.`}
        </p>
      )}

      {status === 'ready' && shown.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {shown.map((b) => <BookCard key={b.book_id} book={b} />)}
        </div>
      )}
    </section>
  );
};

export default ExplorePage;
