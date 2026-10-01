import { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Layers, Users, Heart, Swords, Rocket, Laugh, Sparkles, Ghost, Flame, Search, PenLine, Star,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { HOME_FAQ } from '../content';
import heroImg from '../Images/home-sec1.jpg';
import StatsStrip from './StatsStrip';
import FeaturedBooks from './FeaturedBooks';
import Faq from './Faq';

const FEATURES = [
  { icon: BookOpen, title: 'Discover Hidden Gems', text: 'Unearth captivating book reviews that dig into the essence of each story and build a reading list you can trust.' },
  { icon: Layers, title: 'Genres for Every Taste', text: 'From heartwarming romances to gripping horror, browse seven genres curated and reviewed by our community.' },
  { icon: Users, title: 'Connect with Book Lovers', text: 'Share your thoughts and recommendations. Every opinion matters in a community built around the written word.' },
];

const GENRE_CARDS = [
  { slug: 'romantic', label: 'Romantic', icon: Heart, text: 'Love stories that stay with you.', tone: 'bg-pink-100 text-pink-600' },
  { slug: 'action', label: 'Action', icon: Swords, text: 'Fast, high-stakes page-turners.', tone: 'bg-orange-100 text-orange-600' },
  { slug: 'motivational', label: 'Motivational', icon: Flame, text: 'Ideas to fuel your next chapter.', tone: 'bg-amber-100 text-amber-600' },
  { slug: 'scifi', label: 'Sci-Fi', icon: Rocket, text: 'Futures, aliens and big ideas.', tone: 'bg-sky-100 text-sky-600' },
  { slug: 'comedy', label: 'Comedy', icon: Laugh, text: 'Laugh-out-loud reads.', tone: 'bg-yellow-100 text-yellow-600' },
  { slug: 'fantasy', label: 'Fantasy', icon: Sparkles, text: 'Magic, quests and other worlds.', tone: 'bg-purple-100 text-purple-600' },
  { slug: 'horror', label: 'Horror', icon: Ghost, text: 'Chills best read with the lights on.', tone: 'bg-slate-200 text-slate-700' },
];

const STEPS = [
  { icon: Search, title: '1. Discover', text: 'Browse by genre or search by title and author to find something worth reading.' },
  { icon: BookOpen, title: '2. Read reviews', text: 'See star ratings and honest opinions from other readers before you commit.' },
  { icon: PenLine, title: '3. Share yours', text: 'Finished a book? Rate it and write a review to help the next reader.' },
];

const Home = () => {
  const { user } = useContext(AuthContext);
  return (
    <>
    <section className="relative isolate flex items-center justify-center min-h-[calc(100svh-7.75rem)] overflow-hidden text-white">
      <img src={heroImg} alt="" className="absolute inset-0 -z-10 w-full h-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/45 to-black/75" />
      <div className="w-full max-w-5xl mx-auto px-6 py-16 text-center fade-up">
        <p className="font-display text-3xl sm:text-4xl md:text-6xl leading-tight drop-shadow-lg">
          &ldquo;The worth of a book is to be measured by what you can carry away from it.&rdquo;
        </p>
        <p className="mt-6 text-base md:text-xl text-gray-100 max-w-2xl mx-auto">
          Step into a world of words where every page holds a new adventure. Welcome to Reading Radical, where stories come to life through shared experiences.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/explore/all" className="bg-brand hover:bg-brand-dark text-white font-semibold px-8 py-3 rounded-full no-underline transition">
            Explore Now
          </Link>
          <Link to="/reviewer" className="border border-white/70 hover:bg-white/15 text-white font-semibold px-8 py-3 rounded-full no-underline transition">
            Become a Reviewer
          </Link>
        </div>
      </div>
    </section>

      <StatsStrip />

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

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="font-display text-3xl md:text-4xl text-center mb-2">Browse by <span className="text-brand">genre</span></h2>
        <p className="text-center text-gray-600 mb-8">Pick a mood and dive in.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GENRE_CARDS.map(({ slug, label, icon: Icon, text, tone }) => (
            <Link key={slug} to={`/explore/${slug}`}
              className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all no-underline text-ink text-left flex items-start gap-4">
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tone}`}><Icon size={22} /></span>
              <span className="min-w-0">
                <span className="block font-semibold group-hover:text-brand transition-colors">{label}</span>
                <span className="block text-sm text-gray-500">{text}</span>
              </span>
            </Link>
          ))}
          <Link to="/explore/all"
            className="bg-brand hover:bg-brand-dark text-white rounded-2xl p-5 flex items-center justify-center font-semibold no-underline transition">
            See everything →
          </Link>
        </div>
      </section>

      <FeaturedBooks />

      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="font-display text-3xl md:text-4xl text-center mb-10">How it <span className="text-brand">works</span></h2>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-brand text-white flex items-center justify-center mb-4 shadow-md">
                  <Icon size={28} />
                </div>
                <h3 className="font-semibold text-xl mb-2">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Faq items={HOME_FAQ} />

      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-brand to-purple-700 text-white text-center px-6 py-14 shadow-xl">
          <Star className="mx-auto mb-3 text-amber-300" size={32} />
          <h2 className="font-display text-3xl md:text-4xl mb-3">
            {user ? `Ready for your next read, ${user.name}?` : 'Join the community of readers'}
          </h2>
          <p className="max-w-xl mx-auto text-pink-50 mb-7">
            {user
              ? 'Pick a book, rate it and tell everyone what you thought.'
              : 'Create a free account to review books under your name and become a Reviewer.'}
          </p>
          <Link to={user ? '/explore/all' : '/register'}
            className="inline-block bg-white text-brand font-semibold px-8 py-3 rounded-full no-underline hover:bg-pink-50 transition">
            {user ? 'Explore books' : 'Create free account'}
          </Link>
        </div>
      </section>
    </>
  );
};

export default Home;
