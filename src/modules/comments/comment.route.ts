import { Router } from "express";
import { commentController } from "./comment.controller";
import auth, { userRole } from "../../middlewires/auth";


const router = Router();

router.post("/", auth(userRole.USER, userRole.ADMIN), commentController.createComment);
router.get("/author/:authorId", commentController.getCommentByAuthorId);
router.get("/:commentId", commentController.getCommentById);
router.patch("/:commentId", auth(userRole.USER, userRole.ADMIN), commentController.updateComment);
router.delete("/:commentId", auth(userRole.USER, userRole.ADMIN), commentController.deleteComment);

export const commentRouter:Router = router;