import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import BookCover from './BookCover';
import Stars from './Stars';

const BookCard = ({ book }) => (
  <article className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
    <Link to={`/books/${book.book_id}/reviews`} className="block overflow-hidden bg-gray-100" aria-label={`Read reviews of ${book.title}`}>
      <BookCover
        src={book.cover_image}
        title={book.title}
        author={book.author}
        className="w-full h-72 group-hover:scale-105 transition-transform duration-500"
      />
    </Link>
    <div className="p-4 flex flex-col flex-1">
      <span className="self-start text-[11px] uppercase tracking-wide font-semibold text-brand bg-pink-50 rounded-full px-2 py-0.5">
        {book.genre}
      </span>
      <h3 className="mt-2 text-lg font-semibold text-gray-900 leading-snug line-clamp-2">{book.title}</h3>
      <p className="text-gray-500 text-sm mt-0.5">by {book.author}</p>
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 min-h-6">
        {book.review_count > 0 ? (
          <>
            <Stars value={Number(book.avg_rating)} size="text-base" />
            <span>{Number(book.avg_rating).toFixed(1)} ({book.review_count})</span>
          </>
        ) : (
          <span className="text-gray-400">No reviews yet</span>
        )}
      </div>
      <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
        <Link
          to={`/books/${book.book_id}/write-review`}
          className="text-center bg-brand text-white text-sm font-semibold py-2 rounded-xl hover:bg-brand-dark transition no-underline"
        >
          Write Review
        </Link>
        <Link
          to={`/books/${book.book_id}/reviews`}
          className="text-center border border-gray-300 text-gray-700 text-sm font-semibold py-2 rounded-xl hover:bg-gray-100 transition no-underline"
        >
          Read Reviews
        </Link>
      </div>
    </div>
  </article>
);

BookCard.propTypes = {
  book: PropTypes.shape({
    book_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    cover_image: PropTypes.string,
    genre: PropTypes.string,
    avg_rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    review_count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

export default BookCard;
