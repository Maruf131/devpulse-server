import express, {} from "express";
const app = express();
import { userRoute } from "./modules/users/users.route";
import { issueRoute } from "./modules/issues/issues.route";
import { authRouter } from "./modules/auth/auth.route";
// middleware
app.use(express.json());
app.use("/api/auth", userRoute);
app.use("/api", issueRoute);
app.use("/api/auth", authRouter);
app.get("/user", (req, res) => {
    res.send("Hello World!");
});
export default app;
//# sourceMappingURL=app.js.map