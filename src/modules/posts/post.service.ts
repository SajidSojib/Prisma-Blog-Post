import { Post } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const createPost = async (data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...data,
            authorId: userId
        }
    })
    return result;
}

const getAllPosts = async (search: string | undefined, tagsQuerty: string[]) =>{
    const addConditions: PostWhereInput[] = [];
    if(tagsQuerty.length > 0){
        addConditions.push({
            tags: {
                hasEvery: tagsQuerty
            }
        })
    }
    if(search){
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
        where: {
            AND: addConditions
        }
    });
    return result;
}

export const postService = {
    createPost,
    getAllPosts
}