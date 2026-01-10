import {
  CommentStatus,
  Post,
  PostStatus,
} from "../../../generated/prisma/client";
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
  isFeatured: boolean | undefined,
  status: PostStatus | undefined,
  authorId: string | undefined,
  skip: number,
  take: number,
  orderBy: Record<string, "asc" | "desc">
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
    skip,
    take,
    where: {
      AND: addConditions,
    },
    orderBy,
  });
  const total = await prisma.post.count({
    where: {
      AND: addConditions,
    },
  });

  return {
    data: result,
    pegination: {
      total,
      limit: take,
      page: skip / take + 1,
      totalPages: Math.ceil(total / take),
    },
  };
};

const getPostById = async (id: string) => {
  const result = await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });
    const postData = await tx.post.findUnique({
      where: {
        id,
      },
      include: {
        comments: {
          where: {
            parentId: null,
            status: CommentStatus.APPROVED,
          },
          include: {
            replies: {
              where: {
                status: CommentStatus.APPROVED,
              },
              include: {
                replies: {
                  where: {
                    status: CommentStatus.APPROVED,
                  },
                },
              },
            },
          },
        },
      },
    });

    return postData;
  });
  return result;
};

export const postService = {
  createPost,
  getAllPosts,
  getPostById,
};
