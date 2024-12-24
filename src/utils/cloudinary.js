import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET

});

const uploadOnCloudinary=async (localFilePath)=>{
    try{
        if(!localFilePath) return null
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        fs.unlinkSync(localFilePath)
        return response
    }catch(error){
        fs.unlinkSync(localFilePath) //remove the the locally seved temp files as the upload operation got failed
    }
}
const extractPublicIdFormUrl=(url)=>{
    const regex=/\/v\d+\/(.*?)\./
    const match=url.match(regex);
    return match? match[1]: null;
}

const getResourceTypeFromUrl = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "bmp", "tiff"].includes(extension)) {
        return "image";
    } else if (["mp4", "mov", "avi", "mkv", "webm"].includes(extension)) {
        return "video";
    } else {
        return "raw"; // Default for other file types
    }
};

const deleteFromCloudinary = async (url) => {
    try {
        const publicId = extractPublicIdFormUrl(url);
        if (!publicId) throw new Error("Invalid Cloudinary URL.");

        const resourceType = getResourceTypeFromUrl(url);
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });

        return result;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        throw new Error("Failed to delete file from Cloudinary");
    }
};

export {uploadOnCloudinary,deleteFromCloudinary}