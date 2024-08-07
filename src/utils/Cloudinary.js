import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


    // Configuration
    cloudinary.config({
        cloud_name: "dmgrj0tol",
        api_key: "713736993664296",
        api_secret: "<your_api_secret>", // Click 'View Credentials' below to copy your API secret
    });

    // Upload an image
    const uploadCloudinaryResult = async function (localFilePath) {
        if (!localFilePath) return null;
        try {
            const results = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",
            });
            console.log("File is uploaded to cloudinary ", results.url);

            return results;
        } catch (error) {
            fs.unlink(localFilePath);
            return null;
        }
    };


    // Optimize delivery by resizing and applying auto-format and auto-quality
    // const optimizeUrl = cloudinary.url("shoes", {
    //     fetch_format: "auto",
    //     quality: "auto",
    // });

    // console.log(optimizeUrl);

    // Transform the image: auto-crop to square aspect_ratio
    // const autoCropUrl = cloudinary.url("shoes", {
    //     crop: "auto",
    //     gravity: "auto",
    //     width: 500,
    //     height: 500,
    // });

    // console.log(autoCropUrl);

    export {uploadCloudinaryResult}