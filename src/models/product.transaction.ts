export interface ProductTransaction {
  id: string;
  product_id: string;
  user_id: string;
  branch_id: string;
  quantity: number;
  price: number;
  total_amount: number;
  transaction_status: number;
  created_by: string;
  created_at?: Date;
}
