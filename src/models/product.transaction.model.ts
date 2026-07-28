export interface ProductTransaction {
  id: string;
  product_id: string;
  user_id: string | null;
  branch_id: string;
  quantity: number;
  unit_price?: number;
  price: number;
  total_amount: number;
  date?: string | Date | null;
  product_transaction_status?: number;
  category_name?: string;
  created_by: string;
  created_at?: Date;
}
export interface IProductTransaction {
  id: string;
  product_id: string;
  product_name: string;
  user_id: string | null;
  user_name: string;
  branch_id: string;
  branch_name: string;
  category_name?: string;
  quantity: number;
  unit_price?: number;
  price: number;
  total_amount: number;
  date?: string | Date | null;
  product_transaction_status?: number;
  created_by: string;
  created_at?: Date;
}
