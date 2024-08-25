import mongoose from "mongoose";
import { Story } from "../models/stroy.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { Like } from "../models/like.models.js";
import { Comment } from "../models/comment.models.js";

const getAllStorys = asyncHandler(async (req, res) => {
    const {
        limit = 10,
        search,
        sortBy = "title",
        sortType,
        username,
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
            .select("-createdAt -updatedAt -isEditable");
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
    const { title, description = "", story, genre, owners = "" } = req.body;
    if (!title || !description || !story || !genre) {
        throw new ApiError(400, "All fields are required");
    }
    let authors = owners.toString().split(",");
    // console.log(authors);
    let authorsId;

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
        authorsId = req.user._id;
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
    });

    // Retrieve the story with populated fields
    if (newStory) {
        try {
            const user = await User.findByIdAndUpdate(
                req.user._id,
                {
                    $set: {
                        storyHistory: newStory._id,
                    },
                },
                { new: true }
            );
            const populatedStory = await Story.findById(newStory._id).populate(
                "owners"
            );

            if (!populatedStory) {
                throw new ApiError(
                    500,
                    "Something went wrong while creating story"
                );
            }

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
        const story = await Story.findById(storyId);

        if (!story) {
            res.status(404);
            throw new Error("Story not found");
        }

        res.status(200).json(new ApiResponse(200, story));
    } catch (error) {
        throw new ApiError(500, error.message);
    }
});

const updateStory = asyncHandler(async (req, res) => {
    const { storyId } = req.params;
    //TODO: update story details like title, description, thumbnail
    const { newStory } = req.body;

    try {
        // Find the story by ID and update the specified fields
        if (!newStory) throw new ApiError(400, "newStory of fields requiered");

        const story = await Story.findById(storyId);

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
                    story: newStory,
                },
            },
            { new: true, runValidators: true } // Return the updated document and run validation
        );
        if (updatedStory) {
            try {
                const user = await User.findByIdAndUpdate(
                    req.user._id,
                    {
                        $set: {
                            storyHistory: updatedStory._id,
                        },
                    },
                    { new: true }
                );
                res.status(200).json(
                    new ApiResponse(200, { updatedStory, user })
                );
            } catch (error) {
                res.status(500);
                throw new ApiError(500, error);
            }
        }
    } catch (error) {
        res.status(500);
        throw new ApiError(500, error);
    }
});

const updateStoryDescription = asyncHandler(async (req, res) => {
    const { storyId } = req.params;
    //TODO: update story details like title, description, thumbnail
    const { description } = req.body;

    try {
        // Find the story by ID and update the specified fields
        if (!description)
            throw new ApiError(400, "description of fields requiered");

        const story = await Story.findById(storyId);

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

        if (updatedStory) {
            try {
                const user = await User.findByIdAndUpdate(
                    req.user._id,
                    {
                        $set: {
                            storyHistory: updatedStory._id,
                        },
                    },
                    { new: true }
                );
                res.status(200).json(
                    new ApiResponse(200, { updatedStory, user })
                );
            } catch (error) {
                res.status(500);
                throw new ApiError(500, error);
            }
        }
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
        const story = await Story.findById(storyId);
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

        if (updatedStory) {
            try {
                const user = await User.findByIdAndUpdate(
                    req.user._id,
                    {
                        $set: {
                            storyHistory: updatedStory._id,
                        },
                    },
                    { new: true }
                );
                res.status(200).json(
                    new ApiResponse(200, { updatedStory, user })
                );
            } catch (error) {
                res.status(500);
                throw new ApiError(500, error);
            }
        }
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
        const story = await Story.findById(storyId);
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
            throw new ApiError(402, "You are not allowed to update this");

        const storyDeleted = await Story.findByIdAndDelete(storyId);

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
    const story = await Story.findById(storyId);
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
    const story = await Story.findById(storyId);
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
                likedStory: new mongoose.Types.ObjectId(storyId),
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
};
