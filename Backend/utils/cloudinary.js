
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'; 
import dotenv from 'dotenv'
dotenv.config();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});



const uploadOnCloudinary = async (localFilePath, userId) => { 
    try {
        if (!localFilePath) {
            console.error("No local file path provided for Cloudinary upload.");
            return null;
        }

        if (!fs.existsSync(localFilePath)) {
            console.error(`Local file not found at path: ${localFilePath}`);
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "raw", 
            folder: "resumes",   
            public_id: userId ? `resume_${userId}` : `resume_${Date.now()}`, 
            overwrite: true    
        });

        fs.unlinkSync(localFilePath);

        return response;

    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};


const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) {
            console.log("No publicId provided for Cloudinary deletion.");
            return null;
        }
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "raw" 
        });
         console.log("File deleted from Cloudinary:", result); 
        return result;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };