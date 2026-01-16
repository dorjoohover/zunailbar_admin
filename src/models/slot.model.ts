export interface OrderSlot {
  [service: string]: string[];
}
export interface Slot {
  branch_id: string;
  artist_id: string;
  date: Date;
  start_time: Date;
  end_time: Date;
  key: string;
}
