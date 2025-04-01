import { Router } from "express";
import {
    commentStory,
    deleteStory,
    getAllComments,
    getAllLikes,
    getAllStorys,
    getstoryById,
    likeStory,
    updateStory,
    updateStoryDescription,
    updateStoryThumb,
    updateStoryTitle,
    WriteStory,
} from "../controllers/story.controller.js";
import { verifyToken } from "../middlewares/verifyJWT.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// GET routes
router.get("/get-all-story", getAllStorys);
router.get("/get-story-by-id/:storyId", verifyToken, getstoryById);
// router.get('/toggle-PublishStatus', togglePublishStatus);

// POST routes
router.post("/write-story", verifyToken, upload.single("image"), WriteStory);
router.post("/comment", verifyToken, commentStory);
router.post("/like", verifyToken, likeStory);
router.post("/get-all-comments", getAllComments);
router.post("/get-all-like", verifyToken, getAllLikes);

// PUT routes
router.put("/update-story-title/:storyId", verifyToken, updateStoryTitle);
router.put("/update-story-description/:storyId", verifyToken, updateStoryDescription);
router.put("/update-thumb/:storyId", verifyToken, upload.single("image"), updateStoryThumb);
router.put("/update-story/:storyId", verifyToken, updateStory);

// DELETE routes
router.delete("/delete-story/:storyId", verifyToken, deleteStory);

export default router;
