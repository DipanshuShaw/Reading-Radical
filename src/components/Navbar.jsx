import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const LINKS = [
  { to: '/home', label: 'Home' },
  { to: '/aboutus', label: 'About Us' },
  { to: '/explore/all', label: 'Explore', match: '/explore' },
  { to: '/reviewer', label: 'Reviewer' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const cls = (isActive, mobile) =>
    `no-underline font-ui font-bold transition-colors duration-200 ${
      mobile ? 'block px-4 py-3 text-lg rounded-lg' : 'px-4 py-2 text-lg rounded-full'
    } ${isActive ? 'bg-white text-brand' : 'text-white hover:bg-white/20'}`;

  return (
    <nav className="bg-brand sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <ul className="hidden md:flex flex-1 justify-center gap-2 m-0 p-0 list-none">
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) => cls(isActive || (l.match && pathname.startsWith(l.match)), false)}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <span className="md:hidden text-white font-ui font-bold text-lg">Menu</span>
          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden text-white p-1"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {open && (
        <ul className="md:hidden bg-brand-dark m-0 p-3 list-none space-y-1">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} onClick={() => setOpen(false)} className={({ isActive }) => cls(isActive || (l.match && pathname.startsWith(l.match)), true)}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
