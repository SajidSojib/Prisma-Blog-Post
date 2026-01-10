import { commentServices } from "./comment.service";
import { Request, Response } from "express";
const createComment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized",
      });
    }
    req.body.authorId = req.user.id as string;
    const result = await commentServices.createComment(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      error: "Comment creation failed",
      details: error,
    });
  }
};

const getCommentById = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const result = await commentServices.getCommentById(commentId as string);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: "Get comment by id failed",
      details: error,
    });
  }
};

const getCommentByAuthorId = async (req: Request, res: Response) => {
  try {
    const { authorId } = req.params;
    const result = await commentServices.getCommentByAuthorId(
      authorId as string
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: "Get comment by author id failed",
      details: error,
    });
  }
};

const updateComment = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      error: "Update comment failed",
      details: error,
    });
  }
};

const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const result = await commentServices.deleteComment(
      commentId as string,
      req.user?.id as string
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: "Delete comment failed",
      details: error,
    });
  }
};

export const commentController = {
  createComment,
  getCommentById,
  getCommentByAuthorId,
  updateComment,
  deleteComment,
};
