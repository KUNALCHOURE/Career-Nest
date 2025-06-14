import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv'
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (fileBuffer, userId) => { 
    try {
        if (!fileBuffer) {
            console.error("No file buffer provided for Cloudinary upload.");
            return null;
        }

        // Convert buffer to base64
        const b64 = Buffer.from(fileBuffer).toString('base64');
        const dataURI = `data:application/pdf;base64,${b64}`;

        const response = await cloudinary.uploader.upload(dataURI, {
            resource_type: "raw", 
            folder: "resumes",   
            public_id: userId ? `resume_${userId}` : `resume_${Date.now()}`, 
            overwrite: true    
        });

        return response;

    } catch (error) {
        console.error("Cloudinary upload failed:", error);
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