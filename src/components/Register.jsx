// src/components/Register.jsx
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FeatureNotAvailable from './FeatureNotAvailable';
import registerImage from '../Images/reviewers-sec2-pic.jpg';
import { AuthContext } from '../context/AuthContext.jsx'; // Corrected import

const Register = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    is_reviewer: false,
  });
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/register', formData);
      console.log('Registration successful:', response.data);
      login(response.data); // Pass user data to login
      navigate('/home'); // Redirect to home page
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      setErrorMessage(error.response?.data?.error || 'An error occurred during registration.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${registerImage})` }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-black bg-opacity-40 text-black p-6 rounded-lg shadow-lg"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-pink-600 mb-2">Register</h1>
          <p className="text-sm text-white">Please fill in this form to create an account.</p>
          <hr className="my-4" />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm text-white font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Email"
            required
            className="w-full px-4 py-2 border bg-amber-50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="name" className="block text-sm text-white font-medium mb-1">
            Username
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Username"
            required
            className="w-full px-4 py-2 border bg-amber-50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm text-white font-medium mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full px-4 py-2 border bg-amber-50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="is_reviewer"
            name="is_reviewer"
            checked={formData.is_reviewer}
            onChange={handleChange}
            className="w-5 h-5 border bg-amber-50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <label htmlFor="is_reviewer" className="ml-2 text-sm text-white font-medium">
            Become a Reviewer
          </label>
        </div>

        {errorMessage && (
          <div className="mb-4 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <hr className="my-4" />

        <p className="text-sm text-white mb-4">
          By creating an account you agree to our{' '}
          <a href="#" onClick={() => setShowFeatureModal(true)} className="text-blue-600 hover:underline">
            Terms & Privacy
          </a>.
        </p>

        <button
          type="submit"
          className="block w-full text-center bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 transition"
        >
          Register
        </button>

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
