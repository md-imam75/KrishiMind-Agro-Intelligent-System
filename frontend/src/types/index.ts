export interface Farmer {
  id: string;
  phone: string;
  name?: string;
}

export interface FarmProfile {
  id: string;
  farmer_id: string;
  district?: string;
  upazila?: string;
  total_land_decimal?: number;
  is_complete: boolean;
}

export interface Plot {
  id: string;
  farm_profile_id: string;
  label: string;
  land_decimal?: number;
  soil_type?: SoilType;
  water_availability?: WaterAvailability;
  elevation?: LandElevation;
  is_active: boolean;
  active_crop?: ActiveCrop;
}

export interface ActiveCrop {
  id: string;
  plot_id: string;
  crop_name: string;
  planting_date?: string;
  expected_harvest_date?: string;
  growth_stage: GrowthStage;
}

export interface CropHistory {
  id: string;
  plot_id: string;
  crop_name: string;
  planting_date?: string;
  harvest_date?: string;
  yield_outcome?: 'good' | 'average' | 'poor';
  notes?: string;
  is_approximate: boolean;
  created_at: string;
}

export type SoilType = 'clay' | 'loam' | 'sandy_loam' | 'silty' | 'other';
export type WaterAvailability = 'irrigated_canal' | 'irrigated_shallow_tube' | 'irrigated_deep_tube' | 'rain_fed' | 'mixed';
export type LandElevation = 'low_lying' | 'medium' | 'highland';
export type GrowthStage = 'seedling' | 'vegetative' | 'flowering' | 'grain_filling' | 'maturity' | 'unknown';
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  role: string;
  is_new_user?: boolean;
}
