import { Router } from "express";
import postController from "./post.controller";


const router = Router();

router.post("/", postController.createPost);
router.get("/", postController.getAllPosts);

export const postRouter:Router = router;