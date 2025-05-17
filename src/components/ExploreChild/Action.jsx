import React, { useEffect, useState } from 'react';
import Template from '../template';
// import Template from '../Template'; // ensure correct path


const Action = () => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/books?genre=Action')
            .then(res => res.json())
            .then(data => setBooks(data))
            .catch(err => console.error('Error fetching action books:', err));
    }, []);

    return (
        <section className="explore-Action p-6 min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {books.length > 0 ? (
                    books.map(book => (
                        <Template key={book.book_id} book={book} />
                    ))
                ) : (
                    <p className="text-center col-span-full">No Action books found.</p>
                )}
            </div>
        </section>
    );
};

export default Action;
