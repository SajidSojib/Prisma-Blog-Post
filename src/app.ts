import express, { Application } from "express";
import { postRouter } from "./modules/posts/post.route";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import { commentRouter } from "./modules/comments/comment.route";

const app:Application = express();
app.all("/api/auth/{*any}", toNodeHandler(auth));

//* middlewares
app.use(express.json());
app.use(cors({
    origin: process.env.APP_URL || "http://localhost:4000",
    credentials: true
}))

//* routes
app.get("/", (req, res) => {
    res.send("Welcome to M23-Prisma-Blog-App")
})

app.use("/posts", postRouter);
app.use("/comments", commentRouter);

export default app