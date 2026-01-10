import { Router } from "express";
import { commentController } from "./comment.controller";
import auth, { userRole } from "../../middlewires/auth";


const router = Router();

router.post("/", auth(userRole.USER, userRole.ADMIN), commentController.createComment);

export const commentRouter:Router = router;