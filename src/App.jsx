import { createBrowserRouter, RouterProvider, Navigate, Link } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import AboutUs from './components/AboutUs';
import Contact from './components/Contact';
import Reviewer from './components/Reviewer';
import Explore from './components/Explore';
import ExplorePage from './components/ExplorePage';
import ReadReview from './components/ReadReview';
import WriteReview from './components/WriteReview';
import Legal from './components/Legal';
import Login from './components/Login';
import Register from './components/Register';

const NotFound = () => (
  <div className="text-center py-24">
    <h1 className="font-display text-5xl mb-3">404</h1>
    <p className="text-gray-600 mb-6">We couldn&apos;t find that page.</p>
    <Link to="/home" className="bg-brand text-white px-6 py-2 rounded-full no-underline">Back home</Link>
  </div>
);

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to="/home" replace /> },
      { path: '/home', element: <Home /> },
      { path: '/aboutus', element: <AboutUs /> },
      { path: '/contact', element: <Contact /> },
      { path: '/reviewer', element: <Reviewer /> },
      { path: '/legal', element: <Legal /> },
      { path: '/books/:id/reviews', element: <ReadReview /> },
      { path: '/books/:id/write-review', element: <WriteReview /> },
      {
        path: '/explore',
        element: <Explore />,
        children: [
          { index: true, element: <Navigate to="all" replace /> },
          { path: ':slug', element: <ExplorePage /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
]);

const App = () => <RouterProvider router={router} />;

export default App;
