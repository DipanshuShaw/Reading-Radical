import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ReadReview = () => {
  const { id } = useParams(); // Get book ID from URL
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Fetch reviews for the book by ID
        const response = await fetch(`http://localhost:5000/api/book/${id}/reviews`);
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError(error.message); // Set error message
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  if (loading) return <p className="text-center mt-8 text-xl text-gray-600">Loading reviews...</p>;
  if (error) return <p className="text-center mt-8 text-xl text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
        Reviews for Book ID: {id}
      </h1>
      {reviews.length === 0 ? (
        <p className="text-center text-lg text-gray-500">No reviews found for this book.</p>
      ) : (
        <ul className="space-y-6">
          {reviews.map((review, index) => (
            <li key={index} className="bg-gray-50 p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition duration-300 ease-in-out">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <span className="text-indigo-600 font-semibold">{review.reviewer}</span>
                </div>
                <div className="flex-grow">
                  <p className="text-gray-700">{review.comment}</p>
                  <p className="mt-2 text-yellow-500 font-semibold">Rating: {review.rating} / 5</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReadReview;
