export interface Slot {
  id: string;
  date: Date;
  artist_id: string
  slots:string[]
  branch_id: string
  created_at?: Date;
}
export interface ISlot {
  id?: string;
  date?: Date;
  artist_id?: string
  slots?:string[]
  branch_id?: string
  created_at?: Date;
}