import { useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { REVIEW_TIPS } from '../content';
import { AuthContext } from '../context/AuthContext';
import secImg1 from '../Images/reviewers-sec1-pic.jpg';
import secImg2 from '../Images/reviewers-sec2-pic.jpg';

const Panel = ({ img, alt, title, titleCls, text, cta, first }) => (
  <section
    className={`relative isolate flex items-center justify-center overflow-hidden text-white ${
      first ? 'min-h-[calc(100svh-7.75rem)]' : 'min-h-[calc(100svh-3.5rem)]'
    }`}
  >
    <img src={img} alt={alt} className="absolute inset-0 -z-10 w-full h-full object-cover" />
    <div className="absolute inset-0 -z-10 bg-black/55" />
    <div className="w-full max-w-4xl mx-auto px-6 py-16 text-center">
      <h2 className={`text-3xl sm:text-4xl md:text-6xl font-bold mb-5 drop-shadow-lg ${titleCls}`}>{title}</h2>
      <p className="text-base md:text-xl max-w-3xl mx-auto">{text}</p>
      <div className="mt-8">{cta}</div>
    </div>
  </section>
);

Panel.propTypes = {
  img: PropTypes.string, alt: PropTypes.string, title: PropTypes.string,
  titleCls: PropTypes.string, text: PropTypes.string, cta: PropTypes.node, first: PropTypes.bool,
};

const Reviewer = () => {
  const { user } = useContext(AuthContext);
  return (
    <>
      <Panel
        img={secImg1}
        alt=""
        first
        title="Get Started as a Reviewer"
        titleCls="text-pink-400"
        text="Embrace your love for books and become a vital part of our literary community. Whether you're a seasoned critic or a casual reader, your opinions matter."
        cta={
          user ? (
            <Link to="/explore/all" className="bg-brand hover:bg-brand-dark px-8 py-3 rounded-full font-semibold no-underline text-white">
              Start Reviewing
            </Link>
          ) : (
            <Link to="/register" className="bg-brand hover:bg-brand-dark px-8 py-3 rounded-full font-semibold no-underline text-white">
              Become a Reviewer
            </Link>
          )
        }
      />
      <Panel
        img={secImg2}
        alt=""
        title="Give Your Own Take"
        titleCls="text-sky-300"
        text="Passionate about books? Contribute with a quick review of your favourite reads. Your insights help fellow bookworms discover new treasures."
        cta={
          <Link to="/explore/all" className="bg-sky-600 hover:bg-sky-700 px-8 py-3 rounded-full font-semibold no-underline text-white">
            Write a Review
          </Link>
        }
      />

      <section className="max-w-5xl mx-auto px-6 py-16 grid gap-8 md:grid-cols-2">
        <div className="bg-white rounded-3xl shadow-sm p-8 text-left">
          <h2 className="font-display text-3xl text-brand mb-4">Tips for a great review</h2>
          <ol className="space-y-3 list-decimal pl-5 text-gray-700 leading-relaxed">
            {REVIEW_TIPS.map((t) => <li key={t}>{t}</li>)}
          </ol>
        </div>
        <div className="bg-white rounded-3xl shadow-sm p-8 text-left">
          <h2 className="font-display text-3xl text-brand mb-4">Why become a Reviewer?</h2>
          <ul className="space-y-3 list-disc pl-5 text-gray-700 leading-relaxed">
            <li>Your name is pre-filled every time you review.</li>
            <li>Help other readers choose their next book.</li>
            <li>Join a growing community of people who love talking about books.</li>
            <li>It is free and takes less than a minute to sign up.</li>
          </ul>
        </div>
      </section>
    </>
  );
};

export default Reviewer;
