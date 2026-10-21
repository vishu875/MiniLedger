import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import multer from "multer";
import { ZodError } from "zod";
import { pool } from "./db";
import authRoutes from "./routes/auth";
import loanRoutes from "./routes/loans";
import summaryRoutes from "./routes/summary";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", async (_req, res, next) => {
  try {
    const r = await pool.query("SELECT NOW()");
    res.json({ status: "ok", time: r.rows[0].now });
  } catch (e) {
    next(e);
  }
});

app.use("/auth", authRoutes);
app.use("/loans", loanRoutes);
app.use("/summary", summaryRoutes);

// Saare errors yahan aate hain
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    const message = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
    return res.status(400).json({ error: message });
  }
  if (err instanceof multer.MulterError || err?.message === "Only image files are allowed") {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = Number(process.env.PORT) || 3000;
// "0.0.0.0" taaki phone same WiFi se server tak pahunch sake
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${port}`);
});
