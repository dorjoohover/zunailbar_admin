export interface ICategory {
  id?: string;
  name: string;
  parent_id?: string | null;
  parent_name?: string | null;
  created_at?: Date;
}
export interface Category {
  id: string;
  name: string;
  parent_id?: string | null;
  parent_name?: string | null;
  created_at?: Date;
}
