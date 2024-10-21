import React from 'react'
import secImg1 from '../Images/reviewers-sec1-pic.jpg'
import secImg2 from '../Images/reviewers-sec2-pic.jpg'

const Reviewer = () => {
  return (
    <>
      <section className="review-sec1">
        <div id="review-container">
            <h1 className="review-head">Get Started as A Reviewer</h1>
            <div className="review-text">
                Embrace your love for books and become a vital part of our literary community! Share your unique
                perspective by writing book reviews on our website. Whether you're a seasoned critic or a casual reader, your opinions matter. Dive into the world of storytelling, express how a book made you feel, and help fellow readers discover their next favorite read. Join us in sparking literary discussions and connecting with book enthusiasts worldwide.
            </div>
            <div className="review-button">
                <button type="button">Become A Reviewer</button>
            </div>
        </div>
        <img src={secImg1} alt=""/>
    </section>
    <section className="review-sec2">
        <div id="review-container">
            <h1 className="review-head">Give your Own Take</h1>
            <div className="review-text">
                Passionate about books? Share your thoughts! Contribute to our book-loving community by writing a quick review for your favorite reads on our website. Your insights matter, and your reviews help fellow bookworms discover new treasures. Dive into the world of literature and let your voice be heard. Start reviewing today!
            </div>
            <div className="review-button">
                <button type="button">Write A Review</button>
            </div>
        </div>
        <img src={secImg2} alt=""/>
    </section>
    </>
  )
}

export default Reviewer
