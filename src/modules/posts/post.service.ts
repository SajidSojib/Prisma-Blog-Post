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
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
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
          orderBy: {
            createdAt: "desc",
          },
          include: {
            replies: {
              where: {
                status: CommentStatus.APPROVED,
              },
              orderBy: {
                createdAt: "asc",
              },
              include: {
                replies: {
                  where: {
                    status: CommentStatus.APPROVED,
                  },
                  orderBy: {
                    createdAt: "asc",
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            comments: {
              where: {
                status: CommentStatus.APPROVED,
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

const getMyPosts = async (userId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
      status: true,
    },
    select: {
      id: true,
    },
  });
  const result = await prisma.post.findMany({
    where: {
      authorId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  // const total = await prisma.post.count({
  //   where: {
  //     authorId: userId,
  //   },
  // })
  const total = await prisma.post.aggregate({
    _count: {
      id: true,
    },
    _avg: {
      views: true,
    },
    where: {
      authorId: userId,
    },
  });
  return {
    data: result,
    total,
  };
};

const updatePost = async (
  postId: string,
  data: Partial<Post>,
  userId: string,
  isAdmin: boolean
) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      authorId: true,
    },
  });

  if (!isAdmin && postData.authorId !== userId) {
    throw new Error("You are not authorized to update this post");
  }
  if (!isAdmin) {
    delete data.isFeatured;
  }

  return await prisma.post.update({
    where: {
      id: postId,
    },
    data,
  });
};

const deletePost = async (postId: string, userId: string, isAdmin: boolean) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      authorId: true,
    },
  });

  if (!isAdmin && postData.authorId !== userId) {
    throw new Error("You are not authorized to delete this post");
  }
  return await prisma.post.delete({
    where: {
      id: postId,
    },
  });
};

const getStats = async () => {
  return await prisma.$transaction(async (tx) => {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      archivePosts,
      totalComments,
      approvedComments,
      totalUsers,
      adminCount,
      userCount,
      totalViews,
      avgViews,
    ] = await Promise.all([
      await tx.post.count(),
      await tx.post.count({where: {status: PostStatus.PUBLISHED}}),
      await tx.post.count({where: {status: PostStatus.DRAFT}}),
      await tx.post.count({where: {status: PostStatus.ARCHIVE}}),
      await tx.comment.count(),
      await tx.comment.count({where: {status: CommentStatus.APPROVED}}),
      await tx.user.count(),
      await tx.user.count({where: {role: "ADMIN"}}),
      await tx.user.count({where: {role: "USER"}}),
      await tx.post.aggregate({
        _sum: {
          views: true,
        },
      }),
      await tx.post.aggregate({
        _avg: {
          views: true,
        },
      }),
    ]);

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      archivePosts,
      totalComments,
      approvedComments,
      totalUsers,
      adminCount,
      userCount,
      totalViews: totalViews._sum.views || 0,
      avgViews: avgViews._avg.views || 0,
    };
  });
};

export const postService = {
  createPost,
  getAllPosts,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
  getStats
};
