import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faPhone, 
  faLocationDot, 
  faFileLines, 
  faDownload, 
  faTrash 
} from '@fortawesome/free-solid-svg-icons';

const Profile = () => {
  // Mock user data - replace with actual data from your backend
  const [userData] = useState({
    name: 'ABC',
    email: 'ABC@example.com',
    phone: '69884',
    location: 'INDIA',
    avatar: 'https://via.placeholder.com/150',
    resumes: [
      {
        id: 1,
        name: 'Resume_2024.pdf',
        uploadDate: '2024-03-15',
        size: '2.5 MB',
      },
      {
        id: 2,
        name: 'Updated_Resume.pdf',
        uploadDate: '2024-03-20',
        size: '2.8 MB',
      },
    ],
  });

  const handleDownload = (resumeId) => {
    // Implement download functionality
    console.log('Downloading resume:', resumeId);
  };

  const handleDelete = (resumeId) => {
    // Implement delete functionality
    console.log('Deleting resume:', resumeId);
  };

  return (
    <div className="mt-15 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-6">
          <img
            src={userData.avatar}
            alt={userData.name}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{userData.name}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5" />
                <span>{userData.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <FontAwesomeIcon icon={faPhone} className="w-5 h-5" />
                <span>{userData.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <FontAwesomeIcon icon={faLocationDot} className="w-5 h-5" />
                <span>{userData.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumes Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">My Resumes</h2>
          <button
            onClick={() => {/* Implement upload functionality */}}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FontAwesomeIcon icon={faFileLines} className="mr-2" />
            Upload New Resume
          </button>
        </div>

        <div className="space-y-4">
          {userData.resumes.map((resume) => (
            <div
              key={resume.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <FontAwesomeIcon icon={faFileLines} className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{resume.name}</h3>
                  <p className="text-sm text-gray-500">
                    Uploaded on {resume.uploadDate} • {resume.size}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(resume.id)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Download
                </button>
                <button
                  onClick={() => handleDelete(resume.id)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;

 
