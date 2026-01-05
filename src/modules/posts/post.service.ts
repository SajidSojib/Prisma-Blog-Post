import { Post, PostStatus } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
  userId: string
) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      authorId: userId,
    },
  });
  return result;
};

const getAllPosts = async (
  search: string | undefined,
  tagsQuerty: string[],
  isFeatured?: boolean | undefined,
  status?: PostStatus | undefined,
  authorId?: string | undefined,
  page: number = 1,
  limit: number = 10,
  sortBy?: string | undefined,
  sortOrder?: "asc" | "desc" | undefined
) => {
  const addConditions: PostWhereInput[] = [];

  if (authorId) {
    addConditions.push({
      authorId: authorId,
    });
  }
  if (status) {
    addConditions.push({
      status: status,
    });
  }
  if (typeof isFeatured === "boolean") {
    addConditions.push({
      isFeatured: isFeatured,
    });
  }
  if (tagsQuerty.length > 0) {
    addConditions.push({
      tags: {
        hasEvery: tagsQuerty,
      },
    });
  }
  if (search) {
    addConditions.push({
      OR: [
        {
          title: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: search as string,
          },
        },
      ],
    });
  }
  const result = await prisma.post.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where: {
      AND: addConditions,
    },
    orderBy: sortBy && sortOrder ? {
      [sortBy]: sortOrder
    }:{ createdAt: "desc" }
  });
  return result;
};

export const postService = {
  createPost,
  getAllPosts,
};
