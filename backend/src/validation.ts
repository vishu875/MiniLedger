import { z } from "zod";

// Sirf digits, 10 se 15 lambai
export const phoneSchema = z
  .string()
  .regex(/^\d{10,15}$/, "Phone must be 10-15 digits");

export const requestOtpSchema = z.object({ phone: phoneSchema });

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const createLoanSchema = z.object({
  friend_name: z.string().trim().min(1, "Friend name is required").max(100),
  // multipart form mein amount string aata hai, isliye coerce
  amount: z.coerce.number().positive("Amount must be greater than 0").max(1_000_000_000),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be YYYY-MM-DD")
    .refine((d) => !Number.isNaN(Date.parse(d)), "Invalid due date"),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
