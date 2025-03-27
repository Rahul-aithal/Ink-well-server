import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_API_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload an image
const uploadCloudinaryResult = async function (localFilePath) {
    if (!localFilePath) return null;
    try {
        const results = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        if (!results) {
            throw new ApiError(400, "Failed to upload image to cloudinary");
        }

        // Optimize delivery by resizing and applying auto-format and auto-quality
        const optimizeUrl = cloudinary.url(results.public_id, {
            fetch_format: "auto",
            quality: "auto",
            crop: "thumb",
            gravity: "auto",
        });
        if (!optimizeUrl) {
            throw new ApiError(400, "Failed to get url from cloudinary");
        }
        return optimizeUrl;
    } catch (error) {
        console.log("error", error.message);

        return null;
    } finally {
        fs.unlinkSync(localFilePath);
    }
};
export const getURL = (publicName) =>
    cloudinary.url(publicName, {
        fetch_format: "auto",
        quality: "auto",
        crop: "thumb",
        gravity: "auto",
    });
export default uploadCloudinaryResult;
