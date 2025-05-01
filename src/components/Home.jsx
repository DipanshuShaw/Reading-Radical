// import React from 'react'
import secImg1 from '../Images/home-sec1.jpg'

const Home = () => {
  return (
    <div>
      <section className="sec1">
        <div id="home-sec1">
            <div className="font1 text-2xl lg:text-3xl ">
                The worth of a book is to be measured by what you can carry away from it.
            </div>
            <div id="sec1-text">
                Step into a world of words where every page holds a new adventure. Welcome to Reading Radical page, where stories come to life through the magic of shared experiences. Let the exploration begin!
            </div>
            <div id="sec1-button">
                <button type="submit">Explore Now</button>
            </div>
        </div>
        <img src={secImg1} alt=""/>
    </section>
    <section className="lg:flex justify-evenly ">
        <div className="lg:w-80 text-xl font-semibold bg-pink-400 rounded-3xl  border-2 m-8 px-8 py-4 " id="box-1">
            <div className='font1 font-normal text-2xl'>Discover Hidden Gems:<br/><br/></div>
            Immerse yourself in our literary haven. Unearth captivating book reviews that delve deep into the essence of each story. Our devoted community ensures you confidently curate a reading list filled with hidden gems, embarking on a journey through the literary landscape. Happy reading
        </div>
        <div className="lg:w-80 text-xl font-semibold bg-pink-400 rounded-3xl  border-2 m-8 px-8 py-4 " id="box-2">
            <div className='font1 font-normal text-2xl'>Genres for Every Taste:<br/><br/></div>
            Dive into an array of genres, from heartwarming stories to gripping mysteries. Our passionate community of reviewers is dedicated to unveiling the essence of each narrative. Let our reviews be your compass as you curate a reading list that speaks to your unique tastes and preferences.
        </div>
        <div className="lg:w-80 text-xl font-semibold bg-pink-400 rounded-3xl  border-2 m-8 px-8 py-4 " id="box-3">
            <div className='font1 font-normal text-2xl'>Connect with Book Lovers:<br/><br/></div>
            Connect with fellow book lovers in a vibrant community where every opinion matters. Share your thoughts, recommendations, and musings on the magic of storytelling. Engage in discussions, build connections, and revel in the shared passion for the written word.
        </div>
    </section>
    </div>
  )
}

export default Home
