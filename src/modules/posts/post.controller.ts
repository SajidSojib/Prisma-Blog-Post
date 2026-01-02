import { Request, Response } from "express";
import { postService } from "./post.service";

const createPost = async (req: Request, res: Response) => {
  try {
    if(!req.user){
      return res.status(401).json({
        success: false,
        message: "You are not authorized"
      })
    }
    const result = await postService.createPost(req.body, req.user.id as string);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ 
        error: "Post created failed", 
        details: error 
    });
  }
};

const getAllPosts = async (req: Request, res: Response) => {
  try {
    const {search} = req.query;
    const searchString = (typeof search === "string") ? search : undefined;
    const tagsQuerty = req.query.tags ? (req.query.tags as string).split(",") : [];
    const result = await postService.getAllPosts(searchString, tagsQuerty);
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
