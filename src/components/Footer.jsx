import { Link } from 'react-router-dom';
import { SITE } from '../config';

const social = [
  ['fa-facebook-f', 'https://www.facebook.com/', 'Facebook'],
  ['fa-whatsapp', 'https://www.whatsapp.com/', 'WhatsApp'],
  ['fa-linkedin-in', 'https://www.linkedin.com/', 'LinkedIn'],
  ['fa-twitter', 'https://www.twitter.com/', 'Twitter'],
  ['fa-instagram', 'https://www.instagram.com/', 'Instagram'],
];

const linkCls = 'text-gray-300 hover:text-pink-400 no-underline transition-colors';

const Footer = () => (
  <footer className="bg-neutral-900 text-gray-300 mt-auto">
    <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <h3 className="text-white font-ui font-bold text-lg mb-3">Navigate</h3>
        <ul className="space-y-2 list-none p-0 m-0">
          <li><Link className={linkCls} to="/home">Home</Link></li>
          <li><Link className={linkCls} to="/aboutus">About Us</Link></li>
          <li><Link className={linkCls} to="/explore/all">Explore</Link></li>
          <li><Link className={linkCls} to="/reviewer">Reviewers</Link></li>
          <li><Link className={linkCls} to="/contact">Contact Us</Link></li>
        </ul>
      </div>

      <div>
        <h3 className="text-white font-ui font-bold text-lg mb-3">Legal</h3>
        <ul className="space-y-2 list-none p-0 m-0">
          <li><Link className={linkCls} to="/legal#terms">Terms of Service</Link></li>
          <li><Link className={linkCls} to="/legal#privacy">Privacy Policy</Link></li>
          <li><Link className={linkCls} to="/legal#copyright">Copyrights</Link></li>
        </ul>
      </div>

      <div className="lg:col-span-2">
        <h3 className="font-display text-2xl text-white mb-3">
          <span className="text-brand">R</span>eading <span className="text-brand">R</span>adical
        </h3>
        <p className="text-sm mb-1">India&apos;s No.1 online book review page.</p>
        <p className="text-sm mb-4">Honest reviews from readers and reviewers around the world.</p>
        <p className="text-sm mb-1"><span className="text-white font-semibold">Call: </span>{SITE.phone}</p>
        <p className="text-sm"><span className="text-white font-semibold">Email: </span>
          <a className={linkCls} href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </p>
        <div className="flex gap-3 mt-5">
          {social.map(([icon, href, label]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-brand flex items-center justify-center text-white transition-colors"
            >
              <i className={`fa-brands ${icon}`}></i>
            </a>
          ))}
        </div>
      </div>
    </div>
    <div className="border-t border-white/10 text-center text-xs text-gray-400 py-4">
      &copy; {new Date().getFullYear()} Reading Radical. All rights reserved.
    </div>
  </footer>
);

export default Footer;
