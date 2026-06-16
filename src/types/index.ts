export interface Motorcycle {
  id: string;
  name: string;
  brand: string;
  model_year: number;
  engine_size_cc: number;
  short_description: string | null;
  price_daily: number;
  price_weekly: number;
  price_monthly: number;
  busy_until: string | null;
  created_at: string;
}

export interface MotorcycleImage {
  id: string;
  motorcycle_id: string;
  image_url: string;
  is_cover: boolean;
  display_order: number;
}

export interface MotorcycleWithCover extends Motorcycle {
  cover_image?: string;
  images?: string[];
}
