import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { pool } from "../db";
import { asyncHandler } from "../asyncHandler";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { createLoanSchema, idParamSchema } from "../validation";

const router = Router();
router.use(requireAuth); // is file ke saare routes ke liye login zaroori

// Receipt photo upload setup
const uploadDir = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// Har query mein yehi columns wapas bhejte hain.
// amount ko float banate hain (pg NUMERIC ko string deta hai), date ko plain text.
const LOAN_COLUMNS = `
  id, friend_name,
  amount::float8 AS amount,
  to_char(due_date, 'YYYY-MM-DD') AS due_date,
  is_repaid, repaid_at, receipt_url, created_at,
  (NOT is_repaid AND due_date < CURRENT_DATE) AS is_overdue
`;

// Naya loan add karo (receipt optional)
router.post(
  "/",
  upload.single("receipt"),
  asyncHandler(async (req: AuthRequest, res) => {
    const { friend_name, amount, due_date } = createLoanSchema.parse(req.body);
    const receiptUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO loans (user_id, friend_name, amount, due_date, receipt_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING ${LOAN_COLUMNS}`,
      [req.userId, friend_name, amount, due_date, receiptUrl]
    );
    res.status(201).json(result.rows[0]);
  })
);

// Mere saare loans (pending pehle, phir due date ke hisaab se)
router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const result = await pool.query(
      `SELECT ${LOAN_COLUMNS} FROM loans WHERE user_id = $1
       ORDER BY is_repaid ASC, due_date ASC, id DESC`,
      [req.userId]
    );
    res.json(result.rows);
  })
);

// Repaid mark karo
router.patch(
  "/:id/repay",
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = idParamSchema.parse(req.params);
    const result = await pool.query(
      `UPDATE loans SET is_repaid = TRUE, repaid_at = NOW()
       WHERE id = $1 AND user_id = $2 AND is_repaid = FALSE
       RETURNING ${LOAN_COLUMNS}`,
      [id, req.userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Loan not found or already repaid" });
    }
    res.json(result.rows[0]);
  })
);

export default router;
