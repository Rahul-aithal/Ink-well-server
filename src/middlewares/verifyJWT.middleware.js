import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        
        if (!token) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id).select(
            "-createdAt -updatedAt -refreshToken -password"
        );

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw new ApiError(401, "Token has expired");
        } else if (err.name === 'JsonWebTokenError') {
            throw new ApiError(401, "Invalid Token");
        } else {
            throw new ApiError(500, err.message || "Internal Server Error");
        }
    }
});
