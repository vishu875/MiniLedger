// "npm run db:init": database (agar nahi hai) aur tables dono bana deta hai
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Client } from "pg";
import { pool } from "./db";

dotenv.config();

async function ensureDatabase() {
  const url = new URL(process.env.DATABASE_URL as string);
  const dbName = url.pathname.slice(1);

  // Pehle default "postgres" database se connect karte hain
  url.pathname = "/postgres";
  const admin = new Client({ connectionString: url.toString() });
  await admin.connect();

  const exists = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
  if (exists.rowCount === 0) {
    await admin.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Database "${dbName}" created`);
  }
  await admin.end();
}

async function main() {
  await ensureDatabase();
  const sql = fs.readFileSync(path.join(__dirname, "..", "schema.sql"), "utf8");
  await pool.query(sql);
  console.log("Tables ready: users, otps, loans");
  await pool.end();
}

main().catch((err) => {
  console.error("DB init failed:", err.message);
  process.exit(1);
});