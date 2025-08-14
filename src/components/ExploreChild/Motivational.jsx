import  { useEffect, useState } from 'react';
import Template from '../template'; // adjust path if needed

const Motivational = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/books?genre=Motivational')
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error('Error fetching Motivational books:', err));
  }, []);

  return (
    <section className="explore-motivational p-6 min-h-screen">
      {/* <h2 className="text-2xl font-bold mb-4">Motivational Books</h2> */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {books.length > 0 ? (
          books.map(book => (
            <Template key={book.book_id} book={book} />
          ))
        ) : (
          <p className="text-center col-span-full">No Motivational books found.</p>
        )}
      </div>
    </section>
  );
};

export default Motivational;
