// src/components/Login.jsx
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import loginImage from '../Images/reviewers-sec1-pic.jpg';
import { AuthContext } from '../context/AuthContext'; // Ensure correct import

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const userData = await response.json();
      login(userData); // Update authentication context
      navigate('/home'); // Redirect to home page
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${loginImage})` }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full text-white max-w-sm bg-black bg-opacity-40 p-6 rounded-lg shadow-lg"
      >
        <div className="text-center border-b-4 border-white pb-2 mb-4">
          <h3 className="text-xl font-bold">LOGIN</h3>
        </div>

        <div className="mb-4">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full px-4 py-2 border border-gray-300 text-black bg-amber-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full px-4 py-2 border border-gray-300 text-black bg-amber-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex items-center mb-4">
          <input type="checkbox" id="remember" className="mr-2" />
          <label htmlFor="remember" className="text-sm text-white">
            Remember Me
          </label>
        </div>

        {errorMessage && (
          <div className="mb-4 text-sm text-red-600">{errorMessage}</div>
        )}

        <div className="mb-4">
          <button
            type="submit"
            className="block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            LOGIN
          </button>
        </div>

        <div className="text-center">
          <Link to="/register" className="text-blue-600 hover:underline">
            New User? Register
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
