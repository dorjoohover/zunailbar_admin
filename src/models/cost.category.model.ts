export interface ICostCategory {
  id?: string;
  name: string;
  parent_id?: string | null;
  parent_name?: string | null;
  created_at?: Date;
}
export interface CostCategory {
  id: string;
  name: string;
  parent_id?: string | null;
  parent_name?: string | null;
  created_at?: Date;
}
