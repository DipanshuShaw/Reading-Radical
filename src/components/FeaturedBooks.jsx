import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import BookCard from './BookCard';

// Top-rated books (falls back to A-Z until reviews exist). Hidden if the API fails.
const FeaturedBooks = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api('/api/books?sort=top&limit=4').then((d) => { if (!cancelled) setBooks(d); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!books.length) return null;
  const anyRated = books.some((b) => Number(b.review_count) > 0);

  return (
    <section className="max-w-6xl mx-auto px-6 py-14">
      <div className="flex items-end justify-between gap-4 mb-8">
        <h2 className="font-display text-3xl md:text-4xl text-left">
          {anyRated ? 'Top rated' : 'Featured'} <span className="text-brand">reads</span>
        </h2>
        <Link to="/explore/all" className="text-brand font-semibold no-underline hover:underline whitespace-nowrap">View all →</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {books.map((b) => <BookCard key={b.book_id} book={b} />)}
      </div>
    </section>
  );
};

export default FeaturedBooks;
