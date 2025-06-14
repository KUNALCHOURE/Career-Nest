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
          <ul className="space-y-2 mb-4" key={`ul-${elements.length}`}>
            {currentList.map((item, idx) => (
              <li key={`li-${elements.length}-${idx}`} className="flex items-start">
                <span className="flex-shrink-0 w-2 h-2 mt-2 mr-2 rounded-full bg-[#4f3ff0]"></span>
                <span className="ml-2 text-gray-700 leading-relaxed whitespace-pre-wrap">{item}</span>
              </li>
            ))}
          </ul>
        );
        currentList = [];
        inList = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]; // Keep original line for better formatting, will trim for checks
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('*')) {
        flushList(); // Flush previous list if any
        currentList.push(trimmedLine.substring(1).trim());
        inList = true;
      } else if (inList && trimmedLine !== '') {
        // If we are in a list and the current line is not empty, it's a continuation
        currentList[currentList.length - 1] += '\n' + line; // Append to last item with a newline and original line to preserve indentation
      } else {
        flushList(); // Flush any accumulated list

        if (trimmedLine === '') {
          // Only add a paragraph for a truly empty line if it's not within a list context
          // This prevents excessive spacing in parsed description
          if (!inList && (i === 0 || lines[i - 1].trim() !== '')) {
            elements.push(<p key={`p-empty-${i}`} className="mb-1"></p>); // Add an empty paragraph for visual gap
          }
          continue; 
        }

        // Heuristic for identifying headings:
        // 1. Ends with a colon (e.g., "Travel Requirements:")
        // 2. Or, is followed by at least one empty line, AND then a bullet point list
        let isHeading = false;
        if (trimmedLine.endsWith(':') && trimmedLine.length < 100) {
            isHeading = true;
        } else {
            const nextNonEmptyLineIdx = lines.slice(i + 1).findIndex(l => l.trim() !== '');
            if (nextNonEmptyLineIdx !== -1) {
                const actualNextLineIdx = i + 1 + nextNonEmptyLineIdx;
                if (actualNextLineIdx < lines.length && lines[actualNextLineIdx].trim().startsWith('*')) {
                    if (nextNonEmptyLineIdx > 0) { // Check if there's a gap (one or more empty lines)
                        isHeading = true;
                    }
                }
            }
        }

        if (isHeading) {
          elements.push(<h3 key={`h-${i}`} className="text-xl font-semibold text-gray-800 mt-4 mb-2">{trimmedLine}</h3>);
        } else {
          elements.push(<p key={`p-${i}`} className="text-gray-700 leading-relaxed mb-1">{trimmedLine}</p>);
        }
        inList = false; // Reset inList when a non-list item is encountered
      }
    }

    flushList(); // Flush any remaining list at the end

    return elements;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#4f3ff0]"></div>
        <p className="ml-4 text-xl text-gray-700">Loading Job Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-3xl text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 text-lg mb-6">{error}</p>
        <Link to="/jobs" className="bg-[#4f3ff0] hover:bg-[#3f2fd0] text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md">
          Go Back to Job Listings
        </Link>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-3xl text-gray-700 mb-4">Job Not Found</h2>
        <p className="text-gray-600 text-lg mb-6">The job you are looking for does not exist or has been removed.</p>
        <Link to="/jobs" className="bg-[#4f3ff0] hover:bg-[#3f2fd0] text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md">
          Go Back to Job Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 animate-fade-in-up">
        <Link to="/jobs" className="text-[#4f3ff0] hover:text-[#3f2fd0] flex items-center mb-6 font-medium transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Jobs
        </Link>

        {/* Job Header */}
        <div className="flex items-center space-x-4 mb-8">
          {job.hiringOrganizationLogo && (
            <img src={job.hiringOrganizationLogo} alt={job.hiringOrganizationName} className="h-16 w-16 object-contain rounded-full border border-gray-200" />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{job.title}</h1>
            <p className="text-xl text-gray-700">{job.hiringOrganizationName} | {formatLocation()}</p>
          </div>
        </div>

        {/* Job Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
          <h2 className="col-span-full text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-[#4f3ff0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Job Overview
          </h2>
          {job.employmentType && (
            <div className="flex items-center text-lg text-gray-700 bg-white p-3 rounded-lg shadow-sm">
              <svg className="w-5 h-5 mr-2 text-[#4f3ff0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-1.272-8.455-3.355L1 9.499V4.5M4.5 9.499l7.5 7.5 7.5-7.5M4.5 4.5l7.5 7.5 7.5-7.5" />
              </svg>
              <span><span className="font-semibold">Type:</span> {job.employmentType}</span>
            </div>
          )}
          {job.publishedAt && (
            <div className="flex items-center text-lg text-gray-700 bg-white p-3 rounded-lg shadow-sm">
              <svg className="w-5 h-5 mr-2 text-[#4f3ff0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span><span className="font-semibold">Posted:</span> {formatDate(job.publishedAt)}</span>
            </div>
          )}
        </div>

        {/* Company Information */}
        {job.hiringOrganizationName && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-[#4f3ff0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              About {job.hiringOrganizationName}
            </h2>
            {job.website && (
              <p className="text-gray-700 leading-relaxed">
                Visit their website: <a href={`https://${job.website}`} target="_blank" rel="noopener noreferrer" className="text-[#4f3ff0] hover:underline">{job.website}</a>
              </p>
            )}
          </div>
        )}

        {/* Job Description */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-[#4f3ff0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Job Description
          </h2>
          <div className="prose max-w-none">
            {parseDescription(job.description)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 py-8">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#4f3ff0] hover:bg-[#3f2fd0] text-white font-medium px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl flex items-center group text-lg"
          >
            Apply Now
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
          <Link to="/jobs" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl flex items-center text-lg">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
} 