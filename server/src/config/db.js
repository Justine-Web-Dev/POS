import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim());

export const pool = new Pool({
  // Prefer DATABASE_URL if provided (works for local + production).
  // Falls back to discrete PG_* env vars for local Postgres.
  connectionString: hasDatabaseUrl ? process.env.DATABASE_URL : undefined,

  user: hasDatabaseUrl ? undefined : process.env.PG_USER,
  password: hasDatabaseUrl ? undefined : process.env.PG_PASSWORD,
  host: hasDatabaseUrl ? undefined : process.env.PG_HOST,
  port: hasDatabaseUrl ? undefined : process.env.PG_PORT,
  database: hasDatabaseUrl ? undefined : process.env.PG_DB,

  // Managed Postgres providers typically require SSL.
  ssl: hasDatabaseUrl ? { rejectUnauthorized: false } : false
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.log("Failed to connect to database", err);
  } else {
    console.log("Connected to database successfully", res.rows[0].now);
  }
});
