import { pool } from "../../db";

const createIssueIntoDB = async (payload: any) => {
  const { title, description, type, reporter_id } = payload;

  const userResult = await pool.query(
    `
      SELECT *
      FROM users
      WHERE id = $1
      `,
    [reporter_id],
  );

  const user = userResult.rows[0];

  if (!user) {
    throw new Error("User not found");
  }

  const result = await pool.query(
    `
      INSERT INTO issues(title, description, type, reporter_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
    [title, description, type, reporter_id],
  );

  return result.rows[0];
};

//get all the issues
const getAllIssuesFromDB = async (query: any) => {
  const { sort, type, status } = query;

  let sql = `SELECT * FROM issues`;

  const conditions = [];
  const values: any[] = [];

  // type filter
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  // status filter
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(" AND ");
  }
  // sorting
  if (sort === "oldest") {
    sql += ` ORDER BY created_at ASC`;
  } else {
    sql += ` ORDER BY created_at DESC`;
  }

  // get issues
  const issueResult = await pool.query(sql, values);
  const issues = issueResult.rows;

  // get reporter ids
  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];

  // get users separately
  const userResult = await pool.query(
    `
      SELECT id, name, role FROM users WHERE id = ANY($1)
      `,
    [reporterIds],
  );

  const users = userResult.rows;

  const finalData = issues.map((issue) => {
    const reporter = users.find((user) => user.id === issue.reporter_id);

    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    };
  });

  return finalData;
};

//get the single issue
const getSingleIssueFromDB = async (id: any) => {
  const issueResult = await pool.query(
    `
      SELECT *
      FROM issues
      WHERE id = $1
      `,
    [id],
  );

  const issue = issueResult.rows[0];

  if (!issue) {
    throw new Error("Issue not found");
  }

  // get reporter separately
  const userResult = await pool.query(
    `
      SELECT id, name, role FROM users WHERE id = $1
      `,
    [issue.reporter_id],
  );

  const reporter = userResult.rows[0];

  // final response
  const finalData = {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };

  return finalData;
};

export const IssueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
};
