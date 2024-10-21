import React from 'react'
import {
    Link
  } from "react-router-dom";

const Navbar = () => {

    

    return (
        <>
            <nav className="header">
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/aboutus">About Us</Link></li>
                    <li><Link to="/explore">Explore</Link></li>
                    <li><Link to="/reviewer">Reviewers</Link></li>
                    <li><Link to="/contact">Contact Us</Link></li>
                </ul>
            </nav>
        </>
    )
}

export default Navbar
