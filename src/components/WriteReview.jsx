import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { AuthContext } from '../context/AuthContext';
import BookDetail from './BookDetail';
import StarPicker from './StarPicker';

const WriteReview = () => {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const [book, setBook] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill name for logged-in users.
  useEffect(() => { if (user?.name) setReviewer(user.name); }, [user]);

  useEffect(() => {
    let cancelled = false;
    api(`/api/books/${id}`)
      .then((b) => { if (!cancelled) setBook(b); })
      .catch((e) => { if (!cancelled) setLoadError(e.message); });
    return () => { cancelled = true; };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/api/reviews', { method: 'POST', token, body: { book_id: Number(id), reviewer, comment, rating } });
      setDone(true);
      setComment('');
      setRating(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const field = 'w-full border border-gray-300 bg-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-up">
      {loadError && <p className="text-red-600 mb-4" role="alert">{loadError}</p>}
      {book && <BookDetail book={book} />}

      <h2 className="text-3xl font-bold text-indigo-800 mt-12 mb-6 pb-3 border-b-4 border-indigo-700 text-center">
        Write a Review
      </h2>

      {done ? (
        <div className="max-w-xl mx-auto bg-green-50 border border-green-200 rounded-2xl p-8 text-center" role="status">
          <p className="text-xl font-semibold text-green-800">Thanks — your review is live!</p>
          <div className="mt-5 flex justify-center gap-3">
            <Link to={`/books/${id}/reviews`} className="bg-brand text-white px-5 py-2 rounded-xl font-semibold no-underline hover:bg-brand-dark">
              See all reviews
            </Link>
            <button onClick={() => setDone(false)} className="border border-gray-300 px-5 py-2 rounded-xl font-semibold hover:bg-white">
              Write another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm p-6 text-left space-y-5">
          <div>
            <label htmlFor="reviewer" className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
            <input id="reviewer" className={field} value={reviewer} maxLength={100} required
              onChange={(e) => setReviewer(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1">Your rating</span>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Your review</label>
            <textarea id="comment" className={field} rows={5} maxLength={2000} required value={comment}
              onChange={(e) => setComment(e.target.value)} placeholder="What did you think of this book?" />
            <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/2000</p>
          </div>
          {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}
          <button type="submit" disabled={busy}
            className="w-full bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-dark transition disabled:opacity-60">
            {busy ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      )}
    </div>
  );
};

export default WriteReview;
