import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';

const Template2 = ({ book }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current URL path

  const handleWriteReview = () => {
    navigate(`/books/${book.book_id}/write-review`);
  };

  const handleReadReview = () => {
    navigate(`/books/${book.book_id}/reviews`);
  };

  const isWriteReviewPage = location.pathname.includes('/write-review');

  return (
    <div className="flex flex-col md:flex-row h-[40rem] rounded-2xl overflow-hidden p-6 border-4 border-amber-50 shadow-2xl bg-white">
      {/* Book Image */}
      <img
        className="w-full md:w-1/3 object-contain rounded-xl shadow-md"
        src={book.cover_image || "https://via.placeholder.com/300x400"}
        alt={book.title}
      />

      {/* Book Details */}
      <div className="mt-6 md:mt-0 md:ml-8 w-full md:w-2/3 space-y-4">
        <h2 className="text-4xl font-bold font-serif text-blue-800">{book.title}</h2>
        <p className="text-2xl text-gray-600 font-mono">by {book.author}</p>

        {/* Genre */}
        <div className="text-sm text-white inline-block px-3 py-1 bg-indigo-500 rounded-full">
          Genre: {book.genre || 'Not specified'}
        </div>

        {/* About the Book */}
        <div className="mt-4">
          <h3 className="text-2xl font-semibold text-pink-700 mb-2">About the Book</h3>
          <p className="text-gray-800 leading-relaxed text-lg">
            {book.description || "No description available for this book."}
          </p>
        </div>

        {/* Conditional Button */}
        {isWriteReviewPage ? (
          <button
            onClick={handleReadReview}
            className="bg-pink-600 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-pink-700 transition duration-300 mt-6"
          >
            Read Reviews
          </button>
        ) : (
          <button
            onClick={handleWriteReview}
            className="bg-pink-600 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-pink-700 transition duration-300 mt-6"
          >
            Write a Review
          </button>
        )}
      </div>
    </div>
  );
};

Template2.propTypes = {
  book: PropTypes.shape({
    book_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    description: PropTypes.string,
    cover_image: PropTypes.string,
    genre: PropTypes.string,
  }).isRequired,
};

export default Template2;
