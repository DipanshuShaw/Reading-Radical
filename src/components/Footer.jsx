// import React from 'react'

const Footer = () => {
  return (
    <>
          <footer className="foot">
        <ul>
            <p>Navigate</p>
            <li><a href="index.html">Home</a></li>
            <li><a href="About.html">About Us</a></li>
            <li><a href="explore.html">Explore</a></li>
            <li><a href="Reviewers.html">Reviewers</a></li>
            <li><a href="Contact.html">Contact Us</a></li>
        </ul>
        <ul>
            <p>Connect Us</p>
            <li><a href="">Terms of Service</a></li>
            <li><a href="">Privacy Policy</a></li>
            <li><a href="">Copyrights</a></li>
            <li><a href="">Personal Details</a></li>
            <li><a href="">Know More</a></li>
        </ul>
        <section className="footer-about">
            <h1 className="heading">
                <div className=""><span>R</span>eading &nbsp;<span>R</span>adical</div>
            </h1>
            <div className="about-text">India&apos;s No.1 online book review page</div>
            <div className="about-text">Most trusted and loved reviews across the globe</div>
            <div className="about-text">Reviews done by proffesional book reviewers from all over world</div>
            <div className="about-text">Reviews copyright under &copy;Copyright act 2023. <a href="#">All rights reserved</a></div>
            <br/>
        </section>
        <section className="footer-contact">
            <div className="about-text"><span>Contact Us: </span> +918876523985</div>
            <div className="about-text"><span>E-mail Us: </span> readingrads@gmail.com</div>
            <br/><br/><br/>
        </section>
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 p-4">
  <a className="w-16 h-16 md:w-20 md:h-20 flex justify-center items-center" href="https://www.facebook.com/">
    <i className="text-3xl md:text-4xl fa-brands fa-facebook-f text-blue-500"></i>
  </a>
  <a className="w-16 h-16 md:w-20 md:h-20 flex justify-center items-center" href="https://www.whatsapp.com/">
    <i className="text-3xl md:text-4xl fa-brands fa-whatsapp text-green-400"></i>
  </a>
  <a className="w-16 h-16 md:w-20 md:h-20 flex justify-center items-center" href="https://www.linkedin.com/">
    <i className="text-3xl md:text-4xl fa-brands fa-linkedin-in text-blue-600"></i>
  </a>
  <a className="w-16 h-16 md:w-20 md:h-20 flex justify-center items-center" href="https://www.twitter.com/">
    <i className="text-3xl md:text-4xl fa-brands fa-twitter text-blue-400"></i>
  </a>
  <a className="w-16 h-16 md:w-20 md:h-20 flex justify-center items-center" href="https://www.instagram.com/">
    <i className="text-3xl md:text-4xl fa-brands fa-instagram text-pink-500"></i>
  </a>
</div>

    </footer>
    </>
  )
}

export default Footer
