import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import api from '../service/api';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    try {
      await logout(); // Only use the context's logout function
    } catch (error) {
      console.error('Logout failed:', error);
    }
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
          <div className="flex items-center space-x-2 hover:cursor-pointer" onClick={()=>navigate('/')} >
            <div className="bg-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center">
              <i className="fas fa-briefcase text-white text-lg"></i>
            </div>
            <span className="text-xl lg:text-2xl font-bold text-gray-900">CareerNest</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
           
            <a href="/jobs" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200">
              Browse Jobs
            </a>
            <a href="/Resume-analyzer" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200">
              Resume Analysis
            </a>
            {/* <a href="/about" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200">
              About
            </a> */}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {!user ? (
              <>
                <button 
                  className="text-gray-700 hover:text-indigo-600 font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
                <button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                  onClick={() => navigate('/register')}
                >
                  Register
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">
                   
                      {user.username ? user.username[0].toUpperCase() : 'U'}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">{user.username || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-indigo-600 font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}
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
        <div className={`lg:hidden transition-all duration-500 ${
          isMenuOpen ? 'max-h-90 opacity-100 pb-6' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-4 pt-2 pb-3 space-y-1 bg-white border-t">
            {user ? (
              // Mobile menu for logged in users
              <>
                <Link 
                  to="/jobs" 
                  className="block px-3 py-2 text-gray-600 hover:text-indigo-600"
              onClick={() => setIsMenuOpen(false)}
            >
                  Find Jobs
                </Link>
                <Link 
                  to="/Resume-analyzer" 
                  className="block px-3 py-2 text-gray-600 hover:text-indigo-600"
              onClick={() => setIsMenuOpen(false)}
            >
                  Resume Analyzer
                </Link>
                <Link 
                  to="/Profile" 
                  className="block px-3 py-2 text-gray-600 hover:text-indigo-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              // Mobile menu for non-logged in users
              <>
                <Link 
                  to="/jobs" 
                  className="block px-3 py-2 text-gray-600 hover:text-indigo-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Find Jobs
                </Link>
                <Link 
                  to="/login" 
                  className="block px-3 py-2 text-gray-600 hover:text-indigo-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/Register" 
                  className="block px-3 py-2 text-gray-600 hover:text-indigo-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;