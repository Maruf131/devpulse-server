import express, { type Request, type Response } from "express";
const app = express();
import { userRoute } from "./modules/users/users.route";

// middleware
app.use(express.json());

app.use("/api/auth", userRoute);

app.get("/user", (req: Request, res: Response) => {
  res.send("Hello World!");
});

export default app;
