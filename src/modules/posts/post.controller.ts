import { Request, Response } from "express";
import { postService } from "./post.service";

const createPost = async (req: Request, res: Response) => {
  try {
    const result = await postService.createPost(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ 
        error: "Post created failed", 
        details: error 
    });
  }
};

const getAllPosts = async (req: Request, res: Response) => {
  try {
    const result = await postService.getAllPosts();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ 
        error: "Get all posts failed", 
        details: error 
    });
  }
};


const postController = {
  createPost,
  getAllPosts
};

export default postController;
