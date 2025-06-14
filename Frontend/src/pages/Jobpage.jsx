import React, { useState, useEffect, useCallback } from 'react';
import api from '../service/api.js';
import { useSearchParams } from 'react-router-dom';
import JobCard from '../components/JobCard';

// Custom debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default function Jobpage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [skills, setSkills] = useState('');
  const [country, setCountry] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch Jobs
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/jobs/jobs', {
        params: {
          page: currentPage,
          limit: 10,
          q: searchQuery || undefined,
          city: location || undefined,
          country: country || undefined,
          skills: skills || undefined,
          role: jobRole || undefined,
        },
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data;
      console.log(data.data.jobs);
      setJobs(data.data.jobs);
      setTotalJobs(data.data.totalJobs);
      setTotalPages(data.data.totalPages);
      setCurrentPage(data.data.currentPage);
    } catch (e) {
      setError('Failed to fetch jobs: ' + e.message);
      setJobs([]);
      setTotalJobs(0);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  // Refresh external jobs
  const handleRefreshJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/jobs/jobs/fetch-and-store');
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = response.data;
      alert(data.message);
      fetchJobs();
    } catch (e) {
      setError('Failed to refresh jobs from external API: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch on page change only
  useEffect(() => {
    fetchJobs();
  }, [currentPage]);

  // Handle filters
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'searchQuery':
        setSearchQuery(value);
        break;
      case 'location':
        setLocation(value);
        break;
      case 'country':
        setCountry(value);
        break;
      case 'skills':
        setSkills(value);
        break;
      default:
        break;
    }
  };

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'role':
        setJobRole(value);
        break;
      default:
        break;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs();
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Shimmer loading effect
  const LoadingCard = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 rounded"></div>
        <div className="h-3 bg-gray-300 rounded"></div>
        <div className="h-3 bg-gray-300 rounded w-5/6"></div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in min-h-screen bg-gray-50 relative overflow-hidden mt-15">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-200 opacity-20 blur-3xl rounded-full animate-blob"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-200 opacity-20 blur-3xl rounded-full animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-blue-200 opacity-20 blur-3xl rounded-full animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-slide-down">
          <h1 className="text-5xl font-bold text-[#4f3ff0] mb-4">
            Find Your Dream Job
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover opportunities that match your skills and aspirations
          </p>
        </div>

        {/* Search + Filter Bar */}
        <div className="flex flex-col gap-6 mb-8">
          {/* Search Row */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-4 bg-white shadow-lg rounded-2xl p-6 border border-gray-200 animate-fade-in-up">
            {/* Search Query */}
            <div className="relative flex-1 group w-full">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#4f3ff0] transition-colors"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                name="searchQuery"
                placeholder="Job title, keywords, or company"
                value={searchQuery}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-[#4f3ff0] focus:outline-none bg-gray-50 text-gray-800 transition-all duration-300 hover:shadow-inner"
              />
            </div>

            {/* Location */}
            <div className="relative flex-1 group w-full">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#4f3ff0] transition-colors"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={location}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-[#4f3ff0] focus:outline-none bg-gray-50 text-gray-800 transition-all duration-300 hover:shadow-inner"
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="bg-[#4f3ff0] hover:bg-[#3f2fd0] text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 flex items-center justify-center transform hover:scale-105 shadow-md hover:shadow-xl"
            >
              <svg
                className="h-5 w-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Jobs
            </button>
          </form>

          {/* Horizontal Filters Row */}
          <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 animate-fade-in-up animation-delay-200">
            <div className="flex flex-wrap items-center gap-4">
              {/* Job Role Filter */}
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Job Role:</span>
                <select
                  value={jobRole || ''}
                  onChange={(e) =>
                    handleFilterChange('role', e.target.value === '' ? '' : e.target.value)
                  }
                  className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#4f3ff0] text-gray-700 bg-gray-50 hover:border-[#4f3ff0] transition-colors"
                  disabled={loading}
                >
                  <option value="">All Roles</option>
                  {[
                    'Software Development',
                    'Design',
                    'Marketing',
                    'Sales',
                    'Data Science',
                    'Product Management',
                    'Customer Support',
                    'Operations',
                  ].map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Country:</span>
                <input
                  type="text"
                  name="country"
                  placeholder="Enter country"
                  value={country}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#4f3ff0] text-gray-700 bg-gray-50 hover:border-[#4f3ff0] transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Skills Filter */}
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Skills:</span>
                <input
                  type="text"
                  name="skills"
                  placeholder="e.g., React, Node.js"
                  value={skills}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#4f3ff0] text-gray-700 bg-gray-50 hover:border-[#4f3ff0] transition-colors"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Advertise Resume Analyzer */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 mb-8 animate-fade-in-up animation-delay-400">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2">Boost Your Job Application with AI!</h2>
            <p className="text-blue-100">Get instant, intelligent feedback on your resume. Analyze for clarity, impact, and job description alignment.</p>
          </div>
          <a href="/Resume-analyzer" className="flex-shrink-0">
            <button className="bg-white text-indigo-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold shadow-md transition-colors duration-200 transform hover:scale-105">
              Analyze My Resume
            </button>
          </a>
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex justify-between items-center animate-fade-in">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900 text-xl animate-number">{totalJobs}</span> jobs
          </p>
          {error && (
            <p className="text-red-500 text-sm animate-shake">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </p>
          )}
        </div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {loading &&
            [1, 2, 3, 4].map((i) => <LoadingCard key={`loading-${i}`} />)}

          {!loading && jobs.length === 0 && !error && (
            <div className="lg:col-span-2 text-center py-16">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="00 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 text-lg">No jobs found matching your criteria.</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
            </div>
          )}

          {!loading &&
            jobs.length > 0 &&
            jobs.map((job, index) => (
              <JobCard 
                key={job.id || `job-${index}`} 
                job={job} 
                index={index} 
              />
            ))}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-12 animate-fade-in">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                const isActive = page === currentPage;
                if (Math.abs(currentPage - page) <= 2 || page === 1 || page === totalPages) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                        isActive
                          ? 'bg-[#4f3ff0] text-white shadow-lg'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === 2 && currentPage > 4) {
                  return <span key="left-ellipsis" className="px-2 text-gray-500">...</span>;
                } else if (page === totalPages - 1 && currentPage < totalPages - 3) {
                  return <span key="right-ellipsis" className="px-2 text-gray-500">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center"
            >
              Next
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Floating "Refresh" Action Button */}
      <button
        className="fixed bottom-8 right-8 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-5 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-20 flex items-center animate-bounce-slow"
        onClick={handleRefreshJobs}
        disabled={loading}
      >
        <svg
          className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356-2A8.001 8.001 0 004 12c0 2.973 1.157 5.662 3.003 7.727m0 0l-1.427-1.427m1.427 1.427L8.98 20.98M20 20v-5h-.581m-15.357 2A8.001 8.001 0 0120 12c0-2.973-1.157-5.662-3.003-7.727m0 0l1.427 1.427L15.02 3.02"
          />
        </svg>
        {loading ? 'Refreshing...' : 'Refresh Jobs'}
      </button>

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
        
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
          100% {
            transform: translateY(0px);
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

        @keyframes slide-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes number {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-3px);
          }
          75% {
            transform: translateX(3px);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
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

        .animate-slide-in-up {
          animation: slide-in-up 0.6s ease-out backwards;
        }

        .animate-number {
          animation: number 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
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
}