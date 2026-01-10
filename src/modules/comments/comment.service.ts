import { Comment, CommentStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createComment = async (payload: {
  content: string;
  authorId: string;
  postId: string;
  parentId?: string;
}) => {
    await prisma.post.findUniqueOrThrow({
        where: {
            id: payload.postId
        }
    })
    if(payload.parentId){
        await prisma.comment.findUniqueOrThrow({
          where: {
            id: payload.parentId,
          },
        });
    }
  return await prisma.comment.create({
    data: payload
  });
};

const getCommentById = async (id: string) => {
  return await prisma.comment.findUnique({
    where: { id },
    include: {
        post: {
            select: {
                id: true,
                title: true,
                views: true
            }
        }
    }
  });
};

const getCommentByAuthorId = async (id: string) => {
  return await prisma.comment.findMany({
    where: { authorId: id },
    orderBy: {
      createdAt: "desc",
    },
    include: {
        post: {
            select: {
                id: true,
                title: true
            }
        }
    }
  });
};

const updateComment = async (id: string, data: { content?: string, status?: CommentStatus}, authorId: string) => {
  const commentData = await prisma.comment.findUnique({
    where: {
      id, authorId
    }
  })
  if (!commentData) {
    throw new Error("Comment not found");
  }
  return await prisma.comment.update({
    where: { id, authorId },
    data,
  });
}

const deleteComment = async (commentId: string, authorId: string) => {
  const commentData = await prisma.comment.findUnique({
    where: {
      id: commentId,
      authorId
    },
    select: {
      id: true,
      content: true,
    }
  })
  if (!commentData) {
    throw new Error("Comment not found");
  }
  return await prisma.comment.delete({
    where: {
      id: commentId
    },
  });
};

const moderateComment = async (id: string, data: {status: CommentStatus}) => {
  const commentData = await prisma.comment.findUniqueOrThrow({
    where: {id},
    select: { id: true, status: true}
  })
  if(commentData.status === data.status){
    throw new Error(`Comment is already set to ${data.status}`)
  }
  return await prisma.comment.update({
    where: {id},
    data
  })
}

export const commentServices = {
    createComment,
    getCommentById,
    getCommentByAuthorId,
    updateComment,
    deleteComment,
    moderateComment
}