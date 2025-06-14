import React from 'react';
import { Link } from 'react-router-dom';

export default function JobCard({ job, index }) {
  // Format location string based on available data
  const formatLocation = () => {
    if (job.city || job.region || job.country) {
      return `${job.city || ''}${job.region ? `, ${job.region}` : ''}${job.country ? `, ${job.country}` : ''}`.trim();
    }
    return 'Location not specified';
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <div
      key={job._id || job.id}
      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1 animate-slide-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 hover:text-[#4f3ff0] cursor-pointer transition-colors">
            {job.title}
          </h2>
          {job.jobCode && (
            <span className="text-sm text-gray-500">Job Code: {job.jobCode}</span>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {job.employmentType && (
            <span className="bg-[#4f3ff0]/10 text-[#4f3ff0] text-sm font-medium px-3 py-1 rounded-full">
              {job.employmentType}
            </span>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          {job.hiringOrganizationLogo && (
            <img
              src={job.hiringOrganizationLogo}
              alt={job.hiringOrganizationName}
              className="h-8 w-8 object-contain rounded-full animate-float"
            />
          )}
          <h3 className="text-lg text-gray-700 font-medium">{job.hiringOrganizationName}</h3>
        </div>
        <div className="flex items-center text-gray-500 mt-1">
          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{formatLocation()}</span>
        </div>
      </div>
      
      {/* Display Preferred Skills as Tags */}
      {job.preferredSkills?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {job.preferredSkills.map((skill, idx) => (
            <span 
              key={idx} 
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* New sections for Job Offer, Start Date, Openings, Experience */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4 text-gray-600 text-sm">
        {job.salary && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0h4m-1 5h1m-6 0h1m-1 2h2m-6 0h1" /></svg>
            <span>Job Offer: {job.salary}</span>
          </div>
        )}
        {job.startDate && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>Start Date: {job.startDate}</span>
          </div>
        )}
        {job.openings && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354l-7.243 7.243m14.486 0L12 4.354m-7.243 7.243a9 9 0 1114.486 0M12 15h.01" /></svg>
            <span>#Openings: {job.openings}</span>
          </div>
        )}
        {job.experience && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0s1 10-8 10-8-10-8-10M4 20v-6a2 2 0 012-2h12a2 2 0 012 2v6" /></svg>
            <span>Experience: {job.experience}</span>
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-500 mb-4 flex justify-between items-center">
        {job.applicants && (
          <p className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2h2m13-11H7m14 0v9a2 2 0 01-2 2H7a2 2 0 01-2-2V10m16 0l-3-3m-4-3l-3 3" /></svg>
            <span>Applicants: {job.applicants}</span>
          </p>
        )}
        <p className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Posted {formatDate(job.publishedAt)}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#4f3ff0] hover:bg-[#3f2fd0] text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center group"
          >
            Apply Now
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
          <Link
            to={`/jobs/${job._id}`}
            state={{ job: job }}
            className="bg-white border-2 border-[#4f3ff0] text-[#4f3ff0] hover:bg-[#4f3ff0] hover:text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center group"
          >
            View Details
            <svg className="w-4 h-4 ml-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <button className="text-gray-400 hover:text-red-500 transition-all duration-200 transform hover:scale-110">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Move styles to a separate CSS file or use styled-components
const styles = `
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
`; 