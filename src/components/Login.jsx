// import { LogInIcon } from 'lucide-react'
// import React from 'react'
import { Link } from 'react-router-dom'
import loginImage from "../Images/reviewers-sec1-pic.jpg";

const Login = () => {
  return (
<div
  className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
  style={{ backgroundImage: `url(${loginImage})` }}
>

      <form
        method="post"
        action="/login"
        className="w-full text-white max-w-sm bg-black  bg-opacity-40 p-6 rounded-lg shadow-lg"
      >
        <div className="text-center border-b-4 border-white pb-2 mb-4">
          <h3 className="text-xl font-bold">LOGIN</h3>
        </div>

        <div className="mb-4 text-white">
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full px-4 py-2 border border-gray-300 text-white bg-amber-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 bg-amber-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex items-center mb-4">
          <input type="checkbox" id="remember" className="mr-2" />
          <label htmlFor="remember" className="text-sm  text-white">Remember Me</label>
        </div>

        <div className="mb-4">
          <Link
            to="/"
            className="block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            LOGIN
          </Link>
        </div>

        <div className="text-center">
          <Link to="../register" className="text-blue-600 hover:underline">
            New User? Register
          </Link>
        </div>
      </form>
    </div>
  )
}

export default Login
