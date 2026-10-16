import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';

// Shown instead of a form when the visitor is not logged in. After logging in or registering,
// they are sent straight back to the page they came from.
const LoginRequired = ({ title, message }) => {
  const { pathname, search, hash } = useLocation();
  const state = { from: `${pathname}${search}${hash}` };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm p-8 text-center fade-up" role="region" aria-label="Login required">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-100 text-brand flex items-center justify-center mb-4">
        <LockKeyhole size={26} />
      </div>
      <h3 className="font-display text-2xl mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/login" state={state} className="bg-brand hover:bg-brand-dark text-white font-semibold px-7 py-2.5 rounded-xl no-underline transition">
          Log in
        </Link>
        <Link to="/register" state={state} className="border border-brand text-brand hover:bg-pink-50 font-semibold px-7 py-2.5 rounded-xl no-underline transition">
          Create account
        </Link>
      </div>
    </div>
  );
};

LoginRequired.propTypes = { title: PropTypes.string.isRequired, message: PropTypes.string.isRequired };

export default LoginRequired;
