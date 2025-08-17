export interface Home {
  id: string;
  artist_name: string;
  image: string;
  name: string;
  status: number;
  index: number;
  created_at?: Date;
}
export interface IHome {
  id?: string;
  artist_name?: string;
  image?: string;
  name?: string;
  status?: number;
  index: number;
  created_at?: Date;
}
export interface IHomes {
  items: IHome[];
}
export interface IFeatures {
  items: IFeature[];
}
export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: number;
  status: number;
  created_at?: Date;
}
export interface IFeature {
  id?: string;
  title: string;
  description: string;
  icon: number;
  status?: number;
  created_at?: Date;
}
