import React from 'react'
import about1 from '../Images/RR about pic1.jpeg'
import about2 from '../Images/RR about pic2.jpeg'
import about3 from '../Images/RR about pic3.jpeg'
import about4 from '../Images/RR about pic4.jpeg'
import about5 from '../Images/RR about pic5.jpeg'

const AboutUs = () => {
  return (
    <>
      <section className="about-container" id="about-sec1">
        <div className="about-container-text"><span>Unlock Literary Worlds:</span> Dive into our book reviews, where every page-turner finds its perfect match! Over 100,000 Bookworms Served, forming a thriving community of readers who trust our insights to guide their literary journeys.</div>
        <img src={about1} alt=""/>
    </section>
    <section className="about-container" id="about-sec2">
        <img src={about2} alt=""/>
        <div className="about-container-text"><span>Book Lovers' Haven:</span> Elevate your reading experience with our insightful reviews—because every story deserves a spotlight. Boasting 1 Million+ Monthly Page Turns, our website stands as the go-to destination for avid readers, logging over a million views every month. </div>
    </section>
    <section className="about-container" id="about-sec3">
        <div className="about-container-text"><span>Your Next Adventure Awaits:</span> Discover hidden gems and bestsellers alike on our book review hub. With a stellar 4.8 out of 5 stars on average across thousands of reviews, our platform ensures quality recommendations.</div>
        <img src={about3} alt=""/>
    </section>
    <section className="about-container" id="about-sec4">
        <img src={about4} alt=""/>
        <div className="about-container-text"><span>Read. Review. Repeat:</span> Join our community of passionate readers and explore a universe of books with our authentic and captivating reviews. Having meticulously reviewed over 10,000 titles, we guarantee you'll find your next literary escape.</div>
    </section>
    <section className="about-container" id="about-sec5">
        <div className="about-container-text"><span>Where Words Come to Life:</span> Transform your reading journey with our expertly curated book reviews. Our global influence spans 150+ countries, connecting diverse literature lovers worldwide. Trust in our 5-Star Stamp of Approval—your TBR list will thank you!</div>
        <img src={about5} alt=""/>
    </section>
    </>
  )
}

export default AboutUs
