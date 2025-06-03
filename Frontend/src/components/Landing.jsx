import React, { useState, useEffect } from 'react';


function Landing() {
const Search = (props) => <i className="fas fa-search" {...props}></i>;
const Users = (props) => <i className="fas fa-users" {...props}></i>;
const Building2 = (props) => <i className="fas fa-building" {...props}></i>;
const Database = (props) => <i className="fas fa-database" {...props}></i>;
const TrendingUp = (props) => <i className="fas fa-chart-line" {...props}></i>;
const Brain = (props) => <i className="fas fa-brain" {...props}></i>;
const Target = (props) => <i className="fas fa-bullseye" {...props}></i>;
const Zap = (props) => <i className="fas fa-bolt" {...props}></i>;
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-white py-24 lg:py-32">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center bg-gray-800/50 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-gray-700">
              <i className="fas fa-brain w-5 h-5 mr-3 text-blue-400"></i>
              <span className="text-sm font-medium text-gray-300">Intelligent Career Matching Platform</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-white">
              Accelerate Your
              <br />
              <span className="text-blue-400">Career Growth</span>
            </h1>

            <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Connect with opportunities that match your expertise through our advanced AI-powered job matching platform designed for professionals
            </p>

            <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16">
              <button className="group bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center shadow-lg hover:shadow-xl">
                Find Opportunities
                <i className="fas fa-chevron-right w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"></i>
              </button>
              <button className="group border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center">
                Upload Resume
                <i className="fas fa-upload w-5 h-5 ml-2"></i>
              </button>
            </div>

            {/* Professional Search Bar */}
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-2">
                  <div className="flex items-center">
                    <Search className="w-6 h-6 text-gray-400 ml-4" />
                    <input
                      type="text"
                      placeholder="Search by job title, skills, or company name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-4 py-4 bg-transparent text-white text-lg focus:outline-none placeholder-gray-400"
                    />
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-300">
                      Search Jobs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Users, number: '25,000+', label: 'Active Professionals', color: 'text-blue-400' },
              { icon: Building2, number: '5,000+', label: 'Partner Companies', color: 'text-gray-400' },
              { icon: Database, number: '15,000+', label: 'Job Openings', color: 'text-blue-400' },
              { icon: TrendingUp, number: '94%', label: 'Success Rate', color: 'text-gray-400' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`${stat.color} mb-4 flex justify-center`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Professional Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive tools and intelligent systems designed to streamline your job search and career advancement
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Matching',
                description: 'Advanced algorithms analyze your profile and match you with highly relevant opportunities based on skills, experience, and career objectives.',
                bgColor: 'bg-gray-800',
                iconColor: 'text-blue-400'
              },
              {
                icon: Target,
                title: 'Skill Gap Analysis',
                description: 'Gain insights into the skills required for your target roles and get actionable suggestions to bridge any gaps for professional development.',
                bgColor: 'bg-gray-800',
                iconColor: 'text-gray-400'
              },
              {
                icon: Database,
                title: 'Extensive Job Database',
                description: 'Access to thousands of verified job opportunities from leading companies across various industries and experience levels, sourced from apijobs.dev and more.',
                bgColor: 'bg-gray-800',
                iconColor: 'text-blue-400'
              },
              {
                icon: Zap,
                title: 'Real-Time Updates & Alerts',
                description: 'Receive instant notifications for new job matches and application status updates to keep you informed throughout your search.',
                bgColor: 'bg-gray-800',
                iconColor: 'text-gray-400'
              }
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-gray-800 rounded-xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700 h-full">
                  <div className={`${feature.bgColor} w-16 h-16 rounded-lg flex items-center justify-center mb-6 border border-gray-600`}>
                    <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A streamlined process designed to connect you with the right opportunities efficiently and effectively
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Upload Your Profile',
                description: 'Easily upload your resume. Our AI will automatically parse it to create your comprehensive professional profile.'
              },
              {
                step: '02',
                title: 'Get Personalized Matches',
                description: 'Instantly receive job recommendations tailored to your skills and experience, found among thousands of daily listings.'
              },
              {
                step: '03',
                title: 'Analyze & Grow',
                description: 'Deep dive into specific jobs with AI-powered skill gap analysis, helping you understand what to learn next to land your dream role.'
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-600 w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-8">
                  <span className="text-white text-2xl font-bold">{step.step}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-6">{step.title}</h3>
                <p className="text-gray-300 leading-relaxed text-lg">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Ready to Advance Your Career?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join thousands of professionals who have successfully found their ideal positions through our platform
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg font-semibold text-lg transition-colors duration-300 shadow-lg hover:shadow-xl">
                Get Started Today
              </button>
              <button className="border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;