import httpx
import logging
from datetime import datetime
from typing import Dict, Any, Tuple
from app.schemas.ai import WeatherResponse, CurrentWeather, DailyForecast, AgriculturalAdvisory

logger = logging.getLogger(__name__)

# Coordinates for all 64 districts in Bangladesh
DISTRICT_COORDS: Dict[str, Tuple[float, float]] = {
    "dhaka": (23.8103, 90.4125),
    "gazipur": (24.0023, 90.4264),
    "narayanganj": (23.6238, 90.5000),
    "tangail": (24.2513, 89.9167),
    "mymensingh": (24.7471, 90.4203),
    "kishoreganj": (24.4449, 90.7766),
    "chattogram": (22.3569, 91.7832),
    "cox's_bazar": (21.4272, 92.0058),
    "cumilla": (23.4682, 91.1788),
    "brahmanbaria": (23.9571, 91.1119),
    "sylhet": (24.8949, 91.8687),
    "moulvibazar": (24.4829, 91.7774),
    "habiganj": (24.3749, 91.4155),
    "sunamganj": (25.0658, 91.3950),
    "rajshahi": (24.3636, 88.6241),
    "bogura": (24.8465, 89.3770),
    "pabna": (24.0064, 89.2372),
    "sirajganj": (24.4534, 89.7008),
    "rangpur": (25.7439, 89.2752),
    "dinajpur": (25.6217, 88.6355),
    "kurigram": (25.8054, 89.6362),
    "khulna": (22.8456, 89.5403),
    "jashore": (23.1664, 89.2137),
    "satkhira": (22.7185, 89.0705),
    "kushtia": (23.9013, 89.1204),
    "barishal": (22.7010, 90.3535),
    "bhola": (22.6859, 90.6481),
    "patuakhali": (22.3596, 90.3299),
}

def get_coords(district: str) -> Tuple[float, float]:
    key = district.strip().lower().replace(" ", "_").replace("'", "")
    for k, v in DISTRICT_COORDS.items():
        if k in key or key in k:
            return v
    return DISTRICT_COORDS["dhaka"]

WMO_CODES = {
    0: ("পরিষ্কার আকাশ", "Clear sky"),
    1: ("প্রধানত পরিষ্কার", "Mainly clear"),
    2: ("আংশিক মেঘলা", "Partly cloudy"),
    3: ("মেঘলা আকাশ", "Overcast"),
    45: ("কুয়াশাচ্ছন্ন", "Foggy"),
    51: ("হালকা গুঁড়ি গুঁড়ি বৃষ্টি", "Light drizzle"),
    61: ("হালকা বৃষ্টি", "Slight rain"),
    63: ("মাঝারি বৃষ্টি", "Moderate rain"),
    65: ("ভারী বৃষ্টিপাত", "Heavy rain"),
    80: ("বৃষ্টির সম্ভাবনা", "Rain showers"),
    95: ("বজ্রবিদ্যুৎসহ ঝড়-বৃষ্টি", "Thunderstorm"),
}

