import express, { type Request, type Response } from "express";
const app = express();
import { userRoute } from "./modules/users/users.route";
import { issueRoute } from "./modules/issues/issues.route";
import { authRouter } from "./modules/auth/auth.route";

// middleware
app.use(express.json());

app.use("/api/auth", userRoute);
app.use("/api", issueRoute);
app.use("/api/auth", authRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

export default app;
