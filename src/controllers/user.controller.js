/**
 * @module UserController
 */

/**
 * Generates access and refresh tokens for a user
 * @async
 * @param {string} userId - The ID of the user
 * @returns {Promise<{accessToken: string, refreshToken: string}>} Object containing access and refresh tokens
 * @throws {ApiError} If token generation fails
 */

/**
 * Handles user registration
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.username - Desired username
 * @param {string} req.body.password - User's password
 * @returns {Promise<ApiResponse>} Response with created user data
 * @throws {ApiError} If registration fails
 */

/**
 * Handles user sign in
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @returns {Promise<ApiResponse>} Response with user data and tokens
 * @throws {ApiError} If authentication fails
 */

/**
 * Handles user sign out
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {string} req.user._id - User's ID
 * @returns {Promise<ApiResponse>} Response confirming sign out
 * @throws {ApiError} If sign out fails
 */

/**
 * Refreshes access token using refresh token
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.cookies - Request cookies
 * @param {string} req.cookies.refreshToken - Refresh token from cookies
 * @param {Object} req.body - Request body
 * @param {string} req.body.refreshToken - Optional refresh token in body
 * @returns {Promise<ApiResponse>} Response with new access and refresh tokens
 * @throws {ApiError} If token refresh fails
 */

/**
 * Changes user's current password
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} req.body - Request body
 * @param {string} req.body.oldPassword - Current password
 * @param {string} req.body.newPassword - New password
 * @returns {Promise<ApiResponse>} Response confirming password change
 * @throws {ApiError} If password change fails
 */

/**
 * Gets current user's information
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object from middleware
 * @returns {Promise<ApiResponse>} Response with user data
 */

/**
 * Updates username
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - New username
 * @returns {Promise<ApiResponse>} Response with updated user data
 * @throws {ApiError} If update fails
 */

/**
 * Updates email
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - New email address
 * @returns {Promise<ApiResponse>} Response with updated user data
 * @throws {ApiError} If update fails
 */

/**
 * Gets author profile information
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.username - Username to fetch profile for
 * @param {Object} req.user - Authenticated user object for following status
 * @returns {Promise<ApiResponse>} Response with author profile data
 * @throws {ApiError} If profile fetch fails
 */

/**
 * Gets user's story history
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User's ID
 * @returns {Promise<ApiResponse>} Response with story history
 */

/**
 * Searches users by username
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.username - Username to search for
 * @returns {Promise<ApiResponse>} Response with search results
 * @throws {ApiError} If search fails
 */

/**
 * Gets user's comment history
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User's ID
 * @returns {Promise<ApiResponse>} Response with comment history
 */

/**
 * Gets user's likes history
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User's ID
 * @returns {Promise<ApiResponse>} Response with likes history
 */

/**
 * Gets user notifications
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User's ID
 * @returns {Promise<ApiResponse>} Response with notifications
 * @throws {ApiError} If notification fetch fails
 */

/**
 * Deletes a notification
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.notificationId - ID of notification to delete
 * @returns {Promise<ApiResponse>} Response confirming deletion
 * @throws {ApiError} If deletion fails
 */


import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { Comment } from "../models/comment.models.js";
import { Like } from "../models/like.models.js";
import Notification from "../models/notification.model.js";
import mongoose from "mongoose";
import axios from "axios";
import { NOTIFY_URL } from "../constants.js";

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating referesh and access token",
            error
        );
    }
};

const signUp = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    console.log("email: ", email, typeof email);

    if ([email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }
    const user = await User.create({
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -__v -updatedAt -createdAt"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while signing in the user"
        );
    }

    await axios.post(`${NOTIFY_URL}/notify_user`, {
        username: createdUser.username,
        email: createdUser.email,
        userId: createdUser._id,
        message: `New user registered with username ${createdUser.username}`,
        sentiment: "positive",
    });

    res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );
});

const signIn = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // console.log("email: ", email);

    if ([email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({
        email,
    });

    if (!user) {
        throw new ApiError(409, "User with email does not exists");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -__v -updatedAt -createdAt -storyHistory"
    );

    const options = {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "None",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User singed In Successfully"
            )
        );
});

const signOut = asyncHandler(async (req, res) => {
    if (!req.user._id) throw new ApiError(500, "Error in tokens");
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "None",
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Signed Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }
    // console.log("Incoming Refresh Token:", incomingRefreshToken);

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id).select("_id refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
            path: "/",
            sameSite: "None",
        };

        const { accessToken, newRefreshToken } =
            await generateAccessAndRefereshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        console.error("Error refreshing access token:", error);
        throw Error("Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id).select("_id");
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    axios.post(`${NOTIFY_URL}/notify_user`, {
        username: user.username,
        email: user.email,
        userId: id,
        message: `Password have been changed`,
        sentiment: "negative",
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateUsername = asyncHandler(async (req, res) => {
    const { username } = req.body;

    if (!username) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                username,
            },
        },
        { new: true }
    ).select("_id");
    axios.post(`${NOTIFY_URL}/notify_user`, {
        username: req.user.username,
        email: user.email,
        userId: req.user._id,
        message: `Username have been changed to ${user.username}`,
        sentiment: "negative",
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        );
});

const updateEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                email,
            },
        },
        { new: true }
    ).select("_id");
    axios.post(`${NOTIFY_URL}/notify_user`, {
        username: user.username,
        email: req.user.email,
        userId: id,
        message: `Email have been updated from ${req.user.emai} to ${user.email} have been changed`,
        sentiment: "negative",
    });
    axios.post(`${NOTIFY_URL}/notify_user`, {
        username: user.username,
        email: user.email,
        userId: id,
        message: `Email have been updated from ${req.user.emai} to ${user.email} have been changed`,
        sentiment: "negative",
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        );
});