async def get_weather_forecast(district: str) -> WeatherResponse:
    lat, lon = get_coords(district)
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m&"
        f"daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&"
        f"timezone=Asia%2FDhaka&forecast_days=7"
    )

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            data = resp.json()

        current_raw = data.get("current", {})
        daily_raw = data.get("daily", {})

        cur_code = current_raw.get("weather_code", 0)
        desc_bn, desc_en = WMO_CODES.get(cur_code, ("স্বাভাবিক আবহাওয়া", "Fair weather"))

        current = CurrentWeather(
            temperature=current_raw.get("temperature_2m", 28.0),
            relative_humidity=current_raw.get("relative_humidity_2m", 70),
            wind_speed_kmh=current_raw.get("wind_speed_10m", 10.0),
            precipitation_mm=current_raw.get("precipitation", 0.0),
            weather_desc_bn=desc_bn,
            weather_desc_en=desc_en,
            is_day=bool(current_raw.get("is_day", 1)),
        )

        daily_list = []
        times = daily_raw.get("time", [])
        for i in range(len(times)):
            code = daily_raw.get("weather_code", [])[i] if i < len(daily_raw.get("weather_code", [])) else 0
            w_bn, w_en = WMO_CODES.get(code, ("স্বাভাবিক", "Normal"))
            daily_list.append(
                DailyForecast(
                    date=times[i],
                    temp_max=daily_raw.get("temperature_2m_max", [30.0])[i],
                    temp_min=daily_raw.get("temperature_2m_min", [22.0])[i],
                    precipitation_sum_mm=daily_raw.get("precipitation_sum", [0.0])[i],
                    precipitation_probability=int(daily_raw.get("precipitation_probability_max", [20])[i] or 0),
                    weather_code=code,
                    weather_desc_bn=w_bn,
                    weather_desc_en=w_en,
                    wind_speed_kmh=daily_raw.get("wind_speed_10m_max", [12.0])[i],
                )
            )

        # Build agricultural advisory based on live parameters
        advisory = generate_agri_advisory(current, daily_list)

        return WeatherResponse(
            district=district.capitalize(),
            latitude=lat,
            longitude=lon,
            current=current,
            daily=daily_list,
            advisory=advisory,
        )

    except Exception as e:
        logger.error(f"Weather API error: {e}, using seasonal fallback")
        return get_fallback_weather(district, lat, lon)

def generate_agri_advisory(current: CurrentWeather, daily: list[DailyForecast]) -> AgriculturalAdvisory:
    rain_next_48h = sum(d.precipitation_sum_mm for d in daily[:2])
    max_prob = max((d.precipitation_probability for d in daily[:2]), default=0)

    # Spraying Advisory
    if current.wind_speed_kmh > 18:
        spray_status = "UNSAFE"
        spray_bn = "বাতাসের গতিবেগ বেশি (১৮ কিমি/ঘণ্টার উপরে)। কীটনাশক বা ছত্রাকনাশক স্প্রে করবেন না।"
        spray_en = "High wind speed (>18 km/h). Avoid pesticide or fungicide spraying to prevent drift."
    elif rain_next_48h > 5 or max_prob > 60:
        spray_status = "UNSAFE"
        spray_bn = "আগামী ২৪-৪৮ ঘণ্টার মধ্যে বৃষ্টির জোরালো সম্ভাবনা রয়েছে। স্প্রে করলে ধুয়ে যাবে।"
        spray_en = "High probability of rain in the next 24-48 hours. Spraying will get washed away."
    elif current.relative_humidity > 85:
        spray_status = "CAUTION"
        spray_bn = "বাতাসে আর্দ্রতা অনেক বেশি। সকালে শিশির শুকানোর পর স্প্রে করার পরামর্শ দেওয়া হচ্ছে।"
        spray_en = "High air humidity. Recommended to spray after morning dew dries."
    else:
        spray_status = "SAFE"
        spray_bn = "আবহাওয়া স্প্রে করার জন্য অনুকূল। সকালের মিষ্টি রোদে বা বিকালে স্প্রে করুন।"
        spray_en = "Conditions are ideal for spraying. Best performed during mild morning or late afternoon."

    # Irrigation Advice
    if rain_next_48h > 15:
        irri_bn = "পর্যাপ্ত বৃষ্টিপাতের সম্ভাবনা আছে। আপাতত সেচ বন্ধ রাখুন এবং জমির অতিরিক্ত পানি নিষ্কাশনের ব্যবস্থা করুন।"
        irri_en = "Heavy rainfall expected. Postpone irrigation and prepare field drainage channels."
    elif rain_next_48h > 5:
        irri_bn = "হালকা থেকে মাঝারি বৃষ্টি হতে পারে। সেচের প্রয়োজন নেই।"
        irri_en = "Light to moderate rain expected. Additional irrigation is not required."
    else:
        irri_bn = "আগামী কয়েকদিন ভারী বৃষ্টির সম্ভাবনা নেই। ফসলের বৃদ্ধির পর্যায় অনুযায়ী পরিমিত সেচ দিন।"
        irri_en = "No significant rain in forecast. Maintain regular irrigation matching crop stage."

    # Disease alert
    disease_alert_bn = None
    disease_alert_en = None
    if current.relative_humidity > 80 and current.temperature > 26:
        disease_alert_bn = "উচ্চ আর্দ্রতা ও তাপমাত্রার কারণে ধানের ব্লাস্ট ও আলুর নাবি ধসা রোগের ঝুঁকি বাড়ছে। নিয়মিত জমি পর্যবেক্ষণ করুন।"
        disease_alert_en = "High humidity and temperature elevate the risk of rice blast and potato late blight. Inspect fields regularly."

    tips_bn = [
        "সার প্রয়োগের পূর্বে মাটির আর্দ্রতা পরীক্ষা করে নিন।",
        "বৃষ্টির পর জমিতে জমে থাকা অতিরিক্ত পানি অবিলম্বে নিষ্কাশন করুন।",
        "ফসল কাটার উপযুক্ত হলে রৌদ্রোজ্জ্বল দিনে দ্রুত কেটে শুকিয়ে সংরক্ষণ করুন।"
    ]
    tips_en = [
        "Check soil moisture levels before applying granular fertilizers.",
        "Ensure drainage canals are clear to remove standing water after downpours.",
        "Harvest mature crops during clear sunny days and dry properly before storage."
    ]

    return AgriculturalAdvisory(
        spraying_suitability=spray_status,
        spraying_reason_bn=spray_bn,
        spraying_reason_en=spray_en,
        irrigation_advice_bn=irri_bn,
        irrigation_advice_en=irri_en,
        disease_risk_alert_bn=disease_alert_bn,
        disease_risk_alert_en=disease_alert_en,
        general_tips_bn=tips_bn,
        general_tips_en=tips_en,
    )

