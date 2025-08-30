import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authcontext';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-6xl font-extrabold tracking-tight text-gray-900 sm:text-7xl lg:text-8xl">
            <span className="block xl:inline">Find Your Dream Job</span>{' '}
            <span className="block text-indigo-600 xl:inline">with CareerNest</span>
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-500 sm:text-2xl">
            Your powerful platform for intelligent job searching and personalized resume analysis.
          </p>
          <div className="mt-10">
            {!user ? (
              <div className="flex justify-center space-x-4">
                <Link
                  to="/Register"
                  className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-8 py-4 border border-indigo-600 text-base font-medium rounded-full text-indigo-700 bg-white hover:bg-indigo-50 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <Link
                to="/jobs"
                className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Browse Jobs
              </Link>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 lg:mt-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start">
                <span className="inline-flex items-center justify-center p-3 rounded-md bg-indigo-50 text-indigo-600">
                  <i className="fas fa-search text-2xl"></i>
                </span>
                <h3 className="ml-4 text-2xl font-bold text-gray-900">Smart Job Search</h3>
              </div>
              <p className="mt-4 text-lg text-gray-500">
                Dive into a comprehensive database of thousands of job listings. Our powerful filters help you find the perfect role, so you can stop scrolling and start applying.
              </p>
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start">
                <span className="inline-flex items-center justify-center p-3 rounded-md bg-indigo-50 text-indigo-600">
                  <i className="fas fa-file-alt text-2xl"></i>
                </span>
                <h3 className="ml-4 text-2xl font-bold text-gray-900">Resume Analysis</h3>
              </div>
              <p className="mt-4 text-lg text-gray-500">
                Get an edge with our AI-powered resume analysis. Receive instant, actionable feedback to optimize your resume and stand out to hiring managers.
              </p>
            </div>
          </div>
        </div>
        
        <hr className="my-16 border-gray-200" />

        {/* Why Choose Us Section */}
        <div className="relative mt-16 lg:mt-24">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div className="order-2">
              <img
                className="rounded-xl shadow-2xl"
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Professional team collaborating"
              />
            </div>
            <div className="relative mt-12 lg:mt-0 order-1">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Why CareerNest is the Right Choice for Your Career
              </h2>
              <ul className="mt-8 space-y-6">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <i className="fas fa-check-circle text-indigo-600 text-2xl"></i>
                  </div>
                  <p className="ml-4 text-lg text-gray-500">
                    <span className="font-medium text-gray-900">Comprehensive Job Listings:</span> Access a vast, up-to-date database of opportunities.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <i className="fas fa-check-circle text-indigo-600 text-2xl"></i>
                  </div>
                  <p className="ml-4 text-lg text-gray-500">
                    <span className="font-medium text-gray-900">Data-driven Insights:</span> Our AI tools provide targeted feedback to improve your application materials.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <i className="fas fa-check-circle text-indigo-600 text-2xl"></i>
                  </div>
                  <p className="ml-4 text-lg text-gray-500">
                    <span className="font-medium text-gray-900">Intuitive Interface:</span> A clean, simple design makes finding your next job a breeze.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 lg:mt-32 text-center bg-indigo-50 rounded-xl p-10 sm:p-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Ready to Take the Next Step?
          </h2>
          <p className="mt-4 text-xl text-indigo-800">
            Join the community of professionals who are finding success with CareerNest.
          </p>
          {!user && (
            <div className="mt-8">
              <Link
                to="/Register"
                className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Create Your Free Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing;