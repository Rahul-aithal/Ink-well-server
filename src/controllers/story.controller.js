/**
 * @function getAllStorys
 * @description Controller to get all stories with search and filtering capabilities
 * @route GET /api/v1/stories
 * @param {Object} req.query
 * @param {number} [req.query.limit=10] - Number of stories to return per page
 * @param {string} req.query.search - Search term for story titles
 * @param {string} [req.query.sortBy="title"] - Field to sort by
 * @param {string} req.query.sortType - Sort order ('asc' or 'desc')
 * @param {string} req.query.username - Filter stories by username
 * @param {boolean} [req.query.story=false] - Include story content in response
 * @returns {Promise<ApiResponse>} Stories array and total count
 * @throws {ApiError} If search parameter is missing
 */

/**
 * @function WriteStory
 * @description Controller to create a new story
 * @route POST /api/v1/stories
 * @param {Object} req.body
 * @param {string} req.body.title - Story title
 * @param {string} [req.body.description=""] - Story description
 * @param {string} req.body.story - Story content
 * @param {string} req.body.genre - Story genre
 * @param {string} [req.body.owners=""] - Comma-separated list of co-authors
 * @param {boolean} [req.body.isEditable=false] - Whether story can be edited
 * @param {File} req.file - Story thumbnail image
 * @returns {Promise<ApiResponse>} Created story and updated user details
 * @throws {ApiError} If required fields are missing or story title already exists
 */

/**
 * @function getstoryById
 * @description Controller to get a story by its ID
 * @route GET /api/v1/stories/:storyId
 * @param {string} req.params.storyId - Story ID
 * @returns {Promise<ApiResponse>} Story details
 * @throws {ApiError} If story ID is invalid or story not found
 */

/**
 * @function updateStoryThumb
 * @description Controller to update story thumbnail
 * @route PATCH /api/v1/stories/:storyId/thumbnail
 * @param {string} req.params.storyId - Story ID
 * @param {File} req.file - New thumbnail image
 * @returns {Promise<ApiResponse>} Updated image URL
 * @throws {ApiError} If file missing, story not found, or unauthorized
 */

/**
 * @function updateStory
 * @description Controller to update story content
 * @route PATCH /api/v1/stories/:storyId
 * @param {string} req.params.storyId - Story ID
 * @param {string} req.body.newStory - Updated story content
 * @returns {Promise<ApiResponse>} Updated story details
 * @throws {ApiError} If story not found, not editable, or unauthorized
 */

/**
 * @function updateStoryDescription
 * @description Controller to update story description
 * @route PATCH /api/v1/stories/:storyId/description
 * @param {string} req.params.storyId - Story ID
 * @param {string} req.body.description - New description
 * @returns {Promise<ApiResponse>} Updated story details
 * @throws {ApiError} If description missing, story not found, or unauthorized
 */

/**
 * @function updateStoryTitle
 * @description Controller to update story title
 * @route PATCH /api/v1/stories/:storyId/title
 * @param {string} req.params.storyId - Story ID
 * @param {string} req.body.title - New title
 * @returns {Promise<ApiResponse>} Updated story details
 * @throws {ApiError} If title missing, story not found, or unauthorized
 */

/**
 * @function deleteStory
 * @description Controller to delete a story
 * @route DELETE /api/v1/stories/:storyId
 * @param {string} req.params.storyId - Story ID
 * @returns {Promise<ApiResponse>} Deleted story details
 * @throws {ApiError} If story not found or unauthorized
 */

/**
 * @function likeStory
 * @description Controller to like/unlike a story
 * @route POST /api/v1/stories/like
 * @param {string} req.body.storyId - Story ID
 * @returns {Promise<ApiResponse>} Like details or unlike confirmation
 * @throws {ApiError} If story not found or operation fails
 */

/**
 * @function commentStory
 * @description Controller to add a comment to a story
 * @route POST /api/v1/stories/comment
 * @param {Object} req.body
 * @param {string} req.body.storyId - Story ID
 * @param {string} req.body.comment - Comment text
 * @returns {Promise<ApiResponse>} Comment details and updated story
 * @throws {ApiError} If story not found or comment fails
 */

/**
 * @function getAllLikes
 * @description Controller to get all likes for a story
 * @route GET /api/v1/stories/likes
 * @param {string} req.body.storyId - Story ID
 * @returns {Promise<ApiResponse>} Likes details and total count
 */

