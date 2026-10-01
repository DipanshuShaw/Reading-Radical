import { useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { AuthContext } from '../context/AuthContext';
import secImg1 from '../Images/reviewers-sec1-pic.jpg';
import secImg2 from '../Images/reviewers-sec2-pic.jpg';

const Panel = ({ img, alt, title, titleCls, text, cta }) => (
  <section className="relative w-full h-[420px] md:h-[560px] text-white">
    <img src={img} alt={alt} className="absolute inset-0 w-full h-full object-cover brightness-50" />
    <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 md:px-20">
      <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${titleCls}`}>{title}</h2>
      <p className="text-base md:text-lg max-w-3xl">{text}</p>
      <div className="mt-6">{cta}</div>
    </div>
  </section>
);

Panel.propTypes = {
  img: PropTypes.string, alt: PropTypes.string, title: PropTypes.string,
  titleCls: PropTypes.string, text: PropTypes.string, cta: PropTypes.node,
};

const Reviewer = () => {
  const { user } = useContext(AuthContext);
  return (
    <>
      <Panel
        img={secImg1}
        alt=""
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
    </>
  );
};

export default Reviewer;
