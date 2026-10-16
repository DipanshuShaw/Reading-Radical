import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { GENRES } from '../config';

const Explore = () => {
  const { search } = useLocation(); // keeps ?sort=... when switching genre
  return (
  <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
    <aside className="md:w-56 shrink-0">
      <h2 className="text-lg font-bold mb-3 text-brand text-left">Genres</h2>
      <nav aria-label="Genres">
        <ul className="list-none m-0 p-0 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 md:sticky md:top-20">
          {GENRES.map((g) => (
            <li key={g.slug} className="shrink-0">
              <NavLink
                to={{ pathname: `/explore/${g.slug}`, search }}
                className={({ isActive }) =>
                  `block px-4 py-2 text-sm font-semibold rounded-full md:rounded-lg no-underline text-left transition-colors ${
                    isActive ? 'bg-brand text-white' : 'bg-white text-gray-700 hover:bg-pink-100'
                  }`
                }
              >
                {g.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
    <div className="flex-1 min-w-0">
      <Outlet />
    </div>
  </div>
  );
};

export default Explore;
