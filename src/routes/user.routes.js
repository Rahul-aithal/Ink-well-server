import { Router } from "express";
import {
    changeCurrentPassword,
    deleteNotification,
    getCommentHistory,
    getCurrentUser,
    getLikesHistory,
    getNotifications,
    getstoryHistory,
    refreshAccessToken,
    searchUserByUserName,
    signIn,
    signOut,
    signUp,
    updateEmail,
    updateUsername,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.post("/sign-in", signIn);
router.post("/sign-up", signUp);

// secured
router.post("/sign-out", verifyToken, signOut);
router.post("/refresh-accessToken", refreshAccessToken);
//Update
router.put("/update-password", verifyToken, changeCurrentPassword);
router.put("/update-username", verifyToken, updateUsername);
router.put("/update-email", verifyToken, updateEmail);
//Get 
router.get("/get-user", verifyToken, getCurrentUser);
router.get("/get-user-history", verifyToken, getstoryHistory);
router.get("/get-user-by-username", verifyToken, searchUserByUserName);
router.get("/get-all-commented", verifyToken, getCommentHistory);
router.get("/get-all-liked", verifyToken, getLikesHistory);
router.get("/get-notification", verifyToken, getNotifications);
//Delete
router.delete("/delete-notification/:notificationId", verifyToken, deleteNotification);
export default router;
