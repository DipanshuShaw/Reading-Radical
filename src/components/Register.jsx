import  { useState } from 'react';
import { Link } from 'react-router-dom';
import FeatureNotAvailable from './FeatureNotAvailable';
import registerImage from '../Images/reviewers-sec2-pic.jpg'; // ✅ Make sure this path is correct

const Register = () => {
  const [showFeatureModal, setShowFeatureModal] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    setShowFeatureModal(true);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${registerImage})` }}
    >
      <form className="w-full max-w-md bg-black bg-opacity-40 text-white p-6 rounded-lg shadow-lg">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-pink-600 mb-2">Register</h1>
          <p className="text-sm text-white">Please fill in this form to create an account.</p>
          <hr className="my-4" />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter Email"
            required
            className="w-full px-4 py-2 border bg-amber-50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            required
            className="w-full px-4 py-2 border bg-amber-50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            required
            className="w-full px-4 py-2 border bg-amber-50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        <hr className="my-4" />

        <p className="text-sm text-white mb-4">
          By creating an account you agree to our{' '}
          <a href="#" onClick={handleClick} className="text-blue-600 hover:underline">
            Terms & Privacy
          </a>.
        </p>

        <Link
          to="/"
          className="block w-full text-center bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 transition"
        >
          Register
        </Link>

        <div className="mt-4 text-sm text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </div>
      </form>

      {showFeatureModal && <FeatureNotAvailable />}
    </div>
  );
};

export default Register;