/**
 * @function getAllComments
 * @description Controller to get all comments for a story
 * @route GET /api/v1/stories/comments
 * @param {string} req.body.storyId - Story ID
 * @returns {Promise<ApiResponse>} Comments details and total count
 */

/**
 * @function editComments
 * @description Controller to edit a comment
 * @route PATCH /api/v1/stories/comments
 * @param {Object} req.body
 * @param {string} req.body.commentId - Comment ID
 * @param {string} req.body.comment - Updated comment text
 * @returns {Promise<ApiResponse>} Updated comment details
 * @throws {ApiError} If comment not found or update fails
 */

/**
 * @function deleteComments
 * @description Controller to delete a comment
 * @route DELETE /api/v1/stories/comments
 * @param {string} req.body.commentId - Comment ID
 * @returns {Promise<ApiResponse>} Deleted comment details
 * @throws {ApiError} If comment not found or deletion fails
 */

import mongoose from "mongoose";
import { Story } from "../models/stroy.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { Like } from "../models/like.models.js";
import { Comment } from "../models/comment.models.js";
import uploadCloudinaryResult, { getURL } from "../utils/Cloudinary.js";
import axios from "axios";
import { NOTIFY_URL } from "../constants.js";

const getAllStorys = asyncHandler(async (req, res) => {
    const {
        limit = 10,
        search,
        sortBy = "title",
        sortType,
        username,
        story = false,
    } = req.query;

    //TODO: get all storys based on search, sort
    if (!search) {
        throw new ApiError(400, "search not found"); // Case-insensitive search on title
    }
    let filter = {};
    search !== "all"
        ? (filter.title = { $regex: search, $options: "i" })
        : (filter.title = { $regex: "", $options: "i" }); // Case-insensitive search on title

    if (username) {
        filter.owners = username; // Filter by owner ID if provided
    }

    // Build the sort object
    let sort = {};
    sort[sortBy] = sortType === "desc" ? -1 : 1; // Sort by the specified field and order

    try {
        // Fetch the stories with pagination, filtering, and sorting
        const stories = await Story.find(filter)
            .populate({
                path: "owners", // The field to populate
                select: "username id",
            })
            .sort(sort)
            .limit(parseInt(limit))
            .select(
                `-createdAt -updatedAt -isEditable ${!story ? "-story" : ""} -__v`
            );
        // Fetch the total count of stories for pagination purposes
        const totalStories = await Story.countDocuments(filter);

        // Send the response
        return res
            .status(200)
            .json(new ApiResponse(200, { stories, totalStories }));
    } catch (error) {
        throw new ApiError(500, error?.message || error);
    }
});

const WriteStory = asyncHandler(async (req, res) => {
    // TODO: get story, create story
    const {
        title,
        description = "",
        story,
        genre,
        owners = "",
        isEditable = false,
    } = req.body;

    const filePath = req.file?.path;

    const filePublicURL = filePath
        ? await uploadCloudinaryResult(filePath)
        : getURL("samples/tyanahyuokk3srada25e");
    if (!title || !description || !story || !genre) {
        throw new ApiError(400, "All fields are required");
    }
    let authors = owners.toString().split(",");
    let authorsId = [];

    if (authors.length > 1) {
        try {
            authorsId = await Promise.all(
                authors.map(async (author) => {
                    const user = await User.findOne({
                        username: author.toLowerCase(),
                    });
                    if (!user) {
                        throw new ApiError(404, "User not found");
                    }
                    return user._id;
                })
            );
            authorsId.push(req.user._id);
        } catch (error) {
            throw new ApiError(500, error?.message || error);
        }
    } else {
        authorsId.push(req.user._id);
    }
    

    const existedStory = await Story.findOne({
        title,
    });

    if (existedStory) {
        throw new ApiError(409, "Story with same title already exists");
    }

    const newStory = await Story.create({
        title,
        description,
        genre,
        story,
        owners: authorsId,
        isEditable,
        avatar: filePublicURL,
    });

    // Retrieve the story with populated fields
    if (newStory) {
        try {
            const user = await User.findByIdAndUpdate(
                req.user._id,
                { $addToSet: { storyHistory: newStory._id } },
                { new: true }
            );

            const populatedStory = await Story.findById(newStory._id)
                .populate("owners")
                .select("-__v -isEditable -createdAt -updatedAt ");

            if (!populatedStory) {
                throw new ApiError(
                    500,
                    "Something went wrong while creating story"
                );
            }
            authorsId.forEach(async (id) => {
                const user = await User.findById(id);
                await axios.post(`${NOTIFY_URL}/notify_user`, {
                    username: user.username,
                    email: user.email,
                    userId: id,
                    message: `${populatedStory.title} has been created and you are the owner`,
                    sentiment: "positive",
                });
            });
            res.status(201).json(
                new ApiResponse(
                    200,
                    { populatedStory, user },
                    "Story written Successfully"
                )
            );
        } catch (error) {
            res.status(500);
            throw new ApiError(500, error);
        }
    }
});

