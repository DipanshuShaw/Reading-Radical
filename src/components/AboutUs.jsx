// import React from 'react'
import about1 from '../Images/RR about pic1.jpeg'
import about2 from '../Images/RR about pic2.jpeg'
import about3 from '../Images/RR about pic3.jpeg'
import about4 from '../Images/RR about pic4.jpeg'
import about5 from '../Images/RR about pic5.jpeg'

const AboutUs = () => {
  return (
    <>
      <div className="max-[800px]:hidden">
      <section className="about-container" id="about-sec1">
        <div className="about-container-text"><span>Unlock Literary Worlds:</span> Dive into our book reviews, where every page-turner finds its perfect match! Over 100,000 Bookworms Served, forming a thriving community of readers who trust our insights to guide their literary journeys.</div>
        <img src={about1} alt=""/>
    </section>
    <section className="about-container" id="about-sec2">
        <img src={about2} alt=""/>
        <div className="about-container-text"><span>Book Lovers&apos; Haven:</span> Elevate your reading experience with our insightful reviews—because every story deserves a spotlight. Boasting 1 Million+ Monthly Page Turns, our website stands as the go-to destination for avid readers, logging over a million views every month. </div>
    </section>
    <section className="about-container" id="about-sec3">
        <div className="about-container-text"><span>Your Next Adventure Awaits:</span> Discover hidden gems and bestsellers alike on our book review hub. With a stellar 4.8 out of 5 stars on average across thousands of reviews, our platform ensures quality recommendations.</div>
        <img src={about3} alt=""/>
    </section>
    <section className="about-container" id="about-sec4">
        <img src={about4} alt=""/>
        <div className="about-container-text"><span>Read. Review. Repeat:</span> Join our community of passionate readers and explore a universe of books with our authentic and captivating reviews. Having meticulously reviewed over 10,000 titles, we guarantee you&aposll find your next literary escape.</div>
    </section>
    <section className="about-container" id="about-sec5">
        <div className="about-container-text"><span>Where Words Come to Life:</span> Transform your reading journey with our expertly curated book reviews. Our global influence spans 150+ countries, connecting diverse literature lovers worldwide. Trust in our 5-Star Stamp of Approval—your TBR list will thank you!</div>
        <img src={about5} alt=""/>
    </section>
      </div>
      <div className="min-[800px]:hidden">
      <section className="flex flex-col md:flex-row items-center justify-center gap-6 p-6" id="about-sec1">
  <div className="md:w-1/2 text-center md:text-left">
    <p className=" font-semibold text-pink-600 font1 text-2xl">Unlock Literary Worlds:</p>
    <p className="text-lg text-black font2">
      Dive into our book reviews, where every page-turner finds its perfect match! Over 100,000 Bookworms Served, forming a thriving community of readers who trust our insights.
    </p>
  </div>
  <img src={about1} alt="About 1" className="w-full md:w-1/2 rounded-lg object-cover" />
</section>

<section className="flex flex-col-reverse md:flex-row items-center justify-center gap-6 p-6 " id="about-sec2">
  <img src={about2} alt="About 2" className="w-full md:w-1/2 rounded-lg object-cover" />
  <div className="md:w-1/2 text-center md:text-left">
    <p className="font-semibold text-blue-500 font1 text-2xl">Book Lovers&apos; Haven:</p>
    <p className="text-lg text-black font2">
      Elevate your reading experience with insightful reviews. Boasting 1M+ Monthly Page Turns, we’re a go-to hub for avid readers.
    </p>
  </div>
</section>

<section className="flex flex-col md:flex-row items-center justify-center gap-6 p-6" id="about-sec3">
  <div className="md:w-1/2 text-center md:text-left">
    <p className="font-semibold text-green-500 font1 text-2xl">Your Next Adventure Awaits:</p>
    <p className="text-lg text-black font2">
      Discover hidden gems and bestsellers alike. With 4.8★ average ratings across thousands of reviews, you’re in good hands.
    </p>
  </div>
  <img src={about3} alt="About 3" className="w-full md:w-1/2 rounded-lg object-cover" />
</section>

<section className="flex flex-col-reverse md:flex-row items-center justify-center gap-6 p-6 " id="about-sec4">
  <img src={about4} alt="About 4" className="w-full md:w-1/2 rounded-lg object-cover" />
  <div className="md:w-1/2 text-center md:text-left">
    <p className="font-semibold text-yellow-400 font1 text-2xl">Read. Review. Repeat:</p>
    <p className="text-lg text-black font2">
      Join our community of passionate readers. With over 10,000 titles reviewed, you&apos;re bound to find your next favorite.
    </p>
  </div>
</section>

<section className="flex flex-col md:flex-row items-center justify-center gap-6 p-6" id="about-sec5">
  <div className="md:w-1/2 text-center md:text-left">
    <p className=" font-semibold text-purple-500 font1 text-2xl">Where Words Come to Life:</p>
    <p className="text-lg text-black font2">
      Explore globally loved book reviews across 150+ countries. Trust our 5-Star Stamp of Approval—your TBR list will thank you!
    </p>
  </div>
  <img src={about5} alt="About 5" className="w-full md:w-1/2 rounded-lg object-cover" />
</section>

      </div>
    </>
  )
}

export default AboutUs
