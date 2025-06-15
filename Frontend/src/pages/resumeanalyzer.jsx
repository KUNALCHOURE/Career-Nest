import React, { useState } from 'react';
import { FiUpload, FiFileText, FiCheckCircle, FiAlertCircle, FiLinkedin, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import api from '../service/api';
import sampleAnalysis from '../../../Backend/utils/sampleResumeAnalysis.js';

export default function Resumeanalyzer() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('withJD'); 

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
    if (!resumeFile) {
      setError('Please upload a resume');
      return;
    }
    if (analysisMode === 'withJD' && !jobDescription.trim()) {
      setError('Please provide a job description');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Simulate API delay
      // await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use sample analysis data instead of making API calls
      // setAnalysisResults(sampleAnalysis);

      /* Original API calls - commented out for development
      console.log("Starting resume analysis...");
      
      // First extract the text from the resume
      const formData = new FormData();
      formData.append('resume', resumeFile);
      
      const extractResponse = await api.post('/resume/extract-data', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(extractResponse);
      if (!extractResponse.data.data.extraction.success) {
        throw new Error('Failed to extract text from resume');
      }

      const extractedText = extractResponse.data.data.content;
      console.log(extractedText);
      console.log("Text extracted successfully");

      // Then analyze based on mode
      let analysisResponse;
      if (analysisMode === 'withJD') {
        analysisResponse = await api.post('/resume/analyze-resume-withJD', {
          resumeText: extractedText,
          jobDescription
        });
      } else {
        analysisResponse = await api.post('/resume/analyze-resume-witoutJD', {
          resumeText: extractedText
        });
      }
      console.log(analysisResponse);

      if (analysisResponse.status === 200) {
        setAnalysisResults(analysisResponse.data.data);
      } else {
        throw new Error('Failed to analyze resume');
      }
      */
      console.log("Starting resume analysis...");
      
      // First extract the text from the resume
      const formData = new FormData();
      formData.append('resume', resumeFile);
      
      const extractResponse = await api.post('/resume/extract-data', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(extractResponse);
      if (!extractResponse.data.data.extraction.success) {
        throw new Error('Failed to extract text from resume');
      }

      const extractedText = extractResponse.data.data.content;
      console.log(extractedText);
      console.log("Text extracted successfully");

      // Then analyze based on mode
      if (analysisMode === 'withJD') {
console.log("withjd")
        const analysisResponseWithJD = await api.post('/resume/analyze-resume-withJD', {
          resumeText: extractedText,
          jobDescription
        });
        if (analysisResponseWithJD.status === 200) {
          console.log(analysisResponseWithJD.data.data);
          setAnalysisResults(analysisResponseWithJD.data.data);
        } else {
          throw new Error('Failed to analyze resume with JD');
        }
      } else if (analysisMode === 'withoutJD') {
        console.log("in withoutjd")
        const analysisResponseWithoutJD = await api.post('/resume/analyze-resume-witoutJD', {
          resumeText: extractedText
        });
        if (analysisResponseWithoutJD.status === 200) {
          console.log(analysisResponseWithoutJD.data.data);
          setAnalysisResults(analysisResponseWithoutJD.data.data);
        } else {
          throw new Error('Failed to analyze resume without JD');
        }
      } else {
        throw new Error("Invalid analysis mode");
      }

    } catch (err) {
      console.error("Analysis error:", err);
      setError('Failed to analyze resume. Please try again.');
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
            Upload your resume and get personalized feedback
          </p>
        </div>

       
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setAnalysisMode('withJD')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              analysisMode === 'withJD'
                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            With Job Description
          </button>
          <button
            onClick={() => setAnalysisMode('withoutJD')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              analysisMode === 'withoutJD'
                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Without Job Description
          </button>
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

          
            {analysisMode === 'withJD' && (
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
            )}

    
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

       
          {analysisResults && (
            <div className="mt-12 space-y-8">
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Detailed Analysis</h2>
                
                {/* Overall Summary */}
                {analysisResults.summary && (
                  <div className="bg-indigo-50 p-6 rounded-xl shadow-md mb-8">
                    <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center">
                      <FiFileText className="mr-3 text-indigo-600" /> Overall Summary
                    </h3>
                    {analysisResults.summary.overall_impression && (
                      <p className="text-gray-800 leading-relaxed mb-4">{analysisResults.summary.overall_impression}</p>
                    )}
                    {analysisResults.summary.job_match_score !== undefined && analysisResults.summary.job_match_score !== null && (
                        <div className="mb-4">
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">Job Match Score:</h4>
                            <p className="text-2xl font-bold text-indigo-700">{analysisResults.summary.job_match_score}%</p>
                        </div>
                    )}
                    {analysisResults.summary.key_sections_found?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">Key Sections Found:</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisResults.summary.key_sections_found.map((section, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 transition-colors duration-200 hover:bg-indigo-200"
                            >
                              <FiCheckCircle className="mr-2" />
                              {section}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {analysisResults.summary.strengths?.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">Strengths for this Role:</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-800">
                          {analysisResults.summary.strengths.map((strength, index) => (
                            <li key={index}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysisResults.summary.areas_for_improvement_based_on_jd?.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">Areas for Improvement (Based on JD):</h4>
                            <ul className="list-disc list-inside space-y-1 text-gray-800">
                                {analysisResults.summary.areas_for_improvement_based_on_jd.map((area, index) => (
                                    <li key={index}>{area}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                  </div>
                )}

                {/* Extracted Data */}
                {analysisResults.extracted_data && (
                  <div className="mb-8 space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Extracted Information</h3>
                    
                    {/* Contact Info */}
                    {(analysisResults.extracted_data.name || 
                      analysisResults.extracted_data.email || 
                      analysisResults.extracted_data.phone || 
                      analysisResults.extracted_data.location || 
                      analysisResults.extracted_data.linkedin) && (
                      <div className="bg-white p-6 rounded-xl shadow-md">
                        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                          <FiPhone className="mr-2 text-indigo-500" /> Contact Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                          {analysisResults.extracted_data.name && (
                            <div>
                              <p className="text-sm text-gray-600">Name</p>
                              <p className="font-medium">{analysisResults.extracted_data.name}</p>
                            </div>
                          )}
                          {analysisResults.extracted_data.email && (
                            <div>
                              <p className="text-sm text-gray-600">Email</p>
                              <p className="font-medium flex items-center"><FiMail className="mr-1" />{analysisResults.extracted_data.email}</p>
                            </div>
                          )}
                          {analysisResults.extracted_data.phone && (
                            <div>
                              <p className="text-sm text-gray-600">Phone</p>
                              <p className="font-medium flex items-center"><FiPhone className="mr-1" />{analysisResults.extracted_data.phone}</p>
                            </div>
                          )}
                          {analysisResults.extracted_data.location && (
                            <div>
                              <p className="text-sm text-gray-600">Location</p>
                              <p className="font-medium flex items-center"><FiMapPin className="mr-1" />{analysisResults.extracted_data.location}</p>
                            </div>
                          )}
                          {analysisResults.extracted_data.linkedin && (
                            <div>
                              <p className="text-sm text-gray-600">LinkedIn</p>
                              <p className="font-medium flex items-center">
                                <FiLinkedin className="mr-1" />
                                <a href={analysisResults.extracted_data.linkedin} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                  {analysisResults.extracted_data.linkedin}
                                </a>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Professional Summary/Objective */}
                    {analysisResults.extracted_data.objective_summary && (
                      <div className="bg-white p-6 rounded-xl shadow-md">
                        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                          <FiFileText className="mr-2 text-indigo-500" /> Professional Summary/Objective
                        </h4>
                        <p className="text-gray-700 leading-relaxed">
                          {analysisResults.extracted_data.objective_summary}
                        </p>
                      </div>
                    )}

                    {/* Skills */}
                    {analysisResults.extracted_data.skills?.length > 0 && (
                      <div className="bg-white p-6 rounded-xl shadow-md">
                        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                          <FiCheckCircle className="mr-2 text-indigo-500" /> Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisResults.extracted_data.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 transition-colors duration-200 hover:bg-green-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Work Experience */}
                    {analysisResults.extracted_data.work_experience?.length > 0 && (
                      <div className="bg-white p-6 rounded-xl shadow-md">
                        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                          <FiFileText className="mr-2 text-indigo-500" /> Work Experience
                        </h4>
                        <div className="space-y-6">
                          {analysisResults.extracted_data.work_experience.map((exp, index) => (
                            <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline mb-2">
                                <div>
                                  {exp.title && <p className="font-semibold text-lg text-gray-900">{exp.title}</p>}
                                  {exp.company && <p className="text-gray-700">{exp.company}</p>}
                                  {exp.location && <p className="text-sm text-gray-500 flex items-center"><FiMapPin className="mr-1" />{exp.location}</p>}
                                </div>
                                {exp.dates && <p className="text-sm text-gray-600 sm:text-right mt-2 sm:mt-0">{exp.dates}</p>}
                              </div>
                              {exp.responsibilities && (
                                <p className="text-sm text-gray-700 leading-relaxed">{exp.responsibilities}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {analysisResults.extracted_data.education?.length > 0 && (
                      <div className="bg-white p-6 rounded-xl shadow-md">
                        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                          <FiFileText className="mr-2 text-indigo-500" /> Education
                        </h4>
                        <div className="space-y-6">
                          {analysisResults.extracted_data.education.map((edu, index) => (
                            <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline mb-2">
                                <div>
                                  {edu.degree && <p className="font-semibold text-lg text-gray-900">{edu.degree}</p>}
                                  {edu.institution && <p className="text-gray-700">{edu.institution}</p>}
                                  {edu.location && <p className="text-sm text-gray-500 flex items-center"><FiMapPin className="mr-1" />{edu.location}</p>}
                                </div>
                                {edu.graduation_date && <p className="text-sm text-gray-600 sm:text-right mt-2 sm:mt-0">{edu.graduation_date}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {analysisResults.extracted_data.certifications?.length > 0 && (
                      <div className="bg-white p-6 rounded-xl shadow-md">
                        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                          <FiCheckCircle className="mr-2 text-indigo-500" /> Certifications
                        </h4>
                        <div className="space-y-6">
                          {analysisResults.extracted_data.certifications.map((cert, index) => (
                            <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline mb-2">
                                <div>
                                  {cert.name && <p className="font-semibold text-lg text-gray-900">{cert.name}</p>}
                                  {cert.issuer && <p className="text-gray-700">{cert.issuer}</p>}
                                </div>
                                {cert.date && <p className="text-sm text-gray-600 sm:text-right mt-2 sm:mt-0">{cert.date}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {analysisResults.extracted_data.projects?.length > 0 && (
                      <div className="bg-white p-6 rounded-xl shadow-md">
                        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                          <FiFileText className="mr-2 text-indigo-500" /> Projects
                        </h4>
                        <div className="space-y-6">
                          {analysisResults.extracted_data.projects.map((project, index) => (
                            <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                              {project.name && <p className="font-semibold text-lg text-gray-900">{project.name}</p>}
                              {project.description && (
                                <p className="text-gray-700 mt-1 leading-relaxed">{project.description}</p>
                              )}
                              {project.technologies?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {project.technologies.map((tech, techIndex) => (
                                    <span
                                      key={techIndex}
                                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 transition-colors duration-200 hover:bg-blue-200"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Job Description Analysis Section (Conditional for withJD mode) */}
                {analysisMode === 'withJD' && analysisResults.job_description_analysis && (
                  <div className="mb-8 space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Job Description Alignment</h3>
                    
                    {analysisResults.job_description_analysis.overall_match_analysis && (
                      <div className="bg-indigo-50 p-6 rounded-xl shadow-md">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                          <FiFileText className="mr-2 text-indigo-500" /> Overall Match Analysis
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{analysisResults.job_description_analysis.overall_match_analysis}</p>
                      </div>
                    )}

                    {analysisResults.job_description_analysis.required_skills_found?.length > 0 && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                                <FiCheckCircle className="mr-2 text-indigo-500" /> Required Skills Found
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {analysisResults.job_description_analysis.required_skills_found.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {analysisResults.job_description_analysis.matching_skills?.length > 0 && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                                <FiCheckCircle className="mr-2 text-indigo-500" /> Matching Skills
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {analysisResults.job_description_analysis.matching_skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {analysisResults.job_description_analysis.missing_required_skills?.length > 0 && (
                        <div className="bg-red-50 p-6 rounded-xl shadow-md">
                            <h4 className="font-bold text-red-800 mb-3 flex items-center">
                                <FiAlertCircle className="mr-2 text-red-500" /> Missing Required Skills
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-red-700">
                                {analysisResults.job_description_analysis.missing_required_skills.map((skill, index) => (
                                    <li key={index}>{skill}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {analysisResults.job_description_analysis.relevant_experience_match && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                                <FiFileText className="mr-2 text-indigo-500" /> Relevant Experience Match
                            </h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{analysisResults.job_description_analysis.relevant_experience_match}</p>
                        </div>
                    )}

                    {analysisResults.job_description_analysis.education_match && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                                <FiFileText className="mr-2 text-indigo-500" /> Education Match
                            </h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{analysisResults.job_description_analysis.education_match}</p>
                        </div>
                    )}

                    {analysisResults.job_description_analysis.suggestions_for_jd_alignment?.length > 0 && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                                <FiCheckCircle className="mr-2 text-indigo-500" /> Suggestions for JD Alignment
                            </h4>
                            <ul className="list-decimal list-inside space-y-1 text-gray-700">
                                {analysisResults.job_description_analysis.suggestions_for_jd_alignment.map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                  </div>
                )}

                {/* Feedback Section */}
                {analysisResults.feedback && (
                  <div className="mb-8 space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Feedback & Suggestions</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisResults.feedback.clarity && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                          <h4 className="font-bold text-gray-800 mb-3">Clarity & Readability</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{analysisResults.feedback.clarity}</p>
                        </div>
                      )}
                      
                      {analysisResults.feedback.formatting && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                          <h4 className="font-bold text-gray-800 mb-3">Formatting & Consistency</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{analysisResults.feedback.formatting}</p>
                        </div>
                      )}
                      
                      {analysisResults.feedback.action_verbs_quantifiables && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                          <h4 className="font-bold text-gray-800 mb-3">Action Verbs & Quantifiable Achievements</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{analysisResults.feedback.action_verbs_quantifiables}</p>
                        </div>
                      )}
                      
                      {analysisResults.feedback.conciseness && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                          <h4 className="font-bold text-gray-800 mb-3">Conciseness & Relevance</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{analysisResults.feedback.conciseness}</p>
                        </div>
                      )}
                      
                      {analysisResults.feedback.completeness && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                          <h4 className="font-bold text-gray-800 mb-3">Completeness & Gaps</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{analysisResults.feedback.completeness}</p>
                        </div>
                      )}
                      
                      {analysisResults.feedback.ats_compliance && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                          <h4 className="font-bold text-gray-800 mb-3">ATS & Keyword Optimization</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{analysisResults.feedback.ats_compliance}</p>
                        </div>
                      )}
                    </div>

                    {/* Key Areas for Improvement */}
                    {analysisResults.feedback.key_areas_for_improvement?.length > 0 && (
                      <div className="bg-red-50 p-6 rounded-xl shadow-md mt-6">
                        <h4 className="text-lg font-bold text-red-800 mb-3 flex items-center"><FiAlertCircle className="mr-2" /> Key Areas for Improvement</h4>
                        <ul className="list-disc list-inside space-y-2 text-red-700">
                          {analysisResults.feedback.key_areas_for_improvement.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* General Suggestions */}
                    {analysisResults.feedback.general_suggestions?.length > 0 && (
                      <div className="bg-white p-6 rounded-xl shadow-md mt-6">
                        <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center"><FiCheckCircle className="mr-2 text-indigo-500" /> General Suggestions</h4>
                        <ul className="list-decimal list-inside space-y-2 text-gray-700">
                          {analysisResults.feedback.general_suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
