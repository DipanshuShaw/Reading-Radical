import React from 'react'
import {
    Link
  } from "react-router-dom";

const Header = () => {
    return (
        <div>
            <header className="Header">
                <div className="logo">
                    <img src="Reading radical pics\RR log.jpg" alt="" />
                </div>
                <div className="button">
                    <span>Contact: +918766548239</span>
                    <Link className='buttons' id="login" to={'/login'}>Login</Link>
                    <Link className='buttons' id="register" to={'/register'}>Register</Link>
                </div>
                <h1 className="heading">
                    <div className="text"><span>R</span>eading &nbsp;<span>R</span>adical</div>
                </h1>
            </header>
        </div>
    )
}

export default Header
