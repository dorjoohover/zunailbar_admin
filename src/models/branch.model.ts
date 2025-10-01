export interface IBranch {
  id?: string;
  user_id?: string;
  name?: string;
  address?: string;
  order_days: number;
  created_at?: Date;
}
export interface Branch {
  id: string;
  user_id: string;
  name: string;
  order_days: number;
  address: string;
  created_at?: Date;
}
