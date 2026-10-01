import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SITE } from '../config';
import logo from '../Images/RRlogo.png';

const btn =
  "px-4 py-1.5 border rounded-lg font-bold text-sm font-ui transition-all duration-300 whitespace-nowrap";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  return (
    <header className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link to="/home" className="flex items-center gap-3 no-underline text-white" aria-label="Reading Radical home">
          <img src={logo} alt="" className="w-11 h-11 object-contain" />
          <span className="font-display text-2xl sm:text-3xl leading-none">
            <span className="text-brand text-3xl sm:text-4xl">R</span>eading{' '}
            <span className="text-brand text-3xl sm:text-4xl">R</span>adical
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <a href={`tel:${SITE.phone.replace(/[^+\d]/g, '')}`} className="hidden xl:block text-sm text-gray-300 hover:text-white no-underline">
            Contact: {SITE.phone}
          </a>
          {user ? (
            <>
              <span className="hidden sm:block text-sm md:text-base">
                Welcome, <span className="text-pink-400 font-semibold">{user.name || 'Reader'}</span>
              </span>
              <button onClick={handleLogout} className={`${btn} border-red-500 text-red-400 hover:bg-red-500 hover:text-white`}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`${btn} border-red-500 text-red-400 hover:bg-red-500 hover:text-white no-underline`}>
                Login
              </Link>
              <Link to="/register" className={`${btn} border-sky-400 text-sky-300 hover:bg-sky-500 hover:text-white no-underline`}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
