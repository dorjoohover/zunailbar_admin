export interface ISchedule {
  id: string;
  user_id: string;
  branch_id: string;
  date: Date;
  start_time: Date;
  end_time: Date;
  schedule_status: number;
  created_at?: Date;
  updated_at?: Date;
}
