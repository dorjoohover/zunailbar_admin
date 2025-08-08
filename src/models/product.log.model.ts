export interface ProductLog {
  id: string;
  product_id: string;
  merchant_id: string;
  quantity: number;
  price: number;
  total_amount: number;
  product_log_status: number;
  date: Date;
  created_by: string;
  created_at?: Date;
}
export interface IProductLog {
  id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  price: number;
  total_amount: number;
  product_log_status: number;

  date: Date;
  created_by?: string;
  created_at?: Date;
}
