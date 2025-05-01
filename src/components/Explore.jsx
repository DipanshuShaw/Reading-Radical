import { NavLink, Outlet, useLocation } from 'react-router-dom';

const Explore = () => {
  const location = useLocation();

  const getLinkClass = (to, isActive) => {
    const baseClasses =
      'block px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200';
    const activeClasses = 'bg-pink-600 text-white';
    const inactiveClasses = 'text-gray-700 hover:bg-blue-100';

    const isDefaultAll = to === '/explore/all' && location.pathname === '/explore';

    return `${baseClasses} ${isActive || isDefaultAll ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-48 sm:w-60 bg-gray-100 p-4 shadow-md h-full">
        <h2 className="text-lg font-bold mb-4 text-pink-700">Genres</h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <NavLink to="/explore/all" className={({ isActive }) => getLinkClass('/explore/all', isActive)}>
                All
              </NavLink>
            </li>
            <li>
              <NavLink to="/explore/romantic" className={({ isActive }) => getLinkClass('/explore/romantic', isActive)}>
                Romantic
              </NavLink>
            </li>
            <li>
              <NavLink to="/explore/action" className={({ isActive }) => getLinkClass('/explore/action', isActive)}>
                Action
              </NavLink>
            </li>
            <li>
              <NavLink to="/explore/motivational" className={({ isActive }) => getLinkClass('/explore/motivational', isActive)}>
                Motivational
              </NavLink>
            </li>
            <li>
              <NavLink to="/explore/scifi" className={({ isActive }) => getLinkClass('/explore/scifi', isActive)}>
                Sci-Fi
              </NavLink>
            </li>
            <li>
              <NavLink to="/explore/detective" className={({ isActive }) => getLinkClass('/explore/detective', isActive)}>
                Detective
              </NavLink>
            </li>
            <li>
              <NavLink to="/explore/comics" className={({ isActive }) => getLinkClass('/explore/comics', isActive)}>
                Comics
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Explore;
