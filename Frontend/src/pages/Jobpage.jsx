import React, { useState } from 'react';

export default function Jobpage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('all');

  // Mock job data - replace with actual API call later
  const jobs = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$120k - $150k',
      description: 'Looking for an experienced software engineer to join our dynamic team. You will work on cutting-edge projects and collaborate with talented professionals.',
      posted: '2 days ago'
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'Web Solutions',
      location: 'Remote',
      type: 'Contract',
      salary: '$90k - $110k',
      description: 'Join our team as a frontend developer working with React and modern web technologies. Perfect opportunity for remote work.',
      posted: '1 week ago'
    },
    {
      id: 3,
      title: 'Product Manager',
      company: 'Innovation Labs',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$130k - $160k',
      description: 'Lead product strategy and work with cross-functional teams to deliver exceptional user experiences.',
      posted: '3 days ago'
    },
    {
      id: 4,
      title: 'UX Designer',
      company: 'Design Studio',
      location: 'Los Angeles, CA',
      type: 'Part-time',
      salary: '$60k - $80k',
      description: 'Create beautiful and intuitive user experiences for web and mobile applications.',
      posted: '5 days ago'
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', { searchQuery, location, jobType });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'searchQuery') {
      setSearchQuery(value);
    } else if (name === 'location') {
      setLocation(value);
    }
  };

  const handleSelectChange = (e) => {
    setJobType(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12">
        {/* Search Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Find Your Dream Job
          </h1>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-2 relative">
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
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
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="relative">
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
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
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <select
                value={jobType}
                onChange={handleSelectChange}
                className="px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleSearch}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <svg
                  className="h-5 w-5"
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
                <span>Search Jobs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{jobs.length}</span> jobs
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Filters</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Experience Level</h4>
                  <div className="space-y-2">
                    <label className="flex items-center text-gray-600 hover:text-gray-900 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                      <span className="ml-2">Entry Level</span>
                    </label>
                    <label className="flex items-center text-gray-600 hover:text-gray-900 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                      <span className="ml-2">Mid Level</span>
                    </label>
                    <label className="flex items-center text-gray-600 hover:text-gray-900 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                      <span className="ml-2">Senior Level</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Salary Range</h4>
                  <div className="space-y-2">
                    <label className="flex items-center text-gray-600 hover:text-gray-900 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                      <span className="ml-2">$0 - $50k</span>
                    </label>
                    <label className="flex items-center text-gray-600 hover:text-gray-900 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                      <span className="ml-2">$50k - $100k</span>
                    </label>
                    <label className="flex items-center text-gray-600 hover:text-gray-900 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                      <span className="ml-2">$100k+</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Company Size</h4>
                  <div className="space-y-2">
                    <label className="flex items-center text-gray-600 hover:text-gray-900 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                      <span className="ml-2">Startup (1-50)</span>
                    </label>
                    <label className="flex items-center text-gray-600 hover:text-gray-900 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                      <span className="ml-2">Medium (51-500)</span>
                    </label>
                    <label className="flex items-center text-gray-600 hover:text-gray-900 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                      <span className="ml-2">Large (500+)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3 space-y-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 cursor-pointer transition-colors">
                    {job.title}
                  </h2>
                  <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                    {job.type}
                  </span>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg text-gray-700 font-medium">{job.company}</h3>
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
                    <span>{job.location}</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-green-600 font-semibold">{job.salary}</p>
                  <p className="text-gray-600 leading-relaxed">{job.description}</p>
                  <p className="text-sm text-gray-500">Posted {job.posted}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200">
                    Apply Now
                  </button>
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
      </div>
    </div>
  );
}
