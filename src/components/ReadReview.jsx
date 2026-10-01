import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import BookDetail from './BookDetail';
import Stars from './Stars';

const ReadReview = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all([api(`/api/books/${id}`), api(`/api/books/${id}/reviews`)])
      .then(([b, r]) => { if (!cancelled) { setBook(b); setReviews(r); } })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <p className="text-center mt-16 text-xl text-gray-600">Loading…</p>;
  if (error) return <p className="text-center mt-16 text-xl text-red-600" role="alert">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-up">
      <BookDetail book={book} />

      <h2 className="text-3xl font-bold text-indigo-800 mt-12 mb-6 pb-3 border-b-4 border-indigo-700 text-center">
        Reviews
      </h2>

      {reviews.length === 0 ? (
        <p className="text-center text-gray-500 text-lg py-8">No reviews yet. Be the first to write one!</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 list-none p-0 m-0 text-left">
          {reviews.map((r, i) => (
            <li key={i} className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-lg font-semibold text-gray-900">{r.reviewer}</p>
              <div className="flex items-center gap-2 mt-1">
                <Stars value={r.rating} size="text-xl" />
                <span className="text-sm text-gray-500">{r.rating}/5</span>
              </div>
              <p className="text-gray-700 mt-2 whitespace-pre-line break-words">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReadReview;
