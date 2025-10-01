export interface ISchedule {
  id?: string;
  user_id: string;
  approved_by?: string;
  branch_id?: string;
  index: number;
  start_time?: Date;
  end_time?: Date;
  times: string[];
  schedule_status?: number;
  created_at?: Date;
  updated_at?: Date;
}
export interface Schedule {
  id: string;
  user_id: string;
  approved_by: string;
  branch_id: string;
  index: number;
  start_time: Date;
  end_time: Date;
  schedule_status: number;
  times: string;
  created_at?: Date;
  updated_at?: Date;
}
export interface IBooking {
  id?: string;
  approved_by?: string;
  merchant_id?: string;
  branch_id: string;
  index: number;
  start_time?: Date;
  end_time?: Date;
  status?: number;
  booking_status?: number;
  times: string[];
  created_at?: Date;
  updated_at?: Date;
}
export interface Booking {
  id: string;
  approved_by: string;
  merchant_id: string;
  branch_id: string;
  index: number;
  start_time: Date;
  end_time: Date;
  status: number;
  booking_status: number;
  times: string;
  created_at?: Date;
  updated_at?: Date;
}
