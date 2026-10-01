import { Link } from 'react-router-dom';
import { BookOpen, Layers, Users } from 'lucide-react';
import heroImg from '../Images/home-sec1.jpg';

const FEATURES = [
  { icon: BookOpen, title: 'Discover Hidden Gems', text: 'Unearth captivating book reviews that dig into the essence of each story and build a reading list you can trust.' },
  { icon: Layers, title: 'Genres for Every Taste', text: 'From heartwarming romances to gripping horror, browse seven genres curated and reviewed by our community.' },
  { icon: Users, title: 'Connect with Book Lovers', text: 'Share your thoughts and recommendations. Every opinion matters in a community built around the written word.' },
];

const Home = () => (
  <>
    <section className="relative isolate overflow-hidden bg-neutral-900 text-white">
      <img src={heroImg} alt="" className="absolute inset-0 -z-10 w-full h-full object-cover opacity-40" />
      <div className="max-w-5xl mx-auto px-6 py-20 md:py-32 text-center fade-up">
        <p className="font-display text-3xl md:text-5xl leading-tight">
          &ldquo;The worth of a book is to be measured by what you can carry away from it.&rdquo;
        </p>
        <p className="mt-6 text-lg text-gray-200 max-w-2xl mx-auto">
          Step into a world of words where every page holds a new adventure. Welcome to Reading Radical, where stories come to life through shared experiences.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/explore/all" className="bg-brand hover:bg-brand-dark text-white font-semibold px-8 py-3 rounded-full no-underline transition">
            Explore Now
          </Link>
          <Link to="/reviewer" className="border border-white/60 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-full no-underline transition">
            Become a Reviewer
          </Link>
        </div>
      </div>
    </section>

    <section className="max-w-6xl mx-auto px-6 py-16 grid gap-6 md:grid-cols-3">
      {FEATURES.map(({ icon: Icon, title, text }) => (
        <div key={title} className="bg-white rounded-3xl shadow-sm hover:shadow-lg transition p-8 text-left">
          <div className="w-12 h-12 rounded-2xl bg-pink-100 text-brand flex items-center justify-center mb-4">
            <Icon size={24} />
          </div>
          <h2 className="font-display text-2xl mb-2">{title}</h2>
          <p className="text-gray-600 leading-relaxed">{text}</p>
        </div>
      ))}
    </section>
  </>
);

export default Home;