const getstoryById = asyncHandler(async (req, res) => {
    const { storyId } = req.params;
    const isValidId = mongoose.Types.ObjectId.isValid(storyId);
    if (!isValidId) {
        return res.status(400).json(new ApiResponse(400, "Invalid story ID"));
    }
    try {
        // Find the story by its ID and populate the 'owners' field
        const story = await Story.findById(storyId).select(
            "-__v  -createdAt -updatedAt "
        );

        if (!story) {
            res.status(404);
            throw new Error("Story not found");
        }

        res.status(200).json(new ApiResponse(200, story));
    } catch (error) {
        throw new ApiError(500, error.message);
    }
});

const updateStoryThumb = asyncHandler(async (req, res) => {
    const { storyId } = req.params;
    const filePath = req.file.path;
    if (!filePath) {
        throw new ApiError(404, "No file path found");
    }

    const story = await Story.findById(storyId).select("id isEditable owners");
    if (!story) {
        res.status(404);
        throw new ApiError(404, "Story not found");
    }
    if (!story.isEditable) {
        res.status(403);
        throw new ApiError(403, "Story is not editable");
    }
    const isOwner = story.owners.some((ownerId) =>
        ownerId.equals(req.user._id)
    );

    if (!isOwner) {
        res.status(401);
        throw new ApiError(401, "You are not allowed to update description");
    }
    const filePublicURL = await uploadCloudinaryResult(filePath);
    story.avatar = filePublicURL;
    await story.save();

    story.owners.forEach(async (id) => {
        const user = await User.findById(id);
        await axios.post(`${NOTIFY_URL}/notify_user`, {
            username: user.username,
            email: user.email,
            userId: id,
            message: `${story.title} thumbnail had been updated by ${req.user.username}`,
            sentiment: "positive",
        });
    });

    res.status(200).json(new ApiResponse(200, { imageURL: story.avatar }));
});

const updateStory = asyncHandler(async (req, res) => {
    const { storyId } = req.params;
    //TODO: update story details like title, description, thumbnail
    const { newStory } = req.body;

    // Find the story by ID and update the specified fields
    if (!newStory) throw new ApiError(400, "newStory all fields requiered");

    const story = await Story.findById(storyId).select("id isEditable owners");
    console.log({ story });

    if (!story) {
        res.status(404);
        throw new ApiError(404, "Story not found");
    }
    if (!story.isEditable) {
        res.status(403);
        throw new ApiError(403, "Story is not editable");
    }
    const isOwner = story.owners.some((ownerId) =>
        ownerId.equals(req.user._id)
    );

    if (!isOwner) {
        res.status(401);
        throw new ApiError(401, "You are not allowed to update description");
    }
    const updatedStory = await Story.findByIdAndUpdate(
        storyId,
        {
            $set: {
                story: newStory,
            },
        },
        { new: true, runValidators: true } // Return the updated document and run validation
    ).select("-__v  -createdAt -updatedAt ");
    if (!updatedStory) {
        throw new ApiError(500, "Failed to update the story");
    }
    story.owners.forEach(async (id) => {
        const user = await User.findById(id);
        await axios.post(`${NOTIFY_URL}/notify_user`, {
            username: user.username,
            email: user.email,
            userId: id,
            message: `${updatedStory.title} story had been updated by ${req.user.username}`,
            sentiment: "positive",
        });
    });

    res.status(200).json(new ApiResponse(200, { updatedStory }));
});

