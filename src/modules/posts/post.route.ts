import { Router } from "express";
import postController from "./post.controller";
import auth, { userRole } from "../../middlewires/auth";


const router = Router();

router.post("/", auth(userRole.USER, userRole.ADMIN), postController.createPost);
router.get("/", postController.getAllPosts);
router.get("/my-posts", auth(userRole.USER, userRole.ADMIN), postController.getMyPosts);
router.get("/:postId", postController.getPostById);
router.patch("/:postId", auth(userRole.USER, userRole.ADMIN), postController.updatePost);

export const postRouter:Router = router;