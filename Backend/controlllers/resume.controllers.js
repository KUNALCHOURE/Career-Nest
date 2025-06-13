import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asynchandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/Apiresponse.js";
import openai from "../utils/ai.js";
import ResumeParser from 'resume-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parseResumeFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    ResumeParser.parseResumeFile(filePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Combine all the parsed data into a single text
      const parsedText = [
        data.names?.join(' '),
        data.emails?.join(' '),
        data.phones?.join(' '),
        data.addresses?.join(' '),
        data.summary,
        data.work?.map(job => `${job.title} at ${job.company}: ${job.description}`).join('\n'),
        data.education?.map(edu => `${edu.degree} from ${edu.school}`).join('\n'),
        data.skills?.join(', ')
      ].filter(Boolean).join('\n\n');

      resolve(parsedText);
    });
  });
};

const addResume = asyncHandler(async (req, res) => {
    console.log("adding");
    if (!req.file) {
        throw new ApiError(400, "Resume file is required");
    }

    const userId = req.user._id;
    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

   
    const currentUser = await User.findById(userId);
    if (!currentUser) {
        throw new ApiError(404, "User not found");
    }


    if (currentUser.resumeFilePublicId) {
        await deleteFromCloudinary(currentUser.resumeFilePublicId);
    }

 
    const cloudinaryResponse = await uploadOnCloudinary(req.file.path, userId);
    if (!cloudinaryResponse) {
        throw new ApiError(500, "Failed to upload resume to Cloudinary");
    }

   
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                resumeFileUrl: cloudinaryResponse.secure_url,
                resumeFilePublicId: cloudinaryResponse.public_id,
                resumeUploadedAt: new Date(),
                aiParsingStatus: 'PENDING'
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
        throw new ApiError(500, "Failed to update user with resume information");
    }
    console.log("resume added succesfully ");
    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Resume uploaded successfully")
    );
   
});

const deleteResume = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!user.resumeFilePublicId) {
        throw new ApiError(400, "No resume found to delete");
    }

    // Delete from Cloudinary
    const deleteResult = await deleteFromCloudinary(user.resumeFilePublicId);
    if (!deleteResult) {
        throw new ApiError(500, "Failed to delete resume from Cloudinary");
    }

    // Update user document
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            $unset: {
                resumeFileUrl: 1,
                resumeFilePublicId: 1,
                resumeUploadedAt: 1,
                aiParsingStatus: 1
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Resume deleted successfully")
    );
});

const getResume = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    const user = await User.findById(userId).select("resumeFileUrl resumeUploadedAt aiParsingStatus");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!user.resumeFileUrl) {
        throw new ApiError(404, "No resume found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Resume information retrieved successfully")
    );
});

const updateResumeStatus = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { status } = req.body;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    if (!status || !['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].includes(status)) {
        throw new ApiError(400, "Invalid status provided");
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                aiParsingStatus: status
            }
        },
        { new: true }
    ).select("resumeFileUrl resumeUploadedAt aiParsingStatus");

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Resume status updated successfully")
    );
});

const analyzewithoutjd = asyncHandler(async(req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Resume file is required");
  }

  try {
    // Parse the resume file
    const resumeText = await parseResumeFile(req.file.path);
    
    // Clean up the temporary file
    fs.unlinkSync(req.file.path);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        {
          role: "system",
          content: `You are an expert resume analyzer. Your task is to review a raw resume text, extract its key components, and provide general feedback based on resume best practices for readability, completeness, and clarity. Do NOT compare it to a job description. Provide your output in a structured JSON format.`,
        },
        {
          role: "user",
          content: `Analyze the following resume text. Extract the candidate's contact information, a summary/objective (if present), work experience, education, and skills. Also, provide general feedback on the resume's clarity, common formatting issues (e.g., use of bullet points, white space, readability), suggestions for improvement (e.g., use of action verbs, quantifiable achievements, conciseness), and overall completeness.

Resume Text:
"${resumeText}"

Format the output as a JSON object with the following keys:
{
 "summary": {
   "overall_impression": "string",
   "key_sections_found": ["array of strings"]
 },
 "extracted_data": {
   "name": "string",
   "email": "string",
   "phone": "string",
   "linkedin": "string",
   "location": "string",
   "objective_summary": "string",
   "work_experience": [
     {
       "title": "string",
       "company": "string",
       "dates": "string",
       "responsibilities": "string"
     }
   ],
   "education": [
     {
       "degree": "string",
       "institution": "string",
       "graduation_date": "string"
     }
   ],
   "skills": ["array of strings"]
 },
 "feedback": {
   "clarity": "string",
   "formatting": "string",
   "action_verbs_quantifiables": "string",
   "conciseness": "string",
   "completeness": "string",
   "general_suggestions": ["array of strings"]
 }
}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const analysisResult = JSON.parse(response.choices[0].message.content);
    res.json(new ApiResponse(200, analysisResult, "Resume analyzed successfully"));

  } catch (error) {
    console.error("Error analyzing resume without JD:", error);
    res.json(new ApiError(400, "Problem occurred while analyzing the resume"));
  }
});

const analyzewithjd = asyncHandler(async(req, res) => {
  if (!req.file || !req.body.jobDescription) {
    throw new ApiError(400, "Resume file and job description are required");
  }

  try {
    // Parse the resume file
    const resumeText = await parseResumeFile(req.file.path);
    
    // Clean up the temporary file
    fs.unlinkSync(req.file.path);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        {
          role: "system",
          content: `You are an expert resume analyzer and job description matcher. Your task is to compare a provided resume against a specific job description. Identify key alignments and gaps, provide a compatibility score, and offer actionable feedback for the candidate to improve their resume's relevance to this job. Provide your output in a structured JSON format.`,
        },
        {
          role: "user",
          content: `Analyze the following resume in comparison to the job description provided.

Resume Text:
"${resumeText}"

Job Description Text:
"${req.body.jobDescription}"

Provide the following analysis in a structured JSON format:
{
  "summary": {
    "match_score_percentage": "number",
    "overall_assessment": "string"
  },
  "extracted_data": {
    "name": "string",
    "email": "string",
    "skills": ["array of strings"],
    "top_experiences": ["array of strings"]
  },
  "alignment_details": {
    "matching_skills": ["array of strings"],
    "missing_skills_in_resume": ["array of strings"],
    "relevant_experience_highlights": ["array of strings"],
    "experience_gaps_for_jd": ["array of strings"],
    "keyword_alignment": "string"
  },
  "feedback": {
    "resume_optimization_suggestions": ["array of strings"],
    "areas_for_improvement": ["array of strings"],
    "strengths_for_this_role": ["array of strings"]
  }
}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const analysisResult = JSON.parse(response.choices[0].message.content);
    res.json(new ApiResponse(200, analysisResult, "Resume analyzed against Job Description successfully"));

  } catch (error) {
    console.error("Error analyzing resume with JD:", error);
    res.json(new ApiError(400, "Problem occurred while analyzing the resume against the Job Description"));
  }
});

export {
  addResume,
  deleteResume,
  getResume,
  updateResumeStatus,
  analyzewithoutjd,
  analyzewithjd
};
