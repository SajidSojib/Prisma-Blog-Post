import { Request, Response } from "express";
import { postService } from "./post.service";
import { PostStatus } from "../../../generated/prisma/enums";
import peginationSortingHelper from "../../helpers/peginationSortingHelper";
import asyncHandler from "../../utils/asyncHandler";

const createPost = asyncHandler(async (req: Request, res: Response) => {
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
});

const getAllPosts = asyncHandler(async (req: Request, res: Response) => {
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

  const status = req.query.status as PostStatus | undefined;
  const authorId = req.query.authorId as string | undefined;

  const { skip, take, orderBy } = peginationSortingHelper(req.query);

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
});

const getPostById = asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;
    if(!postId){
      return res.status(400).json({
        error: "Post id is required",
      });
    }
    const result = await postService.getPostById(postId);
    res.status(200).json(result);
})

const getMyPosts = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized",
      });
    }
    const result = await postService.getMyPosts(req.user.id as string);
    res.status(200).json(result);
});

const updatePost = asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const isAdmin = req.user?.role === "ADMIN";
    const result = await postService.updatePost(
      postId as string,
      req.body,
      req.user?.id as string,
      isAdmin
    );
    res.status(200).json(result);
});

const deletePost = asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const isAdmin = req.user?.role === "ADMIN";
    const result = await postService.deletePost(
      postId as string,
      req.user?.id as string,
      isAdmin
    );
    res.status(200).json(result);
});


const getStats = asyncHandler(async (req: Request, res: Response) => {
    const result = await postService.getStats();
    res.status(200).json(result);
});

const postController = {
  createPost,
  getAllPosts,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
  getStats
};

export default postController;
