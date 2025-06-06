import React, { useState, useEffect } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('recent');
  const [notifications, setNotifications] = useState(3);

  const recentJobs = [
    { id: 1, title: 'Senior React Developer', company: 'TechCorp', location: 'Remote', type: 'Full-time', posted: '2 hours ago', match: '95%' },
    { id: 2, title: 'Product Manager', company: 'StartupXYZ', location: 'San Francisco', type: 'Full-time', posted: '5 hours ago', match: '88%' },
    { id: 3, title: 'UX Designer', company: 'DesignStudio', location: 'New York', type: 'Contract', posted: '1 day ago', match: '92%' },
  ];

  const applications = [
    { id: 1, title: 'Frontend Engineer', company: 'WebTech', status: 'Interview Scheduled', date: 'Tomorrow 2:00 PM', statusColor: 'text-blue-600 bg-blue-50' },
    { id: 2, title: 'Full Stack Developer', company: 'InnovateCo', status: 'Under Review', date: 'Applied 3 days ago', statusColor: 'text-yellow-600 bg-yellow-50' },
    { id: 3, title: 'Software Engineer', company: 'DevCorp', status: 'Accepted', date: 'Offer received', statusColor: 'text-green-600 bg-green-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Alex!</h1>
                <p className="text-gray-600">You have {notifications} new job matches and 2 interview invitations</p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-3">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center">
                  <i className="fas fa-search mr-2"></i>
                  Browse Jobs
                </button>
                <button className="border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center">
                  <i className="fas fa-user-edit mr-2"></i>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">124</p>
                <p className="text-sm text-green-600">+12% this week</p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg">
                <i className="fas fa-eye text-indigo-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
                <p className="text-sm text-blue-600">3 active</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <i className="fas fa-paper-plane text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Job Matches</p>
                <p className="text-2xl font-bold text-gray-900">47</p>
                <p className="text-sm text-green-600">5 new today</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <i className="fas fa-bullseye text-green-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
                <p className="text-sm text-orange-600">1 this week</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <i className="fas fa-calendar-check text-orange-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Recommendations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab('recent')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        activeTab === 'recent' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Recent
                    </button>
                    <button
                      onClick={() => setActiveTab('matches')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        activeTab === 'matches' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Best Matches
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
                          <p className="text-gray-600">{job.company}</p>
                        </div>
                        <div className="text-right">
                          <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                            {job.match} match
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <i className="fas fa-map-marker-alt mr-1"></i>
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <i className="fas fa-briefcase mr-1"></i>
                          {job.type}
                        </div>
                        <div className="flex items-center">
                          <i className="fas fa-clock mr-1"></i>
                          {job.posted}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                          Apply Now
                        </button>
                        <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                          Save for Later
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                    View All Recommendations →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
           

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <div className="bg-blue-50 p-2 rounded-lg mr-3">
                      <i className="fas fa-file-upload text-blue-600"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Update Resume</p>
                      <p className="text-sm text-gray-600">Last updated 2 weeks ago</p>
                    </div>
                  </button>

                  <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <div className="bg-green-50 p-2 rounded-lg mr-3">
                      <i className="fas fa-chart-line text-green-600"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Skill Assessment</p>
                      <p className="text-sm text-gray-600">Boost your profile score</p>
                    </div>
                  </button>

                  <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <div className="bg-purple-50 p-2 rounded-lg mr-3">
                      <i className="fas fa-bell text-purple-600"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Job Alerts</p>
                      <p className="text-sm text-gray-600">Manage notifications</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Strength */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Profile Strength</h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Completion</span>
                    <span className="font-medium text-gray-900">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Professional summary added
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Work experience complete
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-times text-red-500 mr-2"></i>
                    Add skills and certifications
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
