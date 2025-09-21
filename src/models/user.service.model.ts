export interface IUserService {
  id?: string;
  service_id?: string;
  user_id?: string;
  service_name?: string;
  user_name?: string;
  services?: string[] | { service_id: string; service_name: string }[];
  updated_at?: Date;
  created_at?: Date;
}
export interface UserService {
  id: string;
  service_id: string;
  user_id: string;
  service_name?: string;
  user_name?: string;
  updated_at?: Date;
  created_at?: Date;
  services?: { service_id: string; service_name: string }[];
}

// ajiltnii service
