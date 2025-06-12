import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import  asyncHandler  from "../utils/asynchandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import  ApiResponse  from "../utils/Apiresponse.js";
import openai from "../utils/ai.js";

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

const analyzewithoutjd=asyncHandler(async(req,res)=>{
   const {resumetext}=req.body
   
   const rawResumeText = req.body.resumeText;

   if (!rawResumeText) {
       return res.status(400).json({ message: "Resume text is required for analysis." });
   }

   try {
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
"${rawResumeText}"

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

       res.json(new ApiResponse(200,analysisResult,"Resume analyzed successfully"));


   } catch (error) {
       console.error("Error analyzing resume without JD:", error);
       res.json(new ApiError(400,"Problem occur while analyzing the resume"));
   }
})

export {
    addResume,
    deleteResume,
    getResume,
    updateResumeStatus,
    analyzewithoutjd
};
