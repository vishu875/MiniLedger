import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

// Pool = database connections ka group, har request pe naya connection nahi banta
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
