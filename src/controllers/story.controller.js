import mongoose, { isValidObjectId } from "mongoose";
import { Story } from "../models/stroy.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

const getAllStorys = asyncHandler(async (req, res) => {
    const {
        limit = 10,
        query,
        sortBy = "title",
        sortType,
        username,
    } = req.body;
    //TODO: get all storys based on query, sort
    if (!query) {
        console.log(query);
        throw new ApiError(404, "query is required");
    }
    let filter = {};
    if (query) {
        filter.title = { $regex: query, $options: "i" }; // Case-insensitive search on title
    }
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
                select: "-updatedAt -createdAt -storyHistory -refreshToken -password",
            })
            .sort(sort)
            .limit(parseInt(limit));

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
    const { title, description, story, genre, owners } = req.body;
    if (!title || !description || !story || !genre) {
        throw new ApiError(400, "All fields are required");
    }
    let authors = owners.toString().split(",");
    console.log(authors);
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
        throw new ApiError(409, "Story with email or username already exists");
    }
    const newStory = await Story.create({
        title,
        description,
        genre,
        story,
        owners: authorsId,
    });

    // Retrieve the story with populated fields
    const populatedStory = await Story.findById(newStory._id).populate(
        "owners"
    );

    if (!populatedStory) {
        throw new ApiError(500, "Something went wrong while creating story");
    }

    res.status(201).json(
        new ApiResponse(200, populatedStory, "Story written Successfully")
    );
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

        return res.status(200).json(ApiResponse(200, storyDeleted));
    } catch (error) {
        throw new ApiError(500, "Something went wrong");
    }
});

export {
    getAllStorys,
    WriteStory,
    getstoryById,
    updateStoryDescription,
    updateStoryTitle,
    updateStory,
    deleteStory,
};
