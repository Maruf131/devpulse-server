export declare const IssueService: {
    createIssueIntoDB: (payload: any) => Promise<any>;
    getAllIssuesFromDB: (query: any) => Promise<{
        id: any;
        title: any;
        description: any;
        type: any;
        status: any;
        reporter: any;
        created_at: any;
        updated_at: any;
    }[]>;
    getSingleIssueFromDB: (id: any) => Promise<{
        id: any;
        title: any;
        description: any;
        type: any;
        status: any;
        reporter: any;
        created_at: any;
        updated_at: any;
    }>;
    updateIssueIntoDB: (id: string, payload: any, user: any) => Promise<any>;
    deleteIssueFromDB: (id: string, user: any) => Promise<void>;
};
//# sourceMappingURL=issues.service.d.ts.map