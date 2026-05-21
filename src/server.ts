import express, { type Request, type Response } from "express";
const app = express();
const port = 5000;
import { Pool } from "pg";

// middleware
app.use(express.json());

//database connect
const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_DodIqTYi6c5U@ep-round-lab-apiapgx1-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(20) NOT NULL,
      email VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(50) NOT NULL,
      role VARCHAR(20) DEFAULT 'contributor',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )  
        `);
    console.log("Database connected successfully !");
  } catch (error) {
    console.log(error);
  }
};
initDB();
app.get("/user", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.post("/api/auth/signup", async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  try {
    const result = await pool.query(
      `
    INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, COALESCE($4,'contributor')) RETURNING *
    `,
      [name, email, password, role],
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
