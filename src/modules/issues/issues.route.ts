import { Router } from "express";

import { verifyToken } from "../middleware/auth";
import { issueController } from "./issues.controller";

const router = Router();

// create issue
router.post("/issues", verifyToken, issueController.createIssue);
router.get("/issues", issueController.getAllIssues);
router.get("/issues/:id", issueController.getSingleIssue);
router.patch("/issues/:id", verifyToken, issueController.updateIssue
);

export const issueRoute = router;
