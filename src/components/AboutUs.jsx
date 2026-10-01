import { VALUES, HOME_FAQ } from '../content';
import StatsStrip from './StatsStrip';
import Faq from './Faq';
import about1 from '../Images/RR about pic1.jpeg';
import about2 from '../Images/RR about pic2.jpeg';
import about3 from '../Images/RR about pic3.jpeg';
import about4 from '../Images/RR about pic4.jpeg';
import about5 from '../Images/RR about pic5.jpeg';

const BLOCKS = [
  { img: about1, title: 'Unlock Literary Worlds', color: 'text-brand', text: 'Dive into our book reviews, where every page-turner finds its perfect match. A growing community of readers trusts our insights to guide their literary journeys.' },
  { img: about2, title: "Book Lovers' Haven", color: 'text-sky-600', text: 'Elevate your reading experience with insightful reviews — because every story deserves a spotlight. We are a go-to destination for avid readers.' },
  { img: about3, title: 'Your Next Adventure Awaits', color: 'text-emerald-600', text: 'Discover hidden gems and bestsellers alike on our book review hub, with honest ratings from real readers to guide you to quality recommendations.' },
  { img: about4, title: 'Read. Review. Repeat.', color: 'text-amber-500', text: 'Join our community of passionate readers and explore a universe of books through authentic and captivating reviews.' },
  { img: about5, title: 'Where Words Come to Life', color: 'text-purple-600', text: 'Transform your reading journey with expertly curated book reviews, connecting diverse literature lovers worldwide.' },
];

const AboutUs = () => (
  <>
    <div className="max-w-6xl mx-auto px-6 pt-12 space-y-16">
      <header className="text-center max-w-3xl mx-auto">
        <h1 className="font-display text-4xl md:text-5xl">About <span className="text-brand">Us</span></h1>
        <p className="mt-5 text-lg text-gray-700 leading-relaxed">
          Reading Radical is a community-driven book review site. We believe the best way to pick your next book
          is to hear from people who have actually read it — so we collect honest ratings and reviews in one place,
          organised by the genres you love.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-3xl shadow-sm p-8 text-left">
          <h2 className="font-display text-2xl text-brand mb-2">Our mission</h2>
          <p className="text-gray-700 leading-relaxed">
            To help every reader find books they will love, and to give every reader a voice — whether it is a single
            star or a thousand-word essay.
          </p>
        </div>
        <div className="bg-white rounded-3xl shadow-sm p-8 text-left">
          <h2 className="font-display text-2xl text-brand mb-2">What we offer</h2>
          <ul className="text-gray-700 leading-relaxed list-disc pl-5 space-y-1">
            <li>Books across seven genres, searchable by title and author</li>
            <li>Average star ratings and written reviews for every book</li>
            <li>A simple way to rate and review in under a minute</li>
            <li>Reviewer accounts for the most active readers</li>
          </ul>
        </div>
      </section>
    </div>

    <div className="mt-14"><StatsStrip /></div>

    <div className="max-w-6xl mx-auto px-6 py-14 space-y-16">
      {BLOCKS.map((b, i) => (
        <section key={b.title} className={`flex flex-col ${i % 2 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8`}>
          <img src={b.img} alt="" loading="lazy" className="w-full md:w-1/2 rounded-3xl shadow-lg object-cover max-h-96" />
          <div className="md:w-1/2 text-left">
            <h2 className={`font-display text-3xl mb-3 ${b.color}`}>{b.title}</h2>
            <p className="text-lg text-gray-700 leading-relaxed">{b.text}</p>
          </div>
        </section>
      ))}
    </div>

    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl md:text-4xl text-center mb-8">What we <span className="text-brand">value</span></h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl bg-paper p-6 text-left">
              <h3 className="font-semibold text-lg text-brand mb-1">{v.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <Faq items={HOME_FAQ} />
  </>
);

export default AboutUs;
