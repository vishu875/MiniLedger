import {
  createLoanSchema,
  phoneSchema,
  verifyOtpSchema,
} from "../src/validation";

describe("phone validation", () => {
  it("accepts a 10 digit phone", () => {
    expect(phoneSchema.safeParse("9876543210").success).toBe(true);
  });
  it("rejects letters and short numbers", () => {
    expect(phoneSchema.safeParse("98abc").success).toBe(false);
    expect(phoneSchema.safeParse("12345").success).toBe(false);
  });
});

describe("otp validation", () => {
  it("needs exactly 6 digits", () => {
    expect(verifyOtpSchema.safeParse({ phone: "9876543210", otp: "123456" }).success).toBe(true);
    expect(verifyOtpSchema.safeParse({ phone: "9876543210", otp: "1234" }).success).toBe(false);
  });
});

describe("loan validation", () => {
  const valid = { friend_name: "Rahul", amount: "500", due_date: "2026-12-31" };

  it("accepts a valid loan and converts amount to number", () => {
    const r = createLoanSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.amount).toBe(500);
  });
  it("rejects zero or negative amount", () => {
    expect(createLoanSchema.safeParse({ ...valid, amount: "0" }).success).toBe(false);
    expect(createLoanSchema.safeParse({ ...valid, amount: "-10" }).success).toBe(false);
  });
  it("rejects empty name and bad date", () => {
    expect(createLoanSchema.safeParse({ ...valid, friend_name: "  " }).success).toBe(false);
    expect(createLoanSchema.safeParse({ ...valid, due_date: "31-12-2026" }).success).toBe(false);
  });
});
