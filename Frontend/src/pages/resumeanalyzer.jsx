import React, { useState } from 'react';
import { FiUpload, FiFileText, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import api from '../service/api';

export default function Resumeanalyzer() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf' || 
          file.type === 'application/msword' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setResumeFile(file);
        setError(null);
      } else {
        setError('Please upload a PDF or Word document');
        setResumeFile(null);
      }
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeFile || !jobDescription.trim()) {
      setError('Please provide both a resume and job description');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      console.log("Starting resume analysis...");
      
      // Create FormData object
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobDescription', jobDescription);

      // Make the API request using the existing api instance
      const response = await api.post('/resume/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("Resume upload response:", response);

      if (response.status === 200) {
        // TODO: Add job description analysis API call here
        // For now, using mock data
        setAnalysisResults({
          score: 85,
          missingKeywords: ['React', 'TypeScript', 'AWS'],
          suggestions: [
            'Add experience with React and TypeScript',
            'Include AWS cloud experience',
            'Highlight leadership experience'
          ],
          matchedKeywords: ['JavaScript', 'Node.js', 'MongoDB']
        });
      } else {
        throw new Error('Failed to upload resume');
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.response?.data?.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Resume Analyzer</h1>
          <p className="text-lg text-gray-600">
            Upload your resume and job description to get personalized feedback
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleAnalyze} className="space-y-8">
            {/* Resume Upload Section */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-gray-900">
                Upload Your Resume
              </label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors duration-200">
                <div className="space-y-2 text-center">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="resume-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="resume-upload"
                        name="resume"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, or DOCX up to 5MB
                  </p>
                </div>
              </div>
              {resumeFile && (
                <div className="flex items-center text-sm text-gray-600">
                  <FiFileText className="h-5 w-5 mr-2" />
                  <span>{resumeFile.name}</span>
                </div>
              )}
            </div>

            {/* Job Description Section */}
            <div className="space-y-4">
              <label htmlFor="job-description" className="block text-lg font-medium text-gray-900">
                Job Description
              </label>
              <textarea
                id="job-description"
                name="job-description"
                rows="6"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg resize-none"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isAnalyzing}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white ${
                  isAnalyzing
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-[1.02]`}
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  'Analyze Resume'
                )}
              </button>
            </div>
          </form>

          {/* Analysis Results */}
          {analysisResults && (
            <div className="mt-12 space-y-8">
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Analysis Results</h2>
                
                {/* Score Display */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">Relevance Score</h3>
                    <span className="text-2xl font-bold text-indigo-600">{analysisResults.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${analysisResults.score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Matched Keywords */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Matched Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResults.matchedKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                      >
                        <FiCheckCircle className="mr-2 " />
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Missing Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResults.missingKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                      >
                        <FiAlertCircle className="mr-1.5 h-4 w-4" />
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Suggestions for Improvement</h3>
                  <ul className="space-y-3">
                    {analysisResults.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 text-sm font-medium">{index + 1}</span>
                        </span>
                        <p className="ml-3 text-gray-700">{suggestion}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
