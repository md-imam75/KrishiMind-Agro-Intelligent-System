from typing import List
from app.schemas.ai import CropRecommendationRequest, CropRecommendationResponse, RecommendedCrop

# Comprehensive Bangladesh Agro-ecological Database (BRRI / BARI Standards)
CROP_DATABASE = [
    {
        "name_en": "Boro Rice",
        "name_bn": "বোরো ধান",
        "variety_en": "BRRI dhan 28 / 29 / 89",
        "variety_bn": "ব্রি ধান ২৮ / ২৯ / ৮৯",
        "seasons": ["rabi"],
        "soils": ["clay", "loam", "silty"],
        "elevations": ["medium", "low_lying"],
        "water": ["irrigated_shallow_tube", "irrigated_deep_tube", "irrigated_canal"],
        "yield_per_decimal_kg": 24.5,
        "duration_days": 145,
        "water_req": "উচ্চ (High)",
        "profit": "মাঝারি থেকে উচ্চ (Medium to High)",
        "reasons_bn": ["শীতকালীন মৌসুমে নিশ্চিত ফলন", "উন্নত জাতের রোগ প্রতিরোধ ক্ষমতা বেশি", "স্থানীয় বাজারে ব্যাপক চাহিদা ও নগদ মূল্য"],
        "reasons_en": ["Reliable yield in winter season", "High disease tolerance in modern varieties", "Strong local market liquidity"]
    },
    {
        "name_en": "Aman Rice",
        "name_bn": "আমন ধান",
        "variety_en": "BRRI dhan 49 / 87",
        "variety_bn": "ব্রি ধান ৪৯ / ৮৭",
        "seasons": ["kharif_2"],
        "soils": ["clay", "loam", "silty"],
        "elevations": ["medium", "highland"],
        "water": ["rain_fed", "mixed", "irrigated_canal"],
        "yield_per_decimal_kg": 19.0,
        "duration_days": 130,
        "water_req": "মাঝারি (Medium)",
        "profit": "উচ্চ (High)",
        "reasons_bn": ["বর্ষা মৌসুমের জন্য আদর্শ জাত", "উৎপাদন খরচ কম ও সুস্বাদু চাল", "মাঝারি জমিতে পানি ধরে রাখার ক্ষমতা চমৎকার"],
        "reasons_en": ["Optimal for monsoon rainy season", "Lower irrigation costs with premium grain", "Excellent moisture retention in medium lands"]
    },
    {
        "name_en": "Potato",
        "name_bn": "গোল আলু",
        "variety_en": "Diamond / Cardinal / Asterix",
        "variety_bn": "ডায়মন্ড / কার্ডিনাল / এস্টেরিক্স",
        "seasons": ["rabi"],
        "soils": ["loam", "sandy_loam"],
        "elevations": ["highland", "medium"],
        "water": ["irrigated_shallow_tube", "mixed"],
        "yield_per_decimal_kg": 85.0,
        "duration_days": 90,
        "water_req": "নিয়মিত পরিমিত সেচ (Moderate)",
        "profit": "খুব উচ্চ (Very High)",
        "reasons_bn": ["বেলে-দোঁআশ মাটিতে দ্রুত মূল গঠন", "স্বল্পমেয়াদী ৯০ দিনের লাভজনক ফসল", "মুন্সীগঞ্জ, বগুড়া ও রংপুর অঞ্চলে ব্যাপক উৎপাদনযোগ্য"],
        "reasons_en": ["Rapid tuberization in sandy-loam soils", "High-margin 90-day cash crop", "Ideal for northern and central riverbed zones"]
    },
    {
        "name_en": "Tosha Jute",
        "name_bn": "তোষা পাট",
        "variety_en": "Rabi-1 (O-9897) / JRO-524",
        "variety_bn": "রবি-১ (ও-৯৮৯৭) / জেআরও-৫২৪",
        "seasons": ["kharif_1"],
        "soils": ["sandy_loam", "loam", "silty"],
        "elevations": ["highland", "medium"],
        "water": ["rain_fed", "mixed"],
        "yield_per_decimal_kg": 12.5,
        "duration_days": 115,
        "water_req": "বৃষ্টি নির্ভর (Rain-fed)",
        "profit": "মাঝারি (Medium)",
        "reasons_bn": ["প্রাক-বর্ষা মৌসুমে দ্রুত বর্ধনশীল", "স্বর্ণালী আঁশের আন্তর্জাতিক রপ্তানি চাহিদা", "মাটির স্বাস্থ্য ও জৈব পদার্থ বৃদ্ধি করে"],
        "reasons_en": ["Fast vegetative growth in pre-monsoon", "Strong export demand for golden fiber", "Enriches organic matter and nitrogen in soil"]
    },
    {
        "name_en": "Wheat",
        "name_bn": "গম",
        "variety_en": "BARI Gom 30 / 33 (Blast Resistant)",
        "variety_bn": "বারি গম ৩০ / ৩৩ (ব্লাস্ট প্রতিরোধী)",
        "seasons": ["rabi"],
        "soils": ["loam", "clay", "silty"],
        "elevations": ["highland", "medium"],
        "water": ["irrigated_shallow_tube", "mixed"],
        "yield_per_decimal_kg": 16.0,
        "duration_days": 105,
        "water_req": "কম সেচ (Low to Medium)",
        "profit": "মাঝারি (Medium)",
        "reasons_bn": ["বোরো ধানের চেয়ে সেচ খরচ অনেক কম", "বারি ৩৩ জাতটি গম ব্লাস্ট প্রতিরোধী", "শীতপ্রধান উত্তরাঞ্চলের উপযোগী"],
        "reasons_en": ["Requires 60% less irrigation than boro rice", "BARI 33 provides high blast disease resistance", "Thrives in cooler northern belt"]
    },
    {
        "name_en": "Mustard",
        "name_bn": "সরিষা",
        "variety_en": "BARI Sarisha 14 / 17 / 18",
        "variety_bn": "বারি সরিষা ১৪ / ১৭ / ১৮",
        "seasons": ["rabi"],
        "soils": ["loam", "sandy_loam", "clay"],
        "elevations": ["highland", "medium"],
        "water": ["rain_fed", "mixed"],
        "yield_per_decimal_kg": 6.5,
        "duration_days": 75,
        "water_req": "খুব কম (Low)",
        "profit": "উচ্চ (High)",
        "reasons_bn": ["মাত্র ৭৫ দিনে ঘরে তোলা যায়", "আমন ধান ও বোরো ধানের মধ্যবর্তী শূন্য সময়ে অতিরিক্ত আয়", "স্থানীয় ঘানি ও মিলে তেলের ভালো দাম"],
        "reasons_en": ["Short duration (75 days) fits between Aman and Boro", "Low capital requirement with high edible oil market rate", "Low water footprint"]
    },
    {
        "name_en": "Maize / Corn",
        "name_bn": "ভুট্টা",
        "variety_en": "Pacific 984 / NK-40",
        "variety_bn": "প্যাসিফিক ৯৮৪ / এনকে-৪০",
        "seasons": ["rabi", "kharif_1"],
        "soils": ["loam", "sandy_loam", "silty"],
        "elevations": ["highland", "medium"],
        "water": ["irrigated_shallow_tube", "irrigated_deep_tube"],
        "yield_per_decimal_kg": 38.0,
        "duration_days": 135,
        "water_req": "মাঝারি (Medium)",
        "profit": "খুব উচ্চ (Very High)",
        "reasons_bn": ["পোল্ট্রি ও ফিড মিলের ব্যাপক চাহিদা", "উচ্চ ফলনশীল হাইব্রিড প্রযুক্তি", "চরের জমিতেও চমৎকার উৎপাদন"],
        "reasons_en": ["High demand from poultry and livestock feed industries", "High productivity per decimal", "Adapts well to alluvial riverbed lands"]
    },
    {
        "name_en": "Lentil / Pulses",
        "name_bn": "মসুর ডাল",
        "variety_en": "BARI Masur 8",
        "variety_bn": "বারি মসুর ৮",
        "seasons": ["rabi"],
        "soils": ["loam", "silty"],
        "elevations": ["highland", "medium"],
        "water": ["rain_fed", "mixed"],
        "yield_per_decimal_kg": 7.0,
        "duration_days": 100,
        "water_req": "খুব কম (Low)",
        "profit": "উচ্চ (High)",
        "reasons_bn": ["মাটির নাইট্রোজেন সমৃদ্ধ করে", "সেচ খরচ নেই বললেই চলে", "বাজারে ডালের স্থায়ী উচ্চ চাহিদা"],
        "reasons_en": ["Fixes atmospheric nitrogen into soil", "Minimal irrigation requirement", "High and steady consumer price"]
    }
]

