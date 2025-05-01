// import React from 'react';
import { Link } from "react-router-dom";

const Header = () => {
    return (
<header className="bg-neutral-900 text-white p-4 flex flex-col md:flex-row items-center justify-between relative">
    {/* Logo */}
    <div className="absolute left-9">
        <img src="" alt="Logo" className="w-24" />
    </div>

    {/* Heading - Hidden on small screens */}
    <h1 className="hidden md:flex text-center text-2xl md:text-4xl font-bold font-[Agbalumo] w-1/3 items-end mx-auto justify-center text-white">
        <span className="text-pink-600 text-[54px] font-[Agbalumo]">R</span>eading&nbsp;
        <span className="text-pink-600 text-[54px] font-[Agbalumo]">R</span>adical
    </h1>
    <h1 className=" md:hidden text-2xl md:text-4xl font-bold font-[Agbalumo] text-white">
        <span className="text-pink-600 text-[54px] font-[Agbalumo]">R</span>
        <span className="text-pink-600 text-[54px] font-[Agbalumo]">R</span>
    </h1>

    {/* Contact & Buttons */}
    <div className="absolute right-3 top-5 flex items-center space-x-4">
        <span className="text-sm md:text-lg font-medium max-xl:hidden">Contact: +918766548239</span>
        <Link to="/login"
            className="px-4 py-1.5 border border-red-500 text-red-500 bg-transparent rounded-lg font-bold text-base font-['Chakra_Petch'] transition-all duration-500 hover:bg-red-500 hover:text-white">
            Login
        </Link>
        <Link to="/register"
            className="px-4 py-1.5 border border-blue-500 text-blue-500 bg-transparent rounded-lg font-bold text-base font-['Chakra_Petch'] transition-all duration-500 hover:bg-blue-500 hover:text-white">
            Register
        </Link>
    </div>
</header>

    );
}

export default Header;
