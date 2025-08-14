import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Template2 from './Template2';

const WriteReview = () => {
  const { id } = useParams(); // book_id from URL
  const [book, setBook] = useState(null);
  const [reviewer, setReviewer] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // ✅ Fetch book details
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/books/${id}`);
        if (!res.ok) throw new Error('Failed to fetch book details');
        const data = await res.json();
        setBook(data);
      } catch (err) {
        console.error(err.message);
        setError('Could not load book details.');
      }
    };
    fetchBook();
  }, [id]);

  // ✅ Handle review submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const review = {
      book_id: id,
      reviewer,
      comment,
      rating,
    };

    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(review),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      setMessage(data.message);
      setReviewer('');
      setComment('');
      setRating(5);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setMessage('Error submitting review.');
    }
  };

  return (
    <div className=" mx-auto p-4 my-12">
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {book && <Template2 book={book} />}

      <h2 className="text-5xl mt-16 font-bold border-b-4 border-indigo-700 text-indigo-700 mb-6 pb-4 text-center">Write A Review</h2>
      <form onSubmit={handleSubmit} className='w-1/2 mx-auto'>
        <input
          type="text"
          placeholder="Your Name"
          className="w-full border p-2 mb-4 rounded"
          value={reviewer}
          onChange={(e) => setReviewer(e.target.value)}
          required
        />
        <textarea
          className="w-full border p-2 mb-4 rounded"
          placeholder="Write your review..."
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
        <div className="mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-3xl focus:outline-none ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              aria-label={`${star} Star${star > 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Review
        </button>
      </form>

      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
};

export default WriteReview;
 