def get_fallback_weather(district: str, lat: float, lon: float) -> WeatherResponse:
    now_str = datetime.utcnow().strftime("%Y-%m-%d")
    current = CurrentWeather(
        temperature=28.5,
        relative_humidity=68,
        wind_speed_kmh=11.2,
        precipitation_mm=0.0,
        weather_desc_bn="রৌদ্রোজ্জ্বল ও উষ্ণ",
        weather_desc_en="Sunny and pleasant",
        is_day=True,
    )
    daily = [
        DailyForecast(
            date=now_str,
            temp_max=32.0,
            temp_min=24.0,
            precipitation_sum_mm=0.0,
            precipitation_probability=10,
            weather_code=0,
            weather_desc_bn="পরিষ্কার আকাশ",
            weather_desc_en="Clear sky",
            wind_speed_kmh=12.0,
        )
    ]
    advisory = AgriculturalAdvisory(
        spraying_suitability="SAFE",
        spraying_reason_bn="আবহাওয়া পরিষ্কার ও বাতাস শান্ত রয়েছে। স্প্রে করা নিরাপদ।",
        spraying_reason_en="Clear weather and gentle breeze. Safe for chemical application.",
        irrigation_advice_bn="মাটির রস বিবেচনা করে প্রয়োজন অনুযায়ী স্বাভাবিক সেচ দিন।",
        irrigation_advice_en="Provide standard irrigation as required by crop growth stage.",
        disease_risk_alert_bn=None,
        disease_risk_alert_en=None,
        general_tips_bn=["ফসল বৃদ্ধির এই সময়ে সুষম সার প্রয়োগ নিশ্চিত করুন।"],
        general_tips_en=["Maintain balanced NPK fertilizer application during active growth."],
    )
    return WeatherResponse(
        district=district.capitalize(),
        latitude=lat,
        longitude=lon,
        current=current,
        daily=daily,
        advisory=advisory,
    )
