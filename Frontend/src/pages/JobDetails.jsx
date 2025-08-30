import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../service/api.js';

export default function JobDetails() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      setError(null);

      console.log("Fetching job data from API...");
      try {
        const response = await api.get(`/jobs/jobs/${jobId}`);
        console.log(response);
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setJob(response.data.data);
      } catch (e) {
        console.error("Failed to fetch job details:", e);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

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

  const formatLocation = () => {
    if (job.city || job.region || job.country) {
      return `${job.city || ''}${job.region ? `, ${job.region}` : ''}${job.country ? `, ${job.country}` : ''}`.trim();
    }
    return 'Location not specified';
  };

  const parseDescription = (description) => {
    if (!description) return null;

    const lines = description.split('\n');
    const elements = [];
    let currentList = [];
    let inList = false;

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul className="list-disc list-inside space-y-1 mb-4 text-gray-700" key={`ul-${elements.length}`}>
            {currentList.map((item, idx) => (
              <li key={`li-${elements.length}-${idx}`} className="leading-relaxed">
                <span className="whitespace-pre-wrap">{item}</span>
              </li>
            ))}
          </ul>
        );
        currentList = [];
        inList = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('*')) {
        flushList();
        currentList.push(trimmedLine.substring(1).trim());
        inList = true;
      } else {
        flushList();

        if (trimmedLine === '') {
          continue;
        }

        let isHeading = false;
        if (trimmedLine.endsWith(':') && trimmedLine.length < 100) {
          isHeading = true;
        } else {
          const nextNonEmptyLineIdx = lines.slice(i + 1).findIndex(l => l.trim() !== '');
          if (nextNonEmptyLineIdx !== -1) {
            const actualNextLineIdx = i + 1 + nextNonEmptyLineIdx;
            if (actualNextLineIdx < lines.length && lines[actualNextLineIdx].trim().startsWith('*')) {
              if (nextNonEmptyLineIdx > 0) {
                isHeading = true;
              }
            }
          }
        }

        if (isHeading) {
          elements.push(<h3 key={`h-${i}`} className="text-xl font-semibold text-gray-900 mt-6 mb-2">{trimmedLine}</h3>);
        } else {
          elements.push(<span key={`p-${i}`} className="text-gray-700 leading-relaxed mb-4">{line}</span>);
        }
        inList = false;
      }
    }

    flushList();

    return elements;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-4 text-lg text-gray-600">Loading Job Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-4xl text-red-600 font-bold mb-4">Oops!</h2>
        <p className="text-gray-700 text-xl mb-6">{error}</p>
        <Link to="/jobs" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
          Go Back to Job Listings
        </Link>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-4xl text-gray-800 font-bold mb-4">Job Not Found</h2>
        <p className="text-gray-600 text-xl mb-6">The job you are looking for does not exist or has been removed.</p>
        <Link to="/jobs" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
          Go Back to Job Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8 mt-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="relative p-8 lg:p-12 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
          <Link to="/jobs" className="absolute top-8 left-8 flex items-center text-indigo-100 hover:text-white transition-colors text-sm font-medium">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Jobs
          </Link>
          <div className="mt-8 flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8">
            {job.hiringOrganizationLogo && (
              <img src={job.hiringOrganizationLogo} alt={`${job.hiringOrganizationName} logo`} className="h-20 w-20 object-contain rounded-full bg-white p-2 shadow-lg" />
            )}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-1">{job.title}</h1>
              <p className="text-indigo-200 text-xl font-medium">{job.hiringOrganizationName}</p>
              <p className="text-indigo-300 mt-1">{formatLocation()}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 lg:p-12">
          {/* Job Overview */}
          <div className="border-b pb-8 mb-8 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3 text-gray-600">
                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-1.272-8.455-3.355L1 9.499V4.5M4.5 9.499l7.5 7.5 7.5-7.5M4.5 4.5l7.5 7.5 7.5-7.5" />
                </svg>
                <span><span className="font-semibold text-gray-800">Type:</span> {job.employmentType || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span><span className="font-semibold text-gray-800">Posted:</span> {formatDate(job.publishedAt)}</span>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="prose max-w-none text-gray-700">
            {parseDescription(job.description)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-8 lg:p-12 bg-gray-50 flex flex-col sm:flex-row justify-center gap-4">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-full transition-colors duration-300 shadow-lg transform hover:scale-105"
          >
            Apply Now
          </a>
          <Link
            to="/jobs"
            className="w-full sm:w-auto text-center bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold py-4 px-10 rounded-full transition-colors duration-300 transform hover:scale-105"
          >
            Back to Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}