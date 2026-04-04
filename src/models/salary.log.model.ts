export interface ISalaryLog {
  id: string;
  artist_id: string;
  approved_by: string;
  date: Date;
  amount: number;
  salary_status: number;
  order_count: number;
  created_at?: Date;
  approved_at?: Date;
}

export interface SalaryLog {
  id: string;
  artist_id: string;
  approved_by: string;
  date: Date;
  amount: number;
  salary_status: number;
  status: number;
  order_count: number;
  created_at?: Date;
  approved_at?: Date;
}

export interface SalaryReconciliationItem {
  artist_id: string;
  income_amount: number;
  transferred_amount: number;
  balance_amount: number;
  order_count: number;
  user_name?: string;
}

export interface SalaryReconciliationSummary {
  income_amount: number;
  transferred_amount: number;
  balance_amount: number;
  order_count: number;
}

export interface SalaryReconciliationResponse {
  from: string;
  to: string;
  count: number;
  items: SalaryReconciliationItem[];
  summary: SalaryReconciliationSummary;
}
