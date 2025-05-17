import React, { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    stars: 0,
    comment: "",
  });

  const [submissionStatus, setSubmissionStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStarClick = (starValue) => {
    setFormData((prev) => ({
      ...prev,
      stars: starValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, email, stars, comment } = formData;

    if (!username || !email || !stars || !comment) {
      setSubmissionStatus("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSubmissionStatus("Feedback submitted successfully!");
        setFormData({ username: "", email: "", stars: 0, comment: "" });
      } else {
        setSubmissionStatus("Submission failed.");
      }
    } catch (err) {
      console.error(err);
      setSubmissionStatus("An error occurred.");
    }
  };

  return (
    <>
      <h1 className="contact-head text-center text-5xl py-10">Contact Us</h1>
      <section className="contact-sec-1 bg-[#f5f5dc]">
        <div className="contact-container" id="contact-container-1">
          <h1><i className="fa fa-phone-square" aria-hidden="true"></i></h1>
          Ring in the possibilities! Dial our number to bridge the gap between questions and answers.
          <br /><br /> Telephone: 033-4855-1578-4468 <br /> Phone: +91-88675-97658
        </div>
        <div className="contact-container" id="contact-container-2">
          <h1><i className="fa fa-envelope" aria-hidden="true"></i></h1>
          Drop us an email for inquiries, collaborations, or personalized solutions.
          <br /><br /> E-mail: readingradical@gmail.com
        </div>
        <div className="contact-container" id="contact-container-3">
          <h1><i className="fa fa-reply" aria-hidden="true"></i></h1>
          Share your experience. Your feedback is the heartbeat of our growth.
          <br /><br />
          <p href="#">Review the page</p>
        </div>
      </section>
  
      <section className="py-12 bg-[#f5f5dc]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-semibold text-center mb-8 text-gray-800">Leave A Feedback</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                name="username"
                placeholder="Your Name"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
  
            <div>
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
  
            <div>
              <label className="block text-gray-700 mb-2">Rating:</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-2xl cursor-pointer transition-colors ${star <= formData.stars ? "text-yellow-400" : "text-gray-300"
                      }`}
                    onClick={() => handleStarClick(star)}
                  >
                    &#9733;
                  </span>
                ))}
              </div>
            </div>
  
            <div>
              <textarea
                name="comment"
                placeholder="Write A Comment"
                value={formData.comment}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
              ></textarea>
            </div>
  
            {submissionStatus && (
              <div className="text-center text-green-600 font-medium">{submissionStatus}</div>
            )}
  
            <div className="text-center">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );

};

export default Contact;
