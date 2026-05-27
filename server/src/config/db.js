import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === "production";

export const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : undefined,

  user: isProduction ? undefined : process.env.PG_USER,
  password: isProduction ? undefined : process.env.PG_PASSWORD,
  host: isProduction ? undefined : process.env.PG_HOST,
  port: isProduction ? undefined : process.env.PG_PORT,
  database: isProduction ? undefined : process.env.PG_DB,

  ssl: isProduction ? { rejectUnauthorized: false } : false
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.log("Failed to connect to database", err);
  } else {
    console.log("Connected to database successfully", res.rows[0].now);
  }
});
