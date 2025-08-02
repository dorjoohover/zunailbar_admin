export interface ISalaryLog {
  id: string;
  user_id: string;
  approved_by: string;
  date: Date;
  amount: number;
  salary_status: number;
  order_count: number;
  created_at?: Date;
  approved_at?: Date;
}