def calculate_suitability(crop: dict, req: CropRecommendationRequest) -> int:
    score = 50

    # Season Match (30 pts)
    if req.season in crop["seasons"]:
        score += 25
    else:
        score -= 20

    # Soil Match (20 pts)
    if req.soil_type in crop["soils"]:
        score += 15
    elif "other" == req.soil_type:
        score += 5
    else:
        score -= 5

    # Elevation Match (15 pts)
    if req.elevation in crop["elevations"]:
        score += 10

    # Water Match (15 pts)
    if req.water_availability in crop["water"]:
        score += 10
    elif "rain_fed" == req.water_availability and "rain_fed" not in crop["water"]:
        score -= 15

    # District specific weighting
    dist = req.district.lower()
    if dist in ["bogura", "dinajpur", "rangpur"] and crop["name_en"] in ["Potato", "Maize / Corn"]:
        score += 5
    if dist in ["sylhet", "sunamganj"] and crop["name_en"] in ["Boro Rice"]:
        score += 5
    if dist in ["faridpur", "jashore"] and crop["name_en"] in ["Tosha Jute", "Mustard"]:
        score += 5

    return max(15, min(98, score))

def recommend_crops(req: CropRecommendationRequest) -> CropRecommendationResponse:
    ranked = []
    for c in CROP_DATABASE:
        suitability = calculate_suitability(c, req)
        # Filter out crops that are completely out of season unless score > 40
        if req.season not in c["seasons"] and suitability < 50:
            continue

        item = RecommendedCrop(
            crop_name_en=c["name_en"],
            crop_name_bn=c["name_bn"],
            variety_en=c["variety_en"],
            variety_bn=c["variety_bn"],
            suitability_score=suitability,
            expected_yield_per_decimal_kg=c["yield_per_decimal_kg"],
            duration_days=c["duration_days"],
            water_requirement=c["water_req"],
            profit_potential=c["profit"],
            reasons_bn=c["reasons_bn"],
            reasons_en=c["reasons_en"],
        )
        ranked.append(item)

    ranked.sort(key=lambda x: x.suitability_score, reverse=True)

    return CropRecommendationResponse(
        district=req.district.capitalize(),
        season=req.season,
        soil_type=req.soil_type,
        recommendations=ranked[:5], # Top 5
        source="KrishiMind Agronomic Engine (BRRI/BARI Standard)"
    )
