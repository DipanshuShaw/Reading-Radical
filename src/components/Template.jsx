// import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const Template = ({ book }) => {
    const navigate = useNavigate();

    const handleWriteReview = () => {
        navigate(`/books/${book.book_id}/write-review`);
    };

    const handleReadReview = () => {
        navigate(`/books/${book.book_id}/reviews`);
    };

    return (
        <div className="max-w-sm rounded-2xl overflow-hidden h-[35rem] shadow-lg bg-white p-4">
            <img
                className="w-full h-96 object-contain rounded-xl"
                src={book.cover_image || "https://via.placeholder.com/300x400"}
                alt={book.title}
            />
            <div className="mt-4">
                <h2 className="text-xl font-semibold text-gray-800">{book.title}</h2>
                <p className="text-gray-600 text-sm mt-1">by {book.author}</p>
                <div className="mt-4 flex justify-between">
                    <button
                        onClick={handleWriteReview}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                    >
                        Write Review
                    </button>
                    <button
                        onClick={handleReadReview}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
                    >
                        Read Review
                    </button>
                </div>
            </div>
        </div>
    );
};

Template.propTypes = {
    book: PropTypes.shape({
        book_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        author: PropTypes.string.isRequired,
        description: PropTypes.string,
        cover_image: PropTypes.string,
        genre: PropTypes.string,
    }).isRequired,
};

export default Template;
