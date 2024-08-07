import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;

        if (token === undefined) {
            throw new Error(401, "Unotherized Request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id).select(
            "-createdAt -updatedAt -refreshToken -password"
        );

        // console.log(user);

        if (!user) {
            throw new ApiError(401, "Invalid Access token");
        }
        req.user = user;

        next();
    } catch (err) {
        throw new ApiError(res, 500, _, err, next);
    }
});
