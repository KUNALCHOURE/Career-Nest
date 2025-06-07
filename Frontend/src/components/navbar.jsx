import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

const navigate=useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200' 
        : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center">
              <i className="fas fa-briefcase text-white text-lg"></i>
            </div>
            <span className="text-xl lg:text-2xl font-bold text-gray-900">Job-Board</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <a href="/home" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200">
              Home
            </a>
            <a href="/jobs" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200">
              Browse Jobs
            </a>
            <a href="/companies" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200">
              Companies
            </a>
           
            <a href="/about" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200">
              About
            </a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4" >
            <button className="text-gray-700 hover:text-indigo-600 font-medium px-4 py-2 rounded-lg transition-colors duration-200"
             onClick={() =>{ 
                setIsMenuOpen(false);
               navigate('/login')
             }
             }
             >
              Login
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
           onClick={() =>{ 
            setIsMenuOpen(false);
           navigate('/register')
         }
         }

            >
              Register
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-gray-100 transition-colors duration-200"
          >
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-500
        ${isMenuOpen? 'max-h-90 opacity-100 pb-6':
            'max-h-0 opacity-0 overflow-hidden'
        }
        }`}>

          <div className="pt-4 space-y-4 border-t border-gray-200">
            <a 
              href="/home" 
              className="block text-gray-700 hover:text-indigo-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </a>
            <a 
              href="#jobs" 
              className="block text-gray-700 hover:text-indigo-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Jobs
            </a>
           
            <a 
              href="#resources" 
              className="block text-gray-700 hover:text-indigo-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Resources
            </a>
            <a 
              href="#about" 
              className="block text-gray-700 hover:text-indigo-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            
            {/* Mobile Auth Buttons */}
            <div className="pt-4 space-y-3 border-t border-gray-200" >
              <button className="w-full text-left text-gray-700 hover:text-indigo-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
               onClick={() =>{ 
                setIsMenuOpen(false);
               navigate('/login')
             }
             }
>
                Login
              </button>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              onClick={() =>{ 
                 setIsMenuOpen(false);
                navigate('/register')
              }
              }
>
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;