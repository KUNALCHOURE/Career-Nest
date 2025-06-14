import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authcontext';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white mt-15">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-indigo-900 mb-6">
            Find Your Dream Job with CareerNest
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your platform for job searching and resume analysis.
            Start your job search journey today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-indigo-600 text-4xl mb-4">
              <i className="fas fa-search"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart Job Search</h3>
            <p className="text-gray-600">
              Browse through thousands of job listings with advanced filters.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-indigo-600 text-4xl mb-4">
              <i className="fas fa-file-alt"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3">Resume Analysis</h3>
            <p className="text-gray-600">
              Get instant feedback on your resume with our AI-powered analysis tool.
            </p>
          </div>
        </div>

        <div className="text-center">
          {!user ? (
            <div className="space-x-4">
              <Link
                to="/Register"
                className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <Link
              to="/jobs"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Browse Jobs
            </Link>
          )}
        </div>

        <div className="mt-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-indigo-900 mb-6">
              Why Choose CareerNest?
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                <span className="text-gray-600">Extensive job listings database</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                <span className="text-gray-600">Real-time resume analysis and feedback</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                <span className="text-gray-600">Advanced job search filters</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                <span className="text-gray-600">User-friendly interface</span>
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Job Search"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>

        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-indigo-900 mb-8">
            Start Your Job Search Today
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join CareerNest to find your next opportunity.
          </p>
          {!user && (
            <Link
              to="/Register"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Create Your Free Account
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing;