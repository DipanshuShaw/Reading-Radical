import  { useEffect, useState } from 'react';
import Template from '../template'; // Adjust path if needed

const Romance = () => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/books?genre=Romance')
            .then(res => res.json())
            .then(data => setBooks(data))
            .catch(err => console.error('Error fetching Romance books:', err));
    }, []);

    return (
        <section className="explore-romance p-6 min-h-screen">
            {/* <h2 className="text-2xl font-bold mb-4">Romance Books</h2> */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {books.length > 0 ? (
                    books.map(book => (
                        <Template key={book.book_id} book={book} />
                    ))
                ) : (
                    <p className="text-center col-span-full">No Romance books found.</p>
                )}
            </div>
        </section>
    );
};

export default Romance;
