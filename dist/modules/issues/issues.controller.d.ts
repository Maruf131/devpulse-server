import type { Request, Response } from "express";
export declare const issueController: {
    createIssue: (req: any, res: Response) => Promise<void>;
    getAllIssues: (req: Request, res: Response) => Promise<void>;
    getSingleIssue: (req: Request, res: Response) => Promise<void>;
    updateIssue: (req: any, res: Response) => Promise<void>;
    deleteIssue: (req: any, res: Response) => Promise<void>;
};
//# sourceMappingURL=issues.controller.d.ts.map