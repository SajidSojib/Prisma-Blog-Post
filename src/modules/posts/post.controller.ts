import { Request, Response } from "express";
import { postService } from "./post.service";
import { PostStatus } from "../../../generated/prisma/enums";
import peginationSortingHelper from "../../helpers/peginationSortingHelper";

const createPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized",
      });
    }
    const result = await postService.createPost(
      req.body,
      req.user.id as string
    );
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      error: "Post created failed",
      details: error,
    });
  }
};

const getAllPosts = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const searchString = typeof search === "string" ? search : undefined;

    const tagsQuerty = req.query.tags
      ? (req.query.tags as string).split(",")
      : [];

    const isFeatured = req.query.isFeatured
      ? req.query.isFeatured === "true"
        ? true
        : req.query.isFeatured === "false"
        ? false
        : undefined
      : undefined;

    const status = req.query.status as PostStatus|undefined;
    const authorId = req.query.authorId as string|undefined

    const { skip, take, orderBy } =peginationSortingHelper(req.query);

    const result = await postService.getAllPosts(
      searchString,
      tagsQuerty,
      isFeatured,
      status,
      authorId,
      skip,
      take,
      orderBy
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: "Get all posts failed",
      details: error,
    });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    if(!postId){
      return res.status(400).json({
        error: "Post id is required",
      });
    }
    const result = await postService.getPostById(postId);
    res.status(200).json(result);

  } catch (error) {
    res.status(400).json({
      error: "Get post by id failed",
      details: error,
    });
  }
};

const getMyPosts = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized",
      });
    }
    const result = await postService.getMyPosts(req.user.id as string);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: "Get my posts failed",
      details: error,
    });
  }
}

const updatePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const isAdmin = req.user?.role === "ADMIN";
    const result = await postService.updatePost(postId as string, req.body, req.user?.id as string, isAdmin);
    res.status(200).json(result);
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : "Update post failed";
    res.status(400).json({
      error: errorMessage || "Update post failed",
      details: error,
    });
  }
};

const postController = {
  createPost,
  getAllPosts,
  getPostById,
  getMyPosts,
  updatePost
};

export default postController;
