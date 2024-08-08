import {Router} from "express";
import { changeCurrentPassword, getCurrentUser, refreshAccessToken, signIn, signOut, signUp, updateEmail, updateUsername} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/verifyJWT.middleware.js";

const router=Router();

router.post("/sign-in",signIn);
router.post("/sign-up",signUp);

// secured
router.post("/sign-out",verifyToken,signOut);
router.post("/refresh-accessToken",refreshAccessToken);
router.put("/update-password",verifyToken,changeCurrentPassword);
router.put("/update-username",verifyToken,updateUsername);
router.put("/update-email",verifyToken,updateEmail);
router.get("/get-user",verifyToken,getCurrentUser);


export default router


