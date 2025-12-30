import express, { Application } from "express";
import { postRouter } from "./modules/posts/post.route";

const app:Application = express();

//* middlewares
app.use(express.json());


//* routes
app.get("/", (req, res) => {
    res.send("Welcome to M23-Prisma-Blog-App")
})

app.use("/posts", postRouter);

export default app