from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

# --- Crop Recommendation Schemas ---
class CropRecommendationRequest(BaseModel):
    district: str
    soil_type: str = Field(..., description="clay, loam, sandy_loam, silty, other")
    season: str = Field(..., description="rabi, kharif_1, kharif_2")
    water_availability: str = Field(..., description="irrigated_canal, irrigated_shallow_tube, irrigated_deep_tube, rain_fed, mixed")
    elevation: str = Field(..., description="low_lying, medium, highland")
    land_decimal: Optional[float] = 30.0

class RecommendedCrop(BaseModel):
    crop_name_en: str
    crop_name_bn: str
    variety_en: str
    variety_bn: str
    suitability_score: int = Field(..., description="Score 0-100")
    expected_yield_per_decimal_kg: float
    duration_days: int
    water_requirement: str
    profit_potential: str
    reasons_bn: List[str]
    reasons_en: List[str]

class CropRecommendationResponse(BaseModel):
    district: str
    season: str
    soil_type: str
    recommendations: List[RecommendedCrop]
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    source: str = "KrishiMind AI Engine"

# --- Disease Scanner Schemas ---
class TreatmentPlan(BaseModel):
    chemical_bn: List[str]
    chemical_en: List[str]
    organic_bn: List[str]
    organic_en: List[str]
    prevention_bn: List[str]
    prevention_en: List[str]

class DiseaseScanResponse(BaseModel):
    id: str
    crop_name: str
    disease_name_en: str
    disease_name_bn: str
    confidence: float
    severity: str = Field(..., description="low, moderate, high, critical")
    symptoms_bn: str
    symptoms_en: str
    treatment: TreatmentPlan
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DiseaseHistoryItem(BaseModel):
    id: str
    crop_name: str
    disease_name_bn: str
    disease_name_en: str
    severity: str
    confidence: float
    created_at: datetime
    image_url: Optional[str] = None

# --- Yield Prediction Schemas ---
class YieldPredictionRequest(BaseModel):
    crop_name: str
    variety: Optional[str] = "Standard"
    land_decimal: float
    soil_type: str
    water_availability: str
    district: str
    planting_date: Optional[date] = None

class YieldPredictionResponse(BaseModel):
    crop_name: str
    variety: str
    land_decimal: float
    estimated_yield_kg: float
    estimated_yield_maund: float
    confidence_interval_kg: dict # {"min": float, "max": float}
    estimated_revenue_bdt: dict # {"min": float, "expected": float, "max": float}
    benchmark_district_avg_maund: float
    productivity_rating: str # "Above Average", "Average", "Below Average"
    agronomic_tips_bn: List[str]
    agronomic_tips_en: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- Weather & Advisory Schemas ---
class DailyForecast(BaseModel):
    date: str
    temp_max: float
    temp_min: float
    precipitation_sum_mm: float
    precipitation_probability: int
    weather_code: int
    weather_desc_bn: str
    weather_desc_en: str
    wind_speed_kmh: float

class CurrentWeather(BaseModel):
    temperature: float
    relative_humidity: int
    wind_speed_kmh: float
    precipitation_mm: float
    weather_desc_bn: str
    weather_desc_en: str
    is_day: bool

class AgriculturalAdvisory(BaseModel):
    spraying_suitability: str # "SAFE", "CAUTION", "UNSAFE"
    spraying_reason_bn: str
    spraying_reason_en: str
    irrigation_advice_bn: str
    irrigation_advice_en: str
    disease_risk_alert_bn: Optional[str] = None
    disease_risk_alert_en: Optional[str] = None
    general_tips_bn: List[str]
    general_tips_en: List[str]

class WeatherResponse(BaseModel):
    district: str
    latitude: float
    longitude: float
    current: CurrentWeather
    daily: List[DailyForecast]
    advisory: AgriculturalAdvisory
    updated_at: datetime = Field(default_factory=datetime.utcnow)
