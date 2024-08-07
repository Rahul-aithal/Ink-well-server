import {Router} from "express";
import { refreshAccessToken, signIn, signOut, signUp } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/verifyJWT.middleware.js";

const router=Router();

router.post("/sign-in",signIn);
router.post("/sign-up",signUp);

// secured
router.post("/sign-out",verifyToken,signOut);
router.post("/refresh-accessToken",refreshAccessToken);


export default router


