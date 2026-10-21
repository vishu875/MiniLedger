import { Router } from "express";
import { pool } from "../db";
import { asyncHandler } from "../asyncHandler";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// total_lent    = saare loans ka total
// total_repaid  = jo wapas aa chuke
// overdue       = jo wapas nahi aaye aur due date nikal chuki
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const result = await pool.query(
      `SELECT
         COALESCE(SUM(amount), 0)::float8 AS total_lent,
         COALESCE(SUM(amount) FILTER (WHERE is_repaid), 0)::float8 AS total_repaid,
         COALESCE(SUM(amount) FILTER (WHERE NOT is_repaid AND due_date < CURRENT_DATE), 0)::float8 AS overdue_amount
       FROM loans WHERE user_id = $1`,
      [req.userId]
    );
    res.json(result.rows[0]);
  })
);

export default router;
