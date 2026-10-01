import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Shared full-screen background + card for Login / Register.
const AuthShell = ({ image, title, subtitle, children }) => (
  <div
    className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-10 relative"
    style={{ backgroundImage: `url(${image})` }}
  >
    <div className="absolute inset-0 bg-black/55" />
    <div className="relative w-full max-w-md bg-black/50 backdrop-blur-md text-white p-8 rounded-2xl shadow-2xl text-left fade-up">
      <Link to="/home" className="text-sm text-pink-300 hover:text-pink-200 no-underline">← Back to site</Link>
      <h1 className="text-3xl font-bold text-pink-400 mt-3">{title}</h1>
      {subtitle && <p className="text-sm text-gray-200 mt-1">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  </div>
);

AuthShell.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node,
};

export default AuthShell;
