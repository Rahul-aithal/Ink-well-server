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
    updateStoryTitle,
    WriteStory,
} from "../controllers/story.controller.js";
import { verifyToken } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.get("/get-all-story", getAllStorys);
router.post("/write-story", verifyToken, WriteStory);
router.get("/get-story-by-id/:storyId", verifyToken, getstoryById);
router.put("/update-story-title/:storyId", verifyToken, updateStoryTitle);
router.put(
    "/update-story-description/:storyId",
    verifyToken,
    updateStoryDescription
);
router.put("/update-story/:storyId", verifyToken, updateStory);
router.delete("/delete-story/:storyId", verifyToken, deleteStory);
router.post("/comment", verifyToken, commentStory);
router.post("/like", verifyToken, likeStory);
router.get("/get-all-comments/:storyId", getAllComments);
router.get("/get-all-like/:storyId", getAllLikes);
// router.get('/toggle-PublishStatus',togglePublishStatus);

export default router;
