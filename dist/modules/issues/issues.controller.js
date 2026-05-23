import { IssueService } from "./issues.service";
const createIssue = async (req, res) => {
    try {
        // req.user.id comes from JWT
        const payload = { ...req.body, reporter_id: req.user.id };
        const result = await IssueService.createIssueIntoDB(payload);
        res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// get all issues
const getAllIssues = async (req, res) => {
    try {
        const result = await IssueService.getAllIssuesFromDB(req.query);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// Get single issue
const getSingleIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await IssueService.getSingleIssueFromDB(id);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
//Updated the issues
const updateIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await IssueService.updateIssueIntoDB(id, req.body, req.user);
        res.status(200).json({
            success: true,
            message: "Issue updated successfully",
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// Delete issues
const deleteIssue = async (req, res) => {
    try {
        const { id } = req.params;
        await IssueService.deleteIssueFromDB(id, req.user);
        res.status(200).json({
            success: true,
            message: "Issue deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const issueController = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue,
};
//# sourceMappingURL=issues.controller.js.map