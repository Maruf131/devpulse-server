import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { issueController } from "./issues.controller";
import { authorize } from "../middleware/authorize";
const router = Router();
// create issue
router.post("/issues", verifyToken, authorize("contributor", "maintainer"), issueController.createIssue);
router.get("/issues", issueController.getAllIssues);
router.get("/issues/:id", issueController.getSingleIssue);
router.patch("/issues/:id", verifyToken, authorize("maintainer"), issueController.updateIssue);
router.delete("/issues/:id", verifyToken, authorize("maintainer"), issueController.deleteIssue);
export const issueRoute = router;
//# sourceMappingURL=issues.route.js.map