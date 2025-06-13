import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asynchandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/Apiresponse.js";
import openai from "../utils/ai.js";

import fs from "fs";
import PDFTextExtractor from "../utils/pdfParser.js";

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

const extractdata = asyncHandler(async (req, res) => {
    let filePath = null;
    
    try {
        // Validate file upload
        if (!req.file) {
            throw new ApiError(400, "No file uploaded. Please upload a resume file.");
        }

        filePath = req.file.path;
        
        // Validate file type
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            throw new ApiError(400, "Invalid file type. Only PDF, DOC, and DOCX files are supported.");
        }

        console.log(`Processing file: ${req.file.originalname} at ${filePath}`);

        let extractedData;
        const fileBuffer = fs.readFileSync(filePath);

        // Handle different file types
        if (req.file.mimetype === 'application/pdf') {
            extractedData = await PDFTextExtractor.extractText(fileBuffer);
        } 
        else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            extractedData = await PDFTextExtractor.extractDOCX(fileBuffer);
        }
        else if (req.file.mimetype === 'application/msword') {
            throw new ApiError(422, "Legacy DOC format is not supported. Please convert to PDF or DOCX format.");
        }

        // Validate extracted content
        if (!extractedData || !extractedData.cleanedText || extractedData.cleanedText.trim().length < 10) {
            throw new ApiError(422, "Unable to extract readable text from the file. Please ensure the document contains selectable text.");
        }

        // Format for AI analysis
        const aiFormattedData = PDFTextExtractor.formatForAI(extractedData);

        // Calculate text statistics
        const words = extractedData.cleanedText.split(/\s+/).filter(word => word.length > 0);
        const textStats = {
            characterCount: extractedData.cleanedText.length,
            wordCount: words.length,
            lineCount: extractedData.cleanedText.split('\n').length,
            pageCount: extractedData.metadata.pages || 1
        };

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                {
                    extraction: {
                        success: true,
                        extractedAt: new Date().toISOString(),
                        stats: textStats
                    },
                    content: {
                        text: extractedData.cleanedText,
                        preview: extractedData.cleanedText.substring(0, 300) + '...'
                    },
                    aiPayload: {
                        prompt: aiFormattedData.aiPrompt,
                        context: aiFormattedData.context,
                        readyForAnalysis: true
                    }
                },
                `File processed successfully. Extracted ${textStats.wordCount} words from ${textStats.pageCount} pages.`
            ));

    } catch (error) {
        console.error('Resume processing error:', error);

        // Clean up uploaded file on error
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log(`Cleaned up file: ${filePath}`);
            } catch (cleanupError) {
                console.error('Failed to cleanup file:', cleanupError);
            }
        }

        // Handle specific error types
        if (error instanceof ApiError) {
            return res
                .status(error.statuscode)
                .json(error);
        }

        // Handle file system errors
        if (error.code === 'ENOENT') {
            return res
                .status(404)
                .json(new ApiError(404, "Uploaded file not found."));
        }

        // Handle PDF parsing errors
        if (error.message.includes('Invalid PDF')) {
            return res
                .status(422)
                .json(new ApiError(422, "Invalid or corrupted PDF file."));
        }

        // Generic error handling
        return res
            .status(500)
            .json(new ApiError(
                500, 
                "Failed to process resume. Please try again.",
                [error.message]
            ));
    }
});

const getResumes = asyncHandler(async (req, res) => {
    const resumes = await Resume.find({ user: req.user._id });
    
    return res
        .status(200)
        .json(new ApiResponse(200, resumes, "Resumes fetched successfully"));
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
    const { resumeText } = req.body;
    console.log(resumeText.text);
    const finaltext = resumeText.text;
    
    if (!resumeText) {
        throw new ApiError(400, "Resume text is required");
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: [
                {
                    role: "system",
                    content: `You are an expert resume analyzer. Your task is to review a raw resume text, extract its key components, and provide general feedback based on resume best practices for readability, completeness, and clarity. Do NOT compare it to a job description. Provide your output in a structured JSON format.`
                },
                {
                    role: "user",
                    content: `Analyze the following resume text. Extract the candidate's contact information, a summary/objective (if present), work experience, education, and skills. Also, provide general feedback on the resume's clarity, common formatting issues (e.g., use of bullet points, white space, readability), suggestions for improvement (e.g., use of action verbs, quantifiable achievements, conciseness), and overall completeness.

Resume Text:
"${finaltext}"

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
}`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2
        });

        const analysisResult = JSON.parse(response.choices[0].message.content);
        res.json(new ApiResponse(200, analysisResult, "Resume analyzed successfully"));
    } catch (error) {
        console.error("Error analyzing resume without JD:", error);
        throw new ApiError(400, "Problem occurred while analyzing the resume");
    }
});

const analyzewithjd = asyncHandler(async(req, res) => {
  const { resumeText, jobDescription } = req.body;
  
  if (!resumeText || !jobDescription) {
    throw new ApiError(400, "Resume text and job description are required");
  }

  try {
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
"${jobDescription}"

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
    throw new ApiError(400, "Problem occurred while analyzing the resume against the Job Description");
  }
});

export {
  addResume,
  deleteResume,
  getResume,
  updateResumeStatus,
  analyzewithoutjd,
  analyzewithjd,
  extractdata,
  getResumes
};
