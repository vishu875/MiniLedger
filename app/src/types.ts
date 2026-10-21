export interface Loan {
  id: number;
  friend_name: string;
  amount: number;
  due_date: string; // YYYY-MM-DD
  is_repaid: boolean;
  is_overdue: boolean;
  receipt_url: string | null;
}

export interface Summary {
  total_lent: number;
  total_repaid: number;
  overdue_amount: number;
}