const getUserAuthorProfile = asyncHandler(async (req, res) => {
    const username = body.params;

    if (!username?.trim()) {
        throw new ApiError(404, "username is required");
    }

    const author = await User.aggregate([
        {
            $match: username?.toLowerCase(),
        },
        {
            $lookup: {
                from: "follows",
                localField: "_id",
                foreignField: "author",
                as: "followers",
            },
        },
        {
            $lookup: {
                from: "follows",
                localField: "_id",
                foreignField: "follower",
                as: "following",
            },
        },
        {
            $addFields: {
                follwersCount: { $size: "$follwers" },
                followingCount: { $size: "$following" },
                isFollowing: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$follwers.follwer"],
                        },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                username: 1,
                email: 1,
                follwersCount: 1,
                followingCount: 1,
                isFollowing: 1,
            },
        },
    ]);

    if (author.length > 0) {
        throw new ApiError(404, "Author does not exists");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, author[0], "User author fecthed sucessfully")
        );
});

const getstoryHistory = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate({
        path: "storyHistory",
        populate: {
            path: "owners",
            model: "User",
            select: "username",
        },
    });
    const validStoryHistory = user.storyHistory.filter(
        (story) => story && story._id
    );

    // Update the user document if invalid IDs are found
    if (validStoryHistory.length !== user.storyHistory.length) {
        user.storyHistory = validStoryHistory.map((story) => story._id);
        await user.save();
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Watch history fetched successfully"));
});

const searchUserByUserName = asyncHandler(async (req, res) => {
    const { username } = req.query;

    if (!username) throw new ApiError(400, "username is required");

    const resultsOfUser = await User.find({
        username: new RegExp(username, "i"),
    }).select("username _id");

    if (resultsOfUser.length === 0) {
        // If no results are found, return an empty array with a 200 status
        return res.status(200).json(new ApiResponse(200, []));
    }

    return res.status(200).json(new ApiResponse(200, resultsOfUser));
});

const getCommentHistory = asyncHandler(async (req, res) => {
    const comments = await Comment.aggregate([
        {
            $match: { commenter: req.user._id },
        },
        {
            $lookup: {
                from: "stories",
                localField: "commentedStory",
                foreignField: "_id",
                as: "commentedStories",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                        },
                    },
                ],
            },
        },
        {
            $facet: {
                storyDetails: [
                    {
                        $project: {
                            commentedStories: 1,
                            comment: 1,
                        },
                    },
                ],
                totalComments: [
                    {
                        $count: "totalComments",
                    },
                ],
            },
        },
    ]);
    res.status(200).json(new ApiResponse(200, comments));
});

const getLikesHistory = asyncHandler(async (req, res) => {
    const likes = await Like.aggregate([
        {
            $match: { likedUser: req.user._id },
        },
        {
            $lookup: {
                from: "stories",
                localField: "likedStory",
                foreignField: "_id",
                as: "likedStories",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                        },
                    },
                ],
            },
        },
        {
            $facet: {
                storyDetails: [
                    {
                        $project: {
                            likedStories: 1,
                        },
                    },
                ],
                totalLikes: [
                    {
                        $count: "totalLikes ",
                    },
                ],
            },
        },
    ]);
    res.status(200).json(new ApiResponse(200, likes));
});

const getNotifications = asyncHandler(async (req, res) => {
    console.log(req.user._id);

    const notifications = await Notification.aggregate([
        {
            $match: {
                userId: req.user._id,
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $limit: 10,
        },
        {
            $project: {
                _id: 1,
                message: 1,
            },
        },
    ]);

    if (notifications === undefined) {
        throw new ApiError(500, "notificaton is undifiend");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                notifications,
                "Watch history fetched successfully"
            )
        );
});

const deleteNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    //TODO: delete story
    try {
        if (!notificationId) throw new ApiError(401, "id is required");
        const notification =
            await Notification.findByIdAndDelete(notificationId);
        if (!notification) {
            res.status(404);
            throw new ApiError(404, "Notification not found");
        }
        console.log(notification.message,notificationId);
        // (notification.message)
        return res.status(200).json(new ApiResponse(200, notification.message));
    } catch (error) {
        throw new ApiError(500, "Something went wrong");
    }
});

export {
    signIn,
    signUp,
    signOut,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateEmail,
    updateUsername,
    getUserAuthorProfile,
    getstoryHistory,
    searchUserByUserName,
    getCommentHistory,
    getLikesHistory,
    getNotifications,
    deleteNotification,
};
