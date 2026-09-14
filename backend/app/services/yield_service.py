from app.schemas.ai import YieldPredictionRequest, YieldPredictionResponse

# Agronomic standard yields per decimal (kg) in Bangladesh
BENCHMARK_RATES = {
    "rice": {"avg_kg_per_dec": 22.0, "price_per_kg_bdt": 32.0, "maund_weight_kg": 40.0},
    "potato": {"avg_kg_per_dec": 80.0, "price_per_kg_bdt": 25.0, "maund_weight_kg": 40.0},
    "jute": {"avg_kg_per_dec": 12.0, "price_per_kg_bdt": 75.0, "maund_weight_kg": 40.0},
    "wheat": {"avg_kg_per_dec": 15.0, "price_per_kg_bdt": 38.0, "maund_weight_kg": 40.0},
    "mustard": {"avg_kg_per_dec": 6.5, "price_per_kg_bdt": 95.0, "maund_weight_kg": 40.0},
    "maize": {"avg_kg_per_dec": 36.0, "price_per_kg_bdt": 28.0, "maund_weight_kg": 40.0},
}

def predict_yield(req: YieldPredictionRequest) -> YieldPredictionResponse:
    crop_key = "rice"
    c_lower = req.crop_name.lower()
    for k in BENCHMARK_RATES.keys():
        if k in c_lower:
            crop_key = k
            break

    benchmark = BENCHMARK_RATES[crop_key]
    base_per_dec = benchmark["avg_kg_per_dec"]

    # Soil modifier
    soil_mult = 1.0
    if req.soil_type == "loam":
        soil_mult = 1.12
    elif req.soil_type == "sandy_loam":
        soil_mult = 1.05
    elif req.soil_type == "clay":
        soil_mult = 0.95
    elif req.soil_type == "silty":
        soil_mult = 1.08

    # Water availability modifier
    water_mult = 1.0
    if req.water_availability in ["irrigated_deep_tube", "irrigated_shallow_tube"]:
        water_mult = 1.10
    elif req.water_availability == "rain_fed":
        water_mult = 0.88
    elif req.water_availability == "mixed":
        water_mult = 1.02

    # Final calculated yield
    adjusted_per_dec = base_per_dec * soil_mult * water_mult
    total_yield_kg = round(adjusted_per_dec * req.land_decimal, 1)
    total_yield_maund = round(total_yield_kg / benchmark["maund_weight_kg"], 1)

    min_kg = round(total_yield_kg * 0.88, 1)
    max_kg = round(total_yield_kg * 1.14, 1)

    # Revenue projections
    price = benchmark["price_per_kg_bdt"]
    expected_rev = round(total_yield_kg * price)
    min_rev = round(min_kg * price)
    max_rev = round(max_kg * price)

    district_avg_maund = round((base_per_dec * req.land_decimal) / 40.0, 1)

    if total_yield_maund > district_avg_maund * 1.05:
        rating = "Above Average"
    elif total_yield_maund < district_avg_maund * 0.95:
        rating = "Below Average"
    else:
        rating = "Average"

    tips_bn = [
        "সুষম সার ব্যবস্থাপনা (ডিএপি, ইউরিয়া, এমওপি এবং জিপসাম) মেনে চলুন।",
        "কুশি গজানো এবং ফুল আসার সময় জমিতে পর্যাপ্ত পানির স্তর নিশ্চিত করুন।",
        "দানায় দুধ আসার মুহূর্তে কোনোক্রমেই জমিতে পানির অভাব হতে দেবেন না।"
    ]

    tips_en = [
        "Follow balanced basal and split fertilizer regime (DAP, Urea, MOP & Gypsum).",
        "Maintain adequate shallow water layer during maximum tillering and panicle initiation.",
        "Prevent drought stress strictly during the flowering and grain milky stage."
    ]

    return YieldPredictionResponse(
        crop_name=req.crop_name,
        variety=req.variety or "Standard Improved",
        land_decimal=req.land_decimal,
        estimated_yield_kg=total_yield_kg,
        estimated_yield_maund=total_yield_maund,
        confidence_interval_kg={"min": min_kg, "max": max_kg},
        estimated_revenue_bdt={"min": min_rev, "expected": expected_rev, "max": max_rev},
        benchmark_district_avg_maund=district_avg_maund,
        productivity_rating=rating,
        agronomic_tips_bn=tips_bn,
        agronomic_tips_en=tips_en,
    )
