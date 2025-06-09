import React, { useState, useEffect } from 'react';
import api from '../service/api.js'
import {useParams, useSearchParams} from 'react-router-dom';
export default function Jobpage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [skills, setSkills] = useState(''); // New state for skills
  const [salaryRange, setSalaryRange] = useState(''); // New state for salary range filter
  const [experienceLevel, setExperienceLevel] = useState(''); // New state for experience level
  const [jobType, setJobType] = useState(''); // New state for job type filter
  const [companySize, setCompanySize] = useState(''); // New state for company size filter
  const [jobRole, setJobRole] = useState(''); // New state for job role filter
  const [country, setCountry] = useState(''); // New state for country filter


  const [searchParams,setSearchParams]=useSearchParams();
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("fetching request")
      const response = await api.get('/jobs/jobs', {
        params: {
          page: currentPage,
          limit: 10,
          q: searchQuery || undefined,
          city: location || undefined,
          country: country || undefined,
          skills: skills || undefined,
          role: jobRole || undefined,
        }
      });
      
      console.log(response);
      if (response.status!=200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = response.data
      console.log(data);
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

  useEffect(() => {
    fetchJobs();
  }, [currentPage, searchQuery, location, country, skills, jobRole]); // Re-fetch when filters change

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
    setCurrentPage(1); // Reset to first page on new search
    fetchJobs();
  };

  const handleRefreshJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/jobs/jobs/fetch-and-store');
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = response.data;
      alert(data.message); // Show a success message
      fetchJobs(); // Re-fetch jobs from your DB after storing
    } catch (e) {
      setError('Failed to refresh jobs from external API: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setSearchParams({page:newPage})    // this will set page no in the url
    setCurrentPage(newPage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12">
        {/* Search Section */}
        <div className="bg-[#4f3ff0] rounded-2xl p-8 mb-8 flex flex-col items-center">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Find Your Dream Job
          </h1>
          <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="relative flex-1 w-full">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
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
                className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-gray-800"
              />
            </div>
            <div className="relative flex-1 w-full">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
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
                className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-gray-800"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-center w-full max-w-3xl">
            <button
              onClick={handleSearch}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 flex items-center justify-center"
            >
              <svg
                className="h-5 w-5 mr-2"
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
              Search Jobs
            </button>
            <button
              onClick={handleRefreshJobs}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 flex items-center justify-center"
              disabled={loading}
            >
              <svg
                className="h-5 w-5 mr-2"
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
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{totalJobs}</span> jobs
          </p>
          {console.log(error)}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Filters</h3>
              
              <div className="space-y-6">
                {/* Job Role Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Job Role</h4>
                  <div className="space-y-2">
                    {[
                      'Software Development',
                      'Design',
                      'Marketing',
                      'Sales',
                      'Data Science',
                      'Product Management',
                      'Customer Support',
                      'Operations'
                    ].map((role) => (
                      <label key={role} className="flex items-center text-gray-600 hover:text-gray-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={jobRole === role}
                          onChange={() => handleFilterChange('role', jobRole === role ? '' : role)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                          disabled={loading}
                        />
                        <span className="ml-2">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Location</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">City</label>
                      <input
                        type="text"
                        name="location"
                        placeholder="Enter city"
                        value={location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Country</label>
                      <input
                        type="text"
                        name="country"
                        placeholder="Enter country"
                        value={country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Skills Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Skills</h4>
                  <input
                    type="text"
                    name="skills"
                    placeholder="Enter skills (e.g., React, Node.js)"
                    value={skills}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3 space-y-6">
            {loading && <p className="text-center text-indigo-600">Loading jobs...</p>}
            {error && <p className="text-center text-red-500">Error: {error}</p>}
            {!loading && jobs.length === 0 && !error && (
              <p className="text-center text-gray-600">No jobs found matching your criteria.</p>
            )}
            {!loading && jobs.length > 0 && jobs.map((job) => (
              <div
                key={job.id} // Use job._id from MongoDB if available, or apijobsId
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 cursor-pointer transition-colors">
                    {job.title}
                  </h2>
                  {/* <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                    {job.employmentType}
                  </span> */}
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {job.hiringOrganizationLogo && (
                      <img
                        src={job.hiringOrganizationLogo}
                        alt={job.hiringOrganizationName}
                        className="h-8 w-8 object-contain rounded-full"
                      />
                    )}
                    <h3 className="text-lg text-gray-700 font-medium">{job.hiringOrganizationName}</h3>
                  </div>
                  <div className="flex items-center text-gray-500 mt-1">
                    <svg
                      className="h-4 w-4 mr-1"
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
                    <span>{job.city}{job.region ? `, ${job.region}` : ''}{job.country ? `, ${job.country}` : ''}</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {/* <p className="text-green-600 font-semibold">{job.salaryMin && job.salaryMax ? `$${job.salaryMin} - $${job.salaryMax} ${job.salaryCurrency ? job.salaryCurrency : ''} ${job.salaryPeriod ? job.salaryPeriod : ''}` : 'Salary not specified'}</p> */}
                  <p className="text-gray-600 leading-relaxed line-clamp-3">{job.description}</p>
                  <p className="text-sm text-gray-500">Posted {new Date(job.publishedAt).toLocaleDateString()}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200">
                    Apply Now
                  </a>
                  <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-4 py-2 rounded-lg ${currentPage === index + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