const updateStoryDescription = asyncHandler(async (req, res) => {
    const { storyId } = req.params;
    //TODO: update story details like title, description, thumbnail
    const { description } = req.body;

    try {
        // Find the story by ID and update the specified fields
        if (!description)
            throw new ApiError(400, "description of fields requiered");

        const story = await Story.findById(storyId).select(
            "id isEditable owners"
        );

        if (!story) {
            res.status(404);
            throw new ApiError(404, "Story not found");
        }
        if (!story.isEditable) {
            res.status(404);
            throw new ApiError(404, "Story is not editable");
        }
        const isOwner = story.owners.some((ownerId) =>
            ownerId.equals(req.user._id)
        );

        if (!isOwner)
            throw new ApiError(
                402,
                "You are not allowed to update description"
            );

        const updatedStory = await Story.findByIdAndUpdate(
            storyId,
            {
                $set: {
                    description,
                },
            },
            { new: true, runValidators: true } // Return the updated document and run validation
        ).populate("owners");
        story.owners.forEach(async (id) => {
            const user = await User.findById(id);
            await axios.post(`${NOTIFY_URL}/notify_user`, {
                username: user.username,
                email: user.email,
                userId: id,
                message: `${updatedStory.title} description had been updated by ${req.user.username}`,
                sentiment: "positive",
            });
        });
        res.status(200).json(new ApiResponse(200, { updatedStory }));
    } catch (error) {
        res.status(500);
        throw new ApiError(500, error);
    }
});

const updateStoryTitle = asyncHandler(async (req, res) => {
    const { storyId } = req.params;
    //TODO: update story details like title, description, thumbnail
    const { title } = req.body;

    try {
        // Find the story by ID and update the specified fields
        if (!title) throw new ApiError(400, "either of fields requiered");
        const story = await Story.findById(storyId).select(
            "id isEditable owners"
        );
        if (!story) {
            res.status(404);
            throw new ApiError(404, "Story not found");
        }
        if (!story.isEditable) {
            res.status(403);
            throw new ApiError(403, "Story is not editable");
        }
        const isOwner = story.owners.some((ownerId) =>
            ownerId.equals(req.user._id)
        );

        if (!isOwner)
            throw new ApiError(402, "You are not allowed to update this");
        const updatedStory = await Story.findByIdAndUpdate(
            storyId,
            {
                $set: {
                    title,
                },
            },
            { new: true, runValidators: true } // Return the updated document and run validation
        );
        console.log(story.owners);

        story.owners.forEach(async (id) => {
            const user = await User.findById(id);
            const res = await axios.post(`${NOTIFY_URL}/notify_user`, {
                username: user.username,
                email: user.email,
                userId: id,
                message: `${story.title} title  had been updated to ${updatedStory.title} by ${req.user.username}`,
                sentiment: "positive",
            });
        });
        res.status(200).json(new ApiResponse(200, { updatedStory }));
    } catch (error) {
        res.status(500);
        throw new ApiError(500, error?.message || error);
    }
});

const deleteStory = asyncHandler(async (req, res) => {
    const { storyId } = req.params;

    //TODO: delete story
    try {
        if (!storyId) throw new ApiError(401, "id is required");
        const story = await Story.findById(storyId).select(
            "id isEditable owners"
        );
        if (!story) {
            res.status(404);
            throw new ApiError(404, "Story not found");
        }
        const isOwner = await story.owners.some((ownerId) =>
            ownerId.equals(req.user._id)
        );

        if (!isOwner)
            throw new ApiError(402, "You are not allowed to delete this");

        const storyDeleted = await Story.findByIdAndDelete(storyId);
        story.owners.forEach(async (id) => {
            const user = await User.findById(id);
            await axios.post(`${NOTIFY_URL}/notify_user`, {
                username: user.username,
                email: user.email,
                userId: id,
                message: `${story.title} title  had been deleted by ${req.user.username}`,
                sentiment: "negative",
            });
        });
        return res.status(200).json(new ApiResponse(200, storyDeleted));
    } catch (error) {
        throw new ApiError(500, "Something went wrong");
    }
});

