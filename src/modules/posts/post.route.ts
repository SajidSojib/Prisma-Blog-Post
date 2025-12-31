import { Router } from "express";
import postController from "./post.controller";
import auth, { userRole } from "../../middlewires/auth";


const router = Router();

router.post("/", auth(userRole.USER, userRole.ADMIN), postController.createPost);
router.get("/", postController.getAllPosts);

export const postRouter:Router = router;