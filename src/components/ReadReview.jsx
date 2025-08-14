import  { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import Template from './template';/
import Template2 from './Template2';

const ReadReview = () => {
  const { id } = useParams(); // book ID from URL
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookAndReviews = async () => {
      try {
        const [bookRes, reviewsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/books/${id}`),
          fetch(`http://localhost:5000/api/book/${id}/reviews`)
        ]);

        if (!bookRes.ok) throw new Error('Failed to fetch book details');
        if (!reviewsRes.ok) throw new Error('Failed to fetch reviews');

        const bookData = await bookRes.json();
        const reviewsData = await reviewsRes.json();

        setBook(bookData);
        setReviews(reviewsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookAndReviews();
  }, [id]);

  if (loading) return <p className="text-center mt-8 text-xl text-gray-600">Loading...</p>;
  if (error) return <p className="text-center mt-8 text-xl text-red-600">{error}</p>;

  return (
    <div className="mx-auto p-6 mt-10 rounded-lg shadow-md">
      <div className="w-full mb-8">
        <Template2 book={book} />
      </div>

      <h2 className="text-5xl font-bold border-b-4 border-indigo-700 text-indigo-700 mb-6 pb-4 text-center">Reviews</h2>
      <div className="w-full">
        {reviews.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No reviews found for this book.</p>
        ) : (
          <ul className="gap-4 text-left grid grid-cols-2">
            {reviews.map((review, index) => (
              <li
                key={index}
                className="p-4 rounded"
              >
                <p className="text-black text-3xl font-medium">{review.reviewer}</p>
                <div className="text-xl space-x-1 text-yellow-500">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className='text-2xl'>{i < review.rating ? '★' : '☆'}</span>
                  ))}
                  &nbsp;<span className='font-mono'> Rating - {review.rating}/5</span>
                </div>
                <p className="text-gray-800 mt-1">{review.comment}</p>
              </li>
            ))}
          </ul>

        )}
      </div>

    </div>
  );
};

export default ReadReview;
