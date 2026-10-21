import { API_URL } from "./config";
import { Loan, Summary } from "./types";

let token: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const setToken = (t: string | null) => {
  token = t;
};
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

// Sab API calls yahin se jaati hain: token lagana + error handle karna
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...((options.headers as Record<string, string>) || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error(`Server tak nahi pahunch paya: ${API_URL}`);
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token && onUnauthorized) onUnauthorized();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data as T;
}

const json = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const api = {
  requestOtp: (phone: string) => request<{ message: string }>("/auth/request-otp", json({ phone })),
  verifyOtp: (phone: string, otp: string) =>
    request<{ token: string }>("/auth/verify-otp", json({ phone, otp })),
  getLoans: () => request<Loan[]>("/loans"),
  getSummary: () => request<Summary>("/summary"),
  addLoan: (form: FormData) => request<Loan>("/loans", { method: "POST", body: form }),
  repay: (id: number) => request<Loan>(`/loans/${id}/repay`, { method: "PATCH" }),
};

