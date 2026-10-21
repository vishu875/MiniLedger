import { Router } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { pool } from "../db";
import { asyncHandler } from "../asyncHandler";
import { requestOtpSchema, verifyOtpSchema } from "../validation";

const router = Router();

// 1) Phone do -> OTP banao, DB mein save karo, server log mein print karo (mock SMS)
router.post(
  "/request-otp",
  asyncHandler(async (req, res) => {
    const { phone } = requestOtpSchema.parse(req.body);
    const code = crypto.randomInt(100000, 1000000).toString(); // 6 digit

    await pool.query("DELETE FROM otps WHERE phone = $1", [phone]);
    await pool.query(
      "INSERT INTO otps (phone, code, expires_at) VALUES ($1, $2, NOW() + INTERVAL '5 minutes')",
      [phone, code]
    );

    console.log(`\n>>> OTP for ${phone}: ${code} (valid 5 minutes)\n`);
    res.json({ message: "OTP sent (check server log)" });
  })
);

// 2) Phone + OTP do -> sahi ho to JWT token milega
router.post(
  "/verify-otp",
  asyncHandler(async (req, res) => {
    const { phone, otp } = verifyOtpSchema.parse(req.body);

    const found = await pool.query(
      "SELECT id FROM otps WHERE phone = $1 AND code = $2 AND expires_at > NOW() ORDER BY id DESC LIMIT 1",
      [phone, otp]
    );
    if (found.rowCount === 0) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    await pool.query("DELETE FROM otps WHERE phone = $1", [phone]); // OTP sirf ek baar

    // User nahi hai to bana do, hai to uski id le lo
    const user = await pool.query(
      "INSERT INTO users (phone) VALUES ($1) ON CONFLICT (phone) DO UPDATE SET phone = EXCLUDED.phone RETURNING id",
      [phone]
    );
    const userId: number = user.rows[0].id;

    const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
    res.json({ token, user: { id: userId, phone } });
  })
);

export default router;
