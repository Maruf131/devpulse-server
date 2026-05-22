import type { Request, Response } from "express";
import { IssueService } from "./issues.service";

const createIssue = async (req: any, res: Response) => {
  try {
    // req.user.id comes from JWT
    const payload = { ...req.body, reporter_id: req.user.id };

    const result = await IssueService.createIssueIntoDB(payload);

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get all issues
const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await IssueService.getAllIssuesFromDB(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const issueController = {
  createIssue,
  getAllIssues,
};
