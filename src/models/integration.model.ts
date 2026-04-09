export interface IIntegration {
  id: string;
  artist_id: string;
  approved_by: string;
  date: Date | string;
  amount: number;
  salary_status: number;
  order_count: number;
  created_at?: Date;
  approved_at?: Date;
}

export interface Integration {
  id: string;
  artist_id: string;
  approved_by: string;
  date: Date | string;
  amount: number;
  salary_status: number;
  status: number;
  order_count: number;
  created_at?: Date;
  approved_at?: Date;
  user_name?: string;
  approved_name?: string;
}

export interface SalaryReconciliationItem {
  artist_id: string;
  income_amount: number;
  salary_amount: number;
  transferred_amount: number;
  balance_amount: number;
  order_count: number;
  percent?: number;
  salary_day?: number;
  user_name?: string;
}

export interface SalaryReconciliationSummary {
  income_amount: number;
  salary_amount?: number;
  transferred_amount: number;
  balance_amount: number;
  order_count: number;
}

export interface IntegrationListSummary {
  total_amount: number;
  total_order_count: number;
  total_count: number;
}

export interface SalaryCalculationRow {
  artist_id: string;
  user_name?: string;
  from?: string;
  to?: string;
  income_amount: number;
  salary_amount: number;
  order_count: number;
  transferred_amount: number;
  balance_amount: number;
  percent?: number;
  salary_day?: number;
}