const likeStory = asyncHandler(async (req, res) => {
    const { storyId } = req.body;

    if (!storyId) {
        res.status(404);
        throw new ApiError(404, "Story id not found");
    }
    const story = await Story.findById(storyId).select("id isEditable owners");
    if (!story) {
        res.status(404);
        throw new ApiError(404, "Story not found");
    }

    const hasUserLiked = await Like.aggregate([
        {
            $match: {
                likedStory: new mongoose.Types.ObjectId(storyId),
                likedUser: req.user._id,
            },
        },
        {
            $addFields: { hasLiked: true },
        },
        {
            $project: { hasLiked: 1 },
        },
    ]);

    if (hasUserLiked.length > 0) {
        console.log(hasUserLiked);

        const like = await Like.findOneAndDelete({
            likedStory: storyId,
            likedUser: req.user._id,
        });
        return res
            .status(200)
            .json(new ApiResponse(200, like, "Story unliked"));
    }

    const like = await Like.create({
        likedStory: storyId,
        likedUser: req.user._id,
    });
    if (!like) {
        res.status(500);
        throw new ApiError(500, "Could not like the story");
    }

    return res.status(200).json(new ApiResponse(200, like));
});

const commentStory = asyncHandler(async (req, res) => {
    const { storyId, comment } = req.body;
    if (!storyId || !comment) {
        res.status(404);
        throw new ApiError(404, "Story id and comment are requried");
    }
    const story = await Story.findById(storyId).select("id isEditable owners");
    if (!story) {
        res.status(404);
        throw new ApiError(404, "Story not found");
    }
    const commentedStory = await Comment.create({
        comment,
        commentedStory: storyId,
        commenter: req.user._id,
    });
    if (!commentedStory) {
        res.status(500);
        throw new ApiError(500, "Could not comment on the story");
    }
    story.comments.push(commentedStory._id);
    await story.save();
    return res
        .status(200)
        .json(new ApiResponse(200, { commentedStory, story }));
});

const getAllLikes = asyncHandler(async (req, res) => {
    const { storyId } = req.body;

    const likes = await Like.aggregate([
        {
            $match: { likedStory: new mongoose.Types.ObjectId(storyId) },
        },
        {
            $lookup: {
                from: "users",
                localField: "likedUser",
                foreignField: "_id",
                as: "likedUsers",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                        },
                    },
                ],
            },
        },
        {
            $facet: {
                userDetails: [
                    {
                        $project: {
                            likedUsers: 1,
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

    const hasUserLiked = await Like.aggregate([
        {
            $addFields: { hasLiked: false },
        },
        {
            $match: {
                likedStory: new mongoose.Types.ObjectId(String(storyId)),
                likedUser: req.user._id,
            },
        },
        {
            $addFields: {
                hasLiked: true,
            },
        },
        {
            $project: {
                hasLiked: 1,
            },
        },
    ]);
    res.status(200).json(new ApiResponse(200, { likes, hasUserLiked }));
});

const getAllComments = asyncHandler(async (req, res) => {
    const { storyId } = req.body;

    const comments = await Comment.aggregate([
        {
            $match: { commentedStory: new mongoose.Types.ObjectId(storyId) },
        },
        {
            $lookup: {
                from: "users",
                localField: "commenter",
                foreignField: "_id",
                as: "commentedUsers",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                        },
                    },
                ],
            },
        },
        {
            $facet: {
                userDetails: [
                    {
                        $project: {
                            commentedUsers: 1,
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

const editComments = asyncHandler(async (req, res) => {
    const { comment, commentId } = req.body;
    if (!commentId || !comment) {
        res.status(404);
        throw new ApiError(404, "Comment id and comment are requried");
    }

    const commentedStory = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                comment,
            },
        },
        { new: true }
    );

    if (!commentedStory) {
        res.status(500);
        throw new ApiError(500, "Could not comment on the story");
    }

    return res.status(200).json(new ApiResponse(200, await commentedStory));
});

const deleteComments = asyncHandler(async (req, res) => {
    const { commentId } = req.body;
    if (!commentId) {
        res.status(404);
        throw new ApiError(404, " comment id is requried");
    }

    const commentedStory = await Comment.findByIdAndDelete(commentId);

    if (!commentedStory) {
        res.status(500);
        throw new ApiError(500, "Could not comment on the story");
    }

    return res.status(200).json(new ApiResponse(200, commentedStory));
});

export {
    getAllStorys,
    WriteStory,
    getstoryById,
    updateStoryDescription,
    updateStoryTitle,
    updateStory,
    deleteStory,
    likeStory,
    commentStory,
    getAllLikes,
    getAllComments,
    editComments,
    deleteComments,
    updateStoryThumb,
};
