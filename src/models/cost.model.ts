export interface ICost {
  id: string;
  cost_category_id: string;
  cost_category_name: string;
  branch_id: string;
  branch_name: string;
  date: Date;
  price: number;
  paid_amount: number;
  status: number;
  cost_status: number;
  created_at?: Date;
}
export interface Cost {
  id: string;
  cost_category_id: string;
  cost_category_name: string;
  branch_id: string;
  branch_name: string;
  date: Date;
  price: number;
  paid_amount: number;
  status: number;
  cost_status: number;
  created_at?: Date;
}
