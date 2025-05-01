// import React from 'react'
import secImg1 from '../Images/reviewers-sec1-pic.jpg'
import secImg2 from '../Images/reviewers-sec2-pic.jpg'

const Reviewer = () => {
  return (
    <>
      {/* Section 1 */}
      <section className="relative w-full h-[500px] md:h-[700px] text-white">
        <img
          src={secImg1}
          alt="Reviewer 1"
          className="absolute inset-0 w-full h-full object-cover brightness-50"
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 md:px-20">
          <h1 className="text-3xl md:text-5xl font-bold text-pink-500 mb-4">Get Started as A Reviewer</h1>
          <p className="text-base md:text-lg max-w-3xl">
            Embrace your love for books and become a vital part of our literary community! Share your unique
            perspective by writing book reviews on our website. Whether you&apos;re a seasoned critic or a casual reader, your opinions matter.
          </p>
          <button className="mt-6 bg-pink-600 hover:bg-pink-700 px-6 py-2 rounded text-white font-semibold">
            Become A Reviewer
          </button>
        </div>
      </section>

      {/* Section 2 */}
      <section className="relative w-full h-[500px] md:h-[700px] text-white">
        <img
          src={secImg2}
          alt="Reviewer 2"
          className="absolute inset-0 w-full h-full object-cover brightness-50"
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 md:px-20">
          <h1 className="text-3xl md:text-5xl font-bold text-blue-400 mb-4">Give Your Own Take</h1>
          <p className="text-base md:text-lg max-w-3xl">
            Passionate about books? Share your thoughts! Contribute to our book-loving community by writing a quick review for your favorite reads. Your insights help fellow bookworms discover new treasures.
          </p>
          <button className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white font-semibold">
            Write A Review
          </button>
        </div>
      </section>
    </>
  )
}

export default Reviewer
