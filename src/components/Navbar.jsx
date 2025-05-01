import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react"; // Icons for mobile menu toggle

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-pink-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Desktop Menu */}
                    <ul className="hidden md:flex flex-grow justify-center space-x-6">
                        {["Home", "About Us", "Explore", "Reviewer", "Contact"].map((item, index) => (
                            <li key={index} className="list-none px-4 py-2 rounded-[20px] hover:bg-white transition-all duration-300">
                                <Link to={`/${item.toLowerCase().replace(/\s+/g, '')}`} 
                                    className="no-underline text-white font-bold text-xl font-['Chakra_Petch'] hover:text-pink-600 transition ease-in-out duration-300">
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isOpen && (
                <ul className="md:hidden bg-pink-700 space-y-2 py-4 px-6 w-full text-center">
                    {["Home", "About Us", "Explore", "Reviewer", "Contact Us"].map((item, index) => (
                        <li key={index} className="list-none py-2">
                            <Link to={`/${item.toLowerCase().replace(/\s+/g, '')}`} 
                                className="no-underline text-white font-bold text-lg font-['Chakra_Petch'] block hover:text-pink-300 transition ease-in-out duration-300">
                                {item}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </nav>
    );
}

export default Navbar;
