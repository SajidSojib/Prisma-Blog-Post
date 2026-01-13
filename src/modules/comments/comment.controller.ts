import asyncHandler from "../../utils/asyncHandler";
import { commentServices } from "./comment.service";
import { Request, Response } from "express";
const createComment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized",
      });
    }
    req.body.authorId = req.user.id as string;
    const result = await commentServices.createComment(req.body);
    return res.status(201).json(result);
});


const getCommentById = asyncHandler(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const result = await commentServices.getCommentById(commentId as string);
  res.status(200).json(result);
});


const getCommentByAuthorId = asyncHandler(async (req: Request, res: Response) => {
  const { authorId } = req.params;
  const result = await commentServices.getCommentByAuthorId(authorId as string);
  res.status(200).json(result);
});


const updateComment = asyncHandler(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const authorId =
    req.user?.role === "ADMIN"
      ? req.body.authorId
        ? req.body.authorId
        : req.user?.id
      : req.user?.id;
  const result = await commentServices.updateComment(
    commentId as string,
    req.body,
    authorId as string
  );
  res.status(200).json(result);
});


const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const result = await commentServices.deleteComment(
    commentId as string,
    req.user?.id as string
  );
  res.status(200).json(result);
});


const moderateComment = asyncHandler(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  console.log(commentId);
  const result = await commentServices.moderateComment(
    commentId as string,
    req.body
  );
  res.status(200).json(result);
});

export const commentController = {
  createComment,
  getCommentById,
  getCommentByAuthorId,
  updateComment,
  deleteComment,
  moderateComment
};
