import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import BookCover from './BookCover';
import Stars from './Stars';

const BookDetail = ({ book }) => {
  const { pathname } = useLocation();
  const onWritePage = pathname.endsWith('/write-review');

  return (
    <section className="bg-white rounded-3xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-8 overflow-hidden">
      <BookCover
        src={book.cover_image}
        title={book.title}
        author={book.author}
        className="w-full md:w-64 h-80 md:h-96 rounded-2xl shadow-md shrink-0 overflow-hidden"
      />
      <div className="text-left flex flex-col min-w-0 flex-1">
        <span className="self-start text-xs uppercase tracking-wide font-semibold text-white bg-indigo-500 rounded-full px-3 py-1">
          {book.genre || 'Uncategorised'}
        </span>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold font-serif text-indigo-900">{book.title}</h1>
        <p className="text-lg md:text-xl text-gray-600 mt-1">by {book.author}</p>

        <div className="mt-3 flex items-center gap-2 text-gray-600">
          {Number(book.review_count) > 0 ? (
            <>
              <Stars value={Number(book.avg_rating)} size="text-2xl" />
              <span>{Number(book.avg_rating).toFixed(1)} / 5 · {book.review_count} review{book.review_count > 1 ? 's' : ''}</span>
            </>
          ) : (
            <span className="text-gray-400">No ratings yet — be the first!</span>
          )}
        </div>

        <h2 className="mt-6 text-xl font-semibold text-brand">About the Book</h2>
        <p className="mt-2 text-gray-800 leading-relaxed">
          {book.description || 'No description available for this book.'}
        </p>

        <div className="mt-auto pt-6">
          <Link
            to={`/books/${book.book_id}/${onWritePage ? 'reviews' : 'write-review'}`}
            className="inline-block bg-brand text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-dark transition no-underline"
          >
            {onWritePage ? 'Read Reviews' : 'Write a Review'}
          </Link>
        </div>
      </div>
    </section>
  );
};

BookDetail.propTypes = {
  book: PropTypes.shape({
    book_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    description: PropTypes.string,
    cover_image: PropTypes.string,
    genre: PropTypes.string,
    avg_rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    review_count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

export default BookDetail;
