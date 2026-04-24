import { PAYMENT_STATUS, PaymentMethod } from "@/lib/enum";

export interface Payment {
  id?: string;
  merchant_id: string;
  order_id: string;
  order_detail_id?: string;
  invoice_id?: string;
  payment_id?: string;
  qr_text?: string;
  qr_image?: string;

  amount: number;
  method: PaymentMethod;
  status: PAYMENT_STATUS;
  is_pre_amount: boolean; // урьдчилгаа эсэх
  paid_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
}
export interface IPayment {
  merchant_id?: string;
  order_id?: string;
  order_detail_id?: string;
  invoice_id?: string;
  payment_id?: string;
  qr_text?: string;
  qr_image?: string;

  amount?: number;
  method?: PaymentMethod;
  status?: PAYMENT_STATUS;
  is_pre_amount?: boolean; // урьдчилгаа эсэх
  paid_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
}

export interface PaymentDailySummary {
  from: string;
  to: string;
  pre_amount: number;
  cash_amount: number;
  bank_amount: number;
  card_amount: number;
  total_amount: number;
}

export interface PaymentDailyBreakdownItem {
  id: string;
  order_id?: string;
  amount: number;
  method?: PaymentMethod;
  is_pre_amount?: boolean;
  paid_at?: Date | string;
  order_date?: Date | string;
  transaction_type?: string;
  branch_id?: string;
  branch_name?: string;
  artist_names?: string;
  service_names?: string;
  pre_amount?: number;
  discount_amount?: number;
  paid_amount?: number;
  order_total_amount?: number;
  voucher_name?: string;
}
