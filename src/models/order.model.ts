import { OrderStatus } from "@/lib/enum";

export interface IOrder {
  id?: string;
  user_id?: string;
  customer_id?: string;
  duration?: number;
  order_date?: string;
  start_time?: string;
  end_time?: string;
  order_status?: OrderStatus;
  pre_amount?: number;
  is_pre_amount_paid?: boolean;
  total_amount?: number;
  branch_id?: string;
  phone?: string;
  paid_amount?: number;
  customer_desc?: string;
  user_desc?: string;
  created_at?: Date;
  updated_at?: Date;
  edit?: string;
  details?: IOrderDetail[];
}
export interface Order {
  id: string;
  branch_id?: string;
  user_id: string;
  phone: string;
  customer_id: string;
  duration: number;
  order_date: string;
  start_time: string;
  end_time: string;
  order_status: number;
  pre_amount: number;
  is_pre_amount_paid: boolean;
  total_amount: number;
  paid_amount: number;
  customer_desc: string;
  user_desc: string;
  discount: number;
  discount_type: number;
  color?: number;
  user_name?: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
  details?: OrderDetail[];
}

export interface OrderDetail {
  id: string;
  order_id: string;
  service_id: string;
  service_name: string;
  price: number;
  status: number;
  created_at?: Date;
}

export interface IOrderDetail {
  id?: string;
  order_id?: string;
  service_id?: string;
  service_name?: string;
  price?: number;
  created_at?: Date;
}
