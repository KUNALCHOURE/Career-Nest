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
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: `
                  You are an expert resume analyzer AI. Your task is to thoroughly analyze the provided resume text and extract key information, provide detailed feedback, and offer suggestions for improvement based on standard resume best practices.
                  The output must be a valid JSON object following the exact schema provided.
      
                  For any fields where information is not found in the resume, return an empty string "" for text fields, or an empty array [] for list/array fields. Do NOT return "string" or "array of strings".
      
                  Here's the JSON schema you must adhere to:
                  {
                    "summary": {
                      "overall_impression": "",
                      "key_sections_found": [],
                      "strengths": []
                    },
                    "extracted_data": {
                      "name": "",
                      "email": "",
                      "phone": "",
                      "linkedin": "",
                      "location": "",
                      "objective_summary": "",
                      "work_experience": [
                        {
                          "title": "",
                          "company": "",
                          "location": "",
                          "dates": "",
                          "responsibilities": ""
                        }
                      ],
                      "education": [
                        {
                          "degree": "",
                          "institution": "",
                          "location": "",
                          "graduation_date": ""
                        }
                      ],
                      "certifications": [
                        {
                          "name": "",
                          "issuer": "",
                          "date": ""
                        }
                      ],
                      "projects": [
                        {
                          "name": "",
                          "description": "",
                          "technologies": []
                        }
                      ],
                      "skills": []
                    },
                    "feedback": {
                      "clarity": "",
                      "formatting": "",
                      "action_verbs_quantifiables": "",
                      "conciseness": "",
                      "completeness": "",
                      "ats_compliance": "",
                      "general_suggestions": [],
                      "key_areas_for_improvement": []
                    }
                  }
                `,
                },
                {
                    role: "user",
                    content: `Analyse the following résumé.

1. Extract Data: Identify and extract the candidate's contact information (name, email, phone, LinkedIn, location), professional summary/objective, detailed work history (title, company, location, dates, responsibilities/achievements), education, certifications, projects, and skills.

2. Conduct In-Depth Analysis & Identify Issues: Evaluate the resume against the following criteria, providing detailed feedback for each. For each category, first state any issues found, then provide specific, actionable suggestions for improvement.
   - Clarity & Readability: Assess if the language is clear, concise, and easy to understand. Are there vague phrases, jargon, or overly complex sentences?
   - Formatting & Consistency: Evaluate implied formatting (e.g., heading structure, use of whitespace based on line breaks, bullet style consistency). Check for grammatical consistency, tense agreement, and uniform date formats.
   - Action Verbs & Quantifiable Achievements: Determine if strong, impactful action verbs are used. Are accomplishments quantified with specific numbers, percentages, or tangible results? Identify opportunities to add metrics.
   - Conciseness & Relevance: Identify any redundant information, filler words, or irrelevant details. Is every statement adding value?
   - Completeness & Gaps: Check for missing dates, unexplained employment gaps, or absent standard sections.
   - ATS & Keyword Optimization: Analyze the natural integration and presence of industry-relevant keywords. Point out potential keyword stuffing or areas where crucial keywords might be missing for general industry roles.

3. Populate JSON Schema:
   - If a data element for extracted_data is not found, return an empty string (""), null, or an empty array [].
   - Do NOT create fictional data—only use what is present in the resume text.
   - For the summary.strengths array, list specific positive aspects of the resume.
   - For feedback.key_areas_for_improvement, list the 2-3 most critical issues that need immediate attention from the user.
   - Return the entire response in the exact JSON schema provided below.

{
  "summary": {
    "overall_impression": "",
    "key_sections_found": [],
    "strengths": []
  },
  "extracted_data": {
    "name": "",
    "email": "",
    "phone": "",
    "linkedin": "",
    "location": "",
    "objective_summary": "",
    "work_experience": [
      {
        "title": "",
        "company": "",
        "location": "",
        "dates": "",
        "responsibilities": ""
      }
    ],
    "education": [
      {
        "degree": "",
        "institution": "",
        "location": "",
        "graduation_date": ""
      }
    ],
    "certifications": [
      {
        "name": "",
        "issuer": "",
        "date": ""
      }
    ],
    "projects": [
      {
        "name": "",
        "description": "",
        "technologies": []
      }
    ],
    "skills": []
  },
  "feedback": {
    "clarity": "",
    "formatting": "",
    "action_verbs_quantifiables": "",
    "conciseness": "",
    "completeness": "",
    "ats_compliance": "",
    "general_suggestions": [],
    "key_areas_for_improvement": []
  }
}

Résumé Text:
"""
${finaltext}
"""`
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
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: `
                  You are an expert resume and job description analyzer AI. Your task is to thoroughly analyze the provided resume text against the given job description.
                  Extract key information from the resume, evaluate how well it matches the job description, provide detailed feedback, and offer suggestions for improvement.
                  The output must be a valid JSON object following the exact schema provided.
      
                  For any fields where information is not found in the resume or not relevant to the job description, return an empty string "" for text fields, or an empty array [] for list/array fields.
      
                  Here's the JSON schema you must adhere to:
                  {
                    "summary": {
                      "overall_impression": "",
                      "job_match_score": 0,
                      "key_sections_found": [],
                      "strengths": [],
                      "areas_for_improvement_based_on_jd": []
                    },
                    "extracted_data": {
                      "name": "",
                      "email": "",
                      "phone": "",
                      "linkedin": "",
                      "location": "",
                      "objective_summary": "",
                      "work_experience": [
                        {
                          "title": "",
                          "company": "",
                          "location": "",
                          "dates": "",
                          "responsibilities": ""
                        }
                      ],
                      "education": [
                        {
                          "degree": "",
                          "institution": "",
                          "location": "",
                          "graduation_date": ""
                        }
                      ],
                      "certifications": [
                        {
                          "name": "",
                          "issuer": "",
                          "date": ""
                        }
                      ],
                      "projects": [
                        {
                          "name": "",
                          "description": "",
                          "technologies": []
                        }
                      ],
                      "skills": []
                    },
                    "feedback": {
                      "clarity": "",
                      "formatting": "",
                      "action_verbs_quantifiables": "",
                      "conciseness": "",
                      "completeness": "",
                      "ats_compliance": "",
                      "general_suggestions": [],
                      "key_areas_for_improvement": []
                    },
                    "job_description_analysis": {
                      "required_skills_found": [],
                      "matching_skills": [],
                      "missing_required_skills": [],
                      "relevant_experience_match": "",
                      "education_match": "",
                      "overall_match_analysis": "",
                      "suggestions_for_jd_alignment": []
                    }
                  }
                `,
                },
                {
                    role: "user",
                    content: `Analyze the following resume in comparison to the job description provided.

1. Extract Data: Identify and extract the candidate's contact information, skills, and relevant experiences that match the job requirements.

2. Conduct In-Depth Analysis & Identify Issues: Evaluate the resume against the job description for:
   - Skill Match: Compare required skills from JD with candidate's skills. List exact matching skills and specific missing skills.
   - Experience Alignment: Match job requirements with candidate's experience. Highlight relevant experiences and point out any experience gaps.
   - Qualification Fit: Assess if candidate meets educational and certification requirements as per JD.
   - Keyword Optimization: Check for relevant keywords from the job description and suggest areas for better integration.
   - Missing Requirements: Identify specific gaps between resume and job requirements that are not covered by other sections.
   - Strengths for Role: Highlight candidate's strengths specifically relevant to the position.

3. Populate JSON Schema:
   - If a data element is not found, return an empty string (""), null, or an empty array []
   - Do NOT create fictional data—only use what is present in the resume
   - For summary.job_match_score, provide a numerical percentage (0-100) indicating the overall match.
   - For summary.strengths, list specific positive aspects of the resume, especially those relevant to the JD.
   - For summary.areas_for_improvement_based_on_jd, list the 2-3 most critical issues for this specific job.
   - For job_description_analysis.required_skills_found, list skills mentioned in JD and found in resume.
   - For job_description_analysis.missing_required_skills, list skills required by JD but not found in resume.
   - For job_description_analysis.suggestions_for_jd_alignment, provide specific advice on how to tailor the resume for this JD.
   - Return the entire response in the exact JSON schema provided below

{
  "summary": {
    "overall_impression": "",
    "job_match_score": 0,
    "key_sections_found": [],
    "strengths": [],
    "areas_for_improvement_based_on_jd": []
  },
  "extracted_data": {
    "name": "",
    "email": "",
    "phone": "",
    "linkedin": "",
    "location": "",
    "objective_summary": "",
    "work_experience": [
      {
        "title": "",
        "company": "",
        "location": "",
        "dates": "",
        "responsibilities": ""
      }
    ],
    "education": [
      {
        "degree": "",
        "institution": "",
        "location": "",
        "graduation_date": ""
      }
    ],
    "certifications": [
      {
        "name": "",
        "issuer": "",
        "date": ""
      }
    ],
    "projects": [
      {
        "name": "",
        "description": "",
        "technologies": []
      }
    ],
    "skills": []
  },
  "feedback": {
    "clarity": "",
    "formatting": "",
    "action_verbs_quantifiables": "",
    "conciseness": "",
    "completeness": "",
    "ats_compliance": "",
    "general_suggestions": [],
    "key_areas_for_improvement": []
  },
  "job_description_analysis": {
    "required_skills_found": [],
    "matching_skills": [],
    "missing_required_skills": [],
    "relevant_experience_match": "",
    "education_match": "",
    "overall_match_analysis": "",
    "suggestions_for_jd_alignment": []
  }
}

Resume Text:
"""
${resumeText}
"""

Job Description Text:
"""
${jobDescription}
"""`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2
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
