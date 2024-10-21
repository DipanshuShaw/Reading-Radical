import React from 'react'
import '../CSS/register.css'
import {
    Link
  } from "react-router-dom";
  import FeatureNotAvailable from './FeatureNotAvailable';

const Register = () => {

    const handleClick = ()=> {
        return(
            <FeatureNotAvailable/>
        )
    }


    return (
        <div className='registerBody flex justify-center item-center'>
            <form action="" className='w-1/3'>
                <div className="container">
                    <h1 className='text-3xl font-bold text-pink-600'>Register</h1>
                    <p>Please fill in this form to create an account.</p>
                    <hr />

                    <label for="email"><b>Email</b></label>
                    <input type="text" placeholder="Enter Email" name="email" id="email" required />

                    <label for="psw"><b>Username</b></label>
                    <input type="username" placeholder="Username" name="username" id="username" required />

                    <label for="psw-repeat"><b>Password</b></label>
                    <input type="password" placeholder="Password" name="password" id="password" required />
                    <hr />

                    <p>By creating an account you agree to our <a href="" onClick={handleClick}>Terms & Privacy</a>.</p>
                    <Link type="submit" className="registerbtn button" to={'/'}>Register</Link>
                </div>

                <div className="container signin">
                    <p>Already have an account? <Link to="/login" >Login</Link>.</p>
                </div>
            </form>
        </div>
    )
}

export default Register
