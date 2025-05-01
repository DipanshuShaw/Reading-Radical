// import React from 'react'
"use client";

const Contact = () => {
  return (
    <>
      <h1 className="contact-head text-center">Contact Us</h1>
    <section className="contact-sec-1 bg-[#f5f5dc]">
        <div className="contact-container" id="contact-container-1">
            <h1><i className="fa fa-phone-square" aria-hidden="true"></i></h1>
            Ring in the possibilities! Dial our number to bridge the gap between questions and answers. Your connection to us is just a call away.
            <br/><br/> Telephone: 033-4855-1578-4468 <br/> Phone: +91-88675-97658
        </div>
        <div className="contact-container" id="contact-container-2">
            <h1><i className="fa fa-envelope" aria-hidden="true"></i></h1>
            Drop us an email to open the door to inquiries, collaborations, and personalized solutions. Your message matters; let&apos;s start the conversation.
            <br/><br/> E-mail: readingradical@gmail.com
        </div>
        <div className="contact-container" id="contact-container-3">
            <h1><i className="fa fa-reply" aria-hidden="true"></i></h1>
            Share your experience. Your feedback is the heartbeat of our growth. Leave a review and become a part of our journey towards excellence. <br/><br/>
            <p href="#">Review the page</p>
        </div>
    </section>
    <section className="contact-sec-2">
        <div id="contact-container-4">
            <h1>Leave A Review</h1>
            <div className="h3">
                <textarea name="" className="input" cols={30} rows={10} placeholder="Write A Comment"></textarea>
            </div>
            <div className="button">
                <a href="#" className="input" id="button">Submit</a>
            </div>
        </div>
    </section>
    </>
  )
}

export default Contact
