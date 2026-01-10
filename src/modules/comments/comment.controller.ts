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
    req.body.authorId = req.user.id as string
    const result = await commentServices.createComment(req.body);
    return res.status(201).json(result);
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: "Comment creation failed",
      details: error,
    });
  }
};

export const commentController = {
  createComment,
};