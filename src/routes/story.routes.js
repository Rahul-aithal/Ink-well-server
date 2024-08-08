import { Router } from "express";
import {
    deleteStory,
    getAllStorys,
    getstoryById,
    updateStory,
    updateStoryDescription,
    updateStoryTitle,
    WriteStory,
} from "../controllers/story.controller.js";
import { verifyToken } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.get("/get-all-story", getAllStorys);
router.post("/write-story", verifyToken,WriteStory);
router.get("/get-story-by-id/:storyId",verifyToken, getstoryById);
router.put("/update-story-title/:storyId",verifyToken, updateStoryTitle);
router.put("/update-story-description/:storyId",verifyToken, updateStoryDescription);
router.put("/update-story/:storyId",verifyToken,updateStory);
router.post("/delete-story",verifyToken, deleteStory);
// router.get('/toggle-PublishStatus',togglePublishStatus);

export default router;
