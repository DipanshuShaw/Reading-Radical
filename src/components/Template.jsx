import React from 'react'
import "./../../books.json"

const Template = () => {



    return (
        <>
            {bookTest.map((book) => (
                <div class="explore-box" id="explore-box0">
                    <img src={book.imageLink} alt={book.title} />
                    <div>{book.title}</div>
                    <div className='text-lg font-lighter'>by {book.author}</div>
                    <div class="explore-box-button">
                        <button type="button">Read Review</button>
                        <button type="button">Write Review</button>
                    </div>
                </div>
            ))}
        </>
    )
}

export default Template
