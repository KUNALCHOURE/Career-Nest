# CareerNest 🚀

A full-stack job board application with AI-powered resume analysis and intelligent job matching.

## 🌟 Features

- **AI-Powered Resume Analysis**
  - Intelligent resume parsing and analysis using OpenAI API
  - Personalized feedback and improvement suggestions
  - Skills extraction and matching

- **Advanced Job Search**
  - Real-time job search with multiple filters
  - Location-based job recommendations
  - Salary range filtering
  - Experience level matching

- **User Management**
  - Secure authentication with JWT tokens
  - Profile management with Cloudinary image upload
  - Role-based access control (Job Seeker/Employer)
  - Application tracking system

- **Employer Features**
  - Job posting and management
  - Candidate screening
  - Application review system
  - Company profile management

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Redux Toolkit
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- OpenAI API
- Cloudinary

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- OpenAI API key
- Cloudinary account

### Installation

1. Clone the repository
```bash
git clone https://github.com/KUNALCHOURE/Career-Nest.git
cd Career-Nest
```

2. Install dependencies
```bash
# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

3. Environment Setup
Create `.env` files in both Frontend and Backend directories:

Backend `.env`:
```env
PORT=8000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:8000
```

4. Start the application
```bash
# Start backend server
cd Backend
npm run dev

# Start frontend server
cd ../Frontend
npm run dev
```

## 📝 API Documentation

### Authentication
- POST `/api/v1/users/register` - Register new user
- POST `/api/v1/users/login` - User login
- GET `/api/v1/users/profile` - Get user profile

### Jobs
- GET `/api/v1/jobs` - Get all jobs
- POST `/api/v1/jobs` - Create new job
- GET `/api/v1/jobs/:id` - Get job details
- PUT `/api/v1/jobs/:id` - Update job
- DELETE `/api/v1/jobs/:id` - Delete job

### Resume
- POST `/api/v1/resume/analyze` - Analyze resume
- GET `/api/v1/resume/:id` - Get resume details
- PUT `/api/v1/resume/:id` - Update resume

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
