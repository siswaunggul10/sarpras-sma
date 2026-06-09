export interface SchoolInfo {
  id?: number;
  npsn: string;
  name: string;
  status: string;
  address: string;
  academic_year: string;
}

export interface Building {
  id?: number;
  name: string;
  type: string;
  area: number;
  floors: number;
  year_built: number;
  ownership: string;
  condition: string;
  has_imb: number | boolean;
  is_usable: number | boolean;
}

export interface Room {
  id?: number;
  building_id: number;
  building_name?: string;
  name: string;
  type: string;
  area: number;
  capacity: number;
  condition: string;
  has_electricity: number | boolean;
  has_internet: number | boolean;
  is_usable: number | boolean;
  description: string;
}

export interface Facility {
  id?: number;
  room_id: number;
  room_name?: string;
  building_name?: string;
  type: string;
  quantity: number;
  unit: string;
  condition: string;
  status: string;
  year_acquired: number;
  funding_source: string;
}

export interface Stats {
  buildings: number;
  rooms: number;
  facilities: number;
  damaged: number;
}

export interface Maintenance {
  id?: number;
  object_type: "Bangunan" | "Ruang" | "Sarana";
  object_id: number;
  object_name?: string;
  date: string;
  condition_before: string;
  condition_after: string;
  action: string;
  cost: number;
  officer: string;
}

export interface Photo {
  id?: number;
  object_type: "Bangunan" | "Ruang" | "Sarana";
  object_id: number;
  file_path: string;
  caption: string;
  created_at?: string;
}
