
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
  

// src/app.ts
import express from "express";

// src/modules/users/users.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT,
  secret_key: process.env.JWT_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(20) NOT NULL,
      email VARCHAR(50) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(20) DEFAULT 'contributor',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )  
        `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues(
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'open',
        reporter_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        
      )
      `);
    console.log("Database connected successfully !");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/users/users.service.ts
import bcrypt from "bcryptjs";
var createUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
    INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, COALESCE($4,'contributor')) RETURNING *
    `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var userService = {
  createUserIntoDB
};

// src/modules/users/users.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var userController = {
  createUser
};

// src/modules/users/users.route.ts
var router = Router();
router.post("/signup", userController.createUser);
var userRoute = router;

// src/modules/issues/issues.route.ts
import { Router as Router2 } from "express";

// src/modules/middleware/auth.ts
import jwt from "jsonwebtoken";
var verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token found"
      });
    }
    const decoded = jwt.verify(token, config_default.secret_key);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

// src/modules/issues/issues.service.ts
var createIssueIntoDB = async (payload) => {
  const { title, description, type, reporter_id } = payload;
  const userResult = await pool.query(
    `
      SELECT *
      FROM users
      WHERE id = $1
      `,
    [reporter_id]
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
    [title, description, type, reporter_id]
  );
  return result.rows[0];
};
var getAllIssuesFromDB = async (query) => {
  const { sort, type, status } = query;
  let sql = `SELECT * FROM issues`;
  const conditions = [];
  const values = [];
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(" AND ");
  }
  if (sort === "oldest") {
    sql += ` ORDER BY created_at ASC`;
  } else {
    sql += ` ORDER BY created_at DESC`;
  }
  const issueResult = await pool.query(sql, values);
  const issues = issueResult.rows;
  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];
  const userResult = await pool.query(
    `
      SELECT id, name, role FROM users WHERE id = ANY($1)
      `,
    [reporterIds]
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
      updated_at: issue.updated_at
    };
  });
  return finalData;
};
var getSingleIssueFromDB = async (id) => {
  const issueResult = await pool.query(
    `
      SELECT *
      FROM issues
      WHERE id = $1
      `,
    [id]
  );
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  const userResult = await pool.query(
    `
      SELECT id, name, role FROM users WHERE id = $1
      `,
    [issue.reporter_id]
  );
  const reporter = userResult.rows[0];
  const finalData = {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
  return finalData;
};
var updateIssueIntoDB = async (id, payload, user) => {
  const issueResult = await pool.query(
    `
      SELECT *
      FROM issues
      WHERE id = $1
      `,
    [id]
  );
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  if (user.role === "contributor") {
    if (issue.reporter_id !== user.id) {
      throw new Error("You can update only your own issue");
    }
    if (issue.status !== "open") {
      throw new Error("You can update only open issues");
    }
  }
  const { title, description, type } = payload;
  const result = await pool.query(
    `
      UPDATE issues

      SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      type = COALESCE($3, type),
      updated_at = CURRENT_TIMESTAMP

      WHERE id = $4

      RETURNING *
      `,
    [title, description, type, id]
  );
  return result.rows[0];
};
var deleteIssueFromDB = async (id, user) => {
  if (user.role !== "maintainer") {
    throw new Error("Only maintainer can delete issues");
  }
  const issueResult = await pool.query(
    `
      SELECT *
      FROM issues
      WHERE id = $1
      `,
    [id]
  );
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  await pool.query(
    `
    DELETE FROM issues
    WHERE id = $1
    `,
    [id]
  );
};
var IssueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB
};

// src/modules/issues/issues.controller.ts
var createIssue = async (req, res) => {
  try {
    const payload = { ...req.body, reporter_id: req.user.id };
    const result = await IssueService.createIssueIntoDB(payload);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await IssueService.getAllIssuesFromDB(req.query);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await IssueService.getSingleIssueFromDB(id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await IssueService.updateIssueIntoDB(id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    await IssueService.deleteIssueFromDB(id, req.user);
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/modules/middleware/authorize.ts
var authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden Access"
      });
    }
    next();
  };
};

// src/modules/issues/issues.route.ts
var router2 = Router2();
router2.post(
  "/issues",
  verifyToken,
  authorize("contributor", "maintainer"),
  issueController.createIssue
);
router2.get("/issues", issueController.getAllIssues);
router2.get("/issues/:id", issueController.getSingleIssue);
router2.patch(
  "/issues/:id",
  verifyToken,
  authorize("maintainer"),
  issueController.updateIssue
);
router2.delete(
  "/issues/:id",
  verifyToken,
  authorize("maintainer"),
  issueController.deleteIssue
);
var issueRoute = router2;

// src/modules/auth/auth.route.ts
import { Router as Router3 } from "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcrypt";
import jwt2 from "jsonwebtoken";
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userResult = await pool.query(
    `
    SELECT *
    FROM users
    WHERE email = $1
    `,
    [email]
  );
  const user = userResult.rows[0];
  if (!user) {
    throw new Error("User not found");
  }
  const isPasswordMatched = await bcrypt2.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("Password does not match");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const accessToken = jwt2.sign(jwtPayload, config_default.secret_key, {
    expiresIn: "7d"
  });
  const { password: pass, ...userWithoutPassword } = user;
  return {
    accessToken,
    user: userWithoutPassword
  };
};
var authService = {
  loginUserIntoDB
};

// src/modules/auth/auth.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
var authController = {
  loginUser
};

// src/modules/auth/auth.route.ts
var router3 = Router3();
router3.post("/login", authController.loginUser);
var authRouter = router3;

// src/app.ts
var app = express();
app.use(express.json());
app.use("/api/auth", userRoute);
app.use("/api", issueRoute);
app.use("/api/auth", authRouter);
app.get("/", (req, res) => {
  res.send("Hello World!");
});
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map