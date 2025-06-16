import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authcontext';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden mt-15">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-200 opacity-20 blur-3xl rounded-full animate-blob"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-200 opacity-20 blur-3xl rounded-full animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-blue-200 opacity-20 blur-3xl rounded-full animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16 animate-slide-down">
          <h1 className="text-5xl font-bold text-[#4f3ff0] mb-6">
            Find Your Dream Job with CareerNest
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your platform for job searching and resume analysis.
            Start your job search journey today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow animate-fade-in-up">
            <div className="text-[#4f3ff0] text-4xl mb-4">
              <i className="fas fa-search"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart Job Search</h3>
            <p className="text-gray-600">
              Browse through thousands of job listings with advanced filters.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow animate-fade-in-up animation-delay-200">
            <div className="text-[#4f3ff0] text-4xl mb-4">
              <i className="fas fa-file-alt"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3">Resume Analysis</h3>
            <p className="text-gray-600">
              Get instant feedback on your resume with our AI-powered analysis tool.
            </p>
          </div>
        </div>

        <div className="text-center animate-fade-in-up animation-delay-400">
          {!user ? (
            <div className="space-x-4">
              <Link
                to="/Register"
                className="inline-block bg-[#4f3ff0] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#3f2fd0] transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="inline-block bg-white text-[#4f3ff0] px-8 py-3 rounded-lg text-lg font-semibold border-2 border-[#4f3ff0] hover:bg-indigo-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <Link
              to="/jobs"
              className="inline-block bg-[#4f3ff0] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#3f2fd0] transition-colors"
            >
              Browse Jobs
            </Link>
          )}
        </div>

        <div className="mt-24 grid md:grid-cols-2 gap-12 items-center animate-fade-in-up animation-delay-600">
          <div>
            <h2 className="text-3xl font-bold text-[#4f3ff0] mb-6">
              Why Choose CareerNest?
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <i className="fas fa-check-circle text-[#4f3ff0] mt-1 mr-3"></i>
                <span className="text-gray-600">Extensive job listings database</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-[#4f3ff0] mt-1 mr-3"></i>
                <span className="text-gray-600">Real-time resume analysis and feedback</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-[#4f3ff0] mt-1 mr-3"></i>
                <span className="text-gray-600">Advanced job search filters</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-[#4f3ff0] mt-1 mr-3"></i>
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

        <div className="mt-24 text-center animate-fade-in-up animation-delay-800">
          <h2 className="text-3xl font-bold text-[#4f3ff0] mb-8">
            Start Your Job Search Today
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join CareerNest to find your next opportunity.
          </p>
          {!user && (
            <Link
              to="/Register"
              className="inline-block bg-[#4f3ff0] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#3f2fd0] transition-colors"
            >
              Create Your Free Account
            </Link>
          )}
        </div>
      </div>

      {/* Additional CSS animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }

        .animation-delay-600 {
          animation-delay: 600ms;
        }

        .animation-delay-800 {
          animation-delay: 800ms;
        }

        .animation-delay-2000 {
          animation-delay: 2000ms;
        }

        .animation-delay-4000 {
          animation-delay: 4000ms;
        }
      `}</style>
    </div>
  );
};

export default Landing;