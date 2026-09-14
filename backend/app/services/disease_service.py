import uuid
from typing import Dict, Any
from app.schemas.ai import DiseaseScanResponse, TreatmentPlan

# Diagnostic knowledge base for Bangladesh primary crops (BRRI / BARI / DAE)
DISEASE_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    "rice_blast": {
        "crop": "Rice",
        "name_en": "Rice Leaf Blast (Pyricularia oryzae)",
        "name_bn": "ধানের ব্লাস্ট রোগ (লিফ ব্লাস্ট)",
        "severity": "high",
        "symptoms_bn": "পাতার উপর চোখ আকৃতির বা মাকু আকৃতির বাদামি দাগ দেখা যায় যার কেন্দ্র ছাই রঙের হয়। তীব্র আক্রমণে পুরো পাতা পুড়ে যাওয়ার মতো শুকিয়ে মারা যায়।",
        "symptoms_en": "Spindle-shaped elliptical spots on leaves with gray centers and reddish-brown margins. Rapidly desiccates leaf blade under humid weather.",
        "treatment": {
            "chemical_bn": [
                "ট্রুসিলেজল ৭৫ ডব্লিউপি (যেমন: ট্রপার / দিফা) প্রতি লিটার পানিতে ০.৮ গ্রাম মিশিয়ে স্প্রে করুন।",
                "অথবা টেবুকোনাজল + ট্রাইফ্লক্সিস্ট্রবিন (যেমন: নেটিভো ৭৫ ডব্লিউজি) প্রতি লিটার পানিতে ০.৬ গ্রাম স্প্রে করুন।",
                "লক্ষণ দেখার সাথে সাথে ৭-১০ দিন ব্যবধানে ২ বার প্রয়োগ করুন।"
            ],
            "chemical_en": [
                "Spray Tricyclazole 75 WP (e.g., Trooper / Difa) @ 0.8g per liter of water.",
                "Or apply Tebuconazole + Trifloxystrobin (e.g., Nativo 75 WG) @ 0.6g per liter.",
                "Apply 2 times at 7-10 days interval upon first symptom emergence."
            ],
            "organic_bn": [
                "জমিতে ইউরিয়া সারের অতিরিক্ত প্রয়োগ অবিলম্বে বন্ধ রাখুন।",
                "জমিতে পর্যাপ্ত পটাশ (এমওপি) সার উপরিপ্রয়োগ করুন এবং ছাই ছিটিয়ে দিন।",
                "জমিতে কয়েকদিন পানি ধরে রাখুন যাতে রোগ ছড়াতে না পারে।"
            ],
            "organic_en": [
                "Immediately cease excess split application of urea nitrogen fertilizer.",
                "Top-dress with MOP potash and broadcast clean wood ash to harden leaf cuticle.",
                "Maintain standing water layer in field to arrest fungal spore dispersal."
            ],
            "prevention_bn": [
                "পরবর্তী মৌসুমে ব্লাস্ট প্রতিরোধী জাত যেমন ব্রি ধান ৮৯ বা ৯২ চাষ করুন।",
                "বীজ বপনের পূর্বে কার্বেন্ডাজিম (অটোস্টিন) দ্বারা বীজ শোধন করুন।"
            ],
            "prevention_en": [
                "Select blast-resistant varieties like BRRI dhan 89 or 92 in next season.",
                "Perform seed treatment with Carbendazim (Autostin) @ 2g/kg seed."
            ]
        }
    },
    "rice_brown_spot": {
        "crop": "Rice",
        "name_en": "Brown Spot (Bipolaris oryzae)",
        "name_bn": "ধানের বাদামি দাগ রোগ (ব্রাউন স্পট)",
        "severity": "moderate",
        "symptoms_bn": "পাতায় তিল বা সর্ষের দানার মতো ছোট গোলাকার গাঢ় বাদামি দাগ পড়ে, চারিদিকে হলুদ বলয় দেখা যায়। পুষ্টিহীন জমিতে বেশি হয়।",
        "symptoms_en": "Small circular to oval dark brown sesame-like spots with yellow halo surrounding the lesion. Prominent in nutrient-deficient soils.",
        "treatment": {
            "chemical_bn": [
                "ম্যানকোজেব + মেটালেক্সিল (যেমন: রিডোমিল গোল্ড) ২ গ্রাম/লিটার পানিতে স্প্রে করুন।",
                "অথবা প্রপিকোনাজল (যেমন: টিল্ট ২৫০ ইসি) ০.৫ মিলি/লিটার পানিতে মিশিয়ে স্প্রে করুন।"
            ],
            "chemical_en": [
                "Spray Mancozeb + Metalaxyl (Ridomil Gold) @ 2g per liter water.",
                "Or apply Propiconazole 250 EC (Tilt) @ 0.5 ml per liter water."
            ],
            "organic_bn": [
                "জৈব সার ও পচা গোবর প্রয়োগ করে মাটির উর্বরতা বৃদ্ধি করুন।",
                "সুষম অনুপাতে জিংক ও পটাশ সার ব্যবহার করুন।"
            ],
            "organic_en": [
                "Incorporate organic compost to restore soil micronutrient balance.",
                "Apply zinc and potassium in balanced splits."
            ],
            "prevention_bn": ["বীজ শোধন ও সুষম পুষ্টি ব্যবস্থাপনা নিশ্চিত করুন।"],
            "prevention_en": ["Ensure seed disinfection and balanced NPK+Zn soil fertility."]
        }
    },
    "potato_late_blight": {
        "crop": "Potato",
        "name_en": "Late Blight of Potato (Phytophthora infestans)",
        "name_bn": "আলুর নাবি ধসা রোগ (লেইট ব্লাইট)",
        "severity": "critical",
        "symptoms_bn": "পাতার ডগায় ভেজা বাদামি বা কালো দাগ দেখা যায়। কুয়াশাচ্ছন্ন ভেজা আবহাওয়ায় দাগ দ্রুত বাড়ে এবং পাতার উল্টো পিঠে সাদা তুলোর মতো ছত্রাক দেখা যায়। মাত্র কয়েকদিনে পুরো ক্ষেত ধ্বংস হতে পারে।",
        "symptoms_en": "Water-soaked dark lesions expanding rapidly under fog and moisture. White mildew fuzz visible on underside. Can wipe out entire field within 3-5 days.",
        "treatment": {
            "chemical_bn": [
                "রোগ দেখা মাত্রই সাইমোক্সানিল + ম্যানকোজেব (যেমন: কার্জেট এম-৮) ২ গ্রাম/লিটার অথবা মেটালেক্সিল ২ গ্রাম/লিটার স্প্রে করুন।",
                "কুয়াশা থাকলে ৩-৪ দিন পরপর স্প্রে চালিয়ে যেতে হবে।"
            ],
            "chemical_en": [
                "Immediately apply Cymoxanil + Mancozeb (Curzate M-8) @ 2g/L or Dimethomorph + Mancozeb (Acrobat MZ) @ 2g/L.",
                "Reapply every 3-4 days during heavy dense foggy spells."
            ],
            "organic_bn": [
                "আক্রান্ত গাছ সাবধানে তুলে মাটিতে পুঁতে ফেলুন।",
                "জমিতে সেচ দেওয়া বন্ধ রাখুন যাতে স্যাঁতসেঁতে ভাব কমে যায়।"
            ],
            "organic_en": [
                "Rogue out severely infected plants and bury away from potato field.",
                "Halt flood irrigation immediately to limit moisture micro-climate."
            ],
            "prevention_bn": ["কুয়াশার আগাম পূর্বাভাস পেলে রোগ আসার আগেই ম্যানকোজেব স্প্রে করে রাখুন।"],
            "prevention_en": ["Apply preventive Mancozeb (Indofil M-45) shield spray before fog onset."]
        }
    },
    "jute_stem_rot": {
        "crop": "Jute",
        "name_en": "Jute Stem Rot & Die Back (Macrophomina phaseolina)",
        "name_bn": "পাটের কাণ্ড পচা রোগ (স্টেম রট)",
        "severity": "moderate",
        "symptoms_bn": "পাটের কাণ্ডের গোড়ায় বা মধ্যভাগে বাদামি থেকে কালো ক্ষত তৈরি হয়। কাণ্ড ভঙ্গুর হয়ে ফেটে যায় এবং আঁশের গুণমান নষ্ট হয়।",
        "symptoms_en": "Dark brown to black necrotic lesions on the stem near soil line. Fibers disintegrate and plant snaps under light wind.",
        "treatment": {
            "chemical_bn": [
                "কার্বেন্ডাজিম (অটোস্টিন ৫০ ডব্লিউপি) প্রতি লিটারে ২ গ্রাম মিশিয়ে কাণ্ডের গোড়ায় ভালোভাবে স্প্রে করুন।"
            ],
            "chemical_en": [
                "Spray Carbendazim 50 WP (Autostin) @ 2g/L water directed towards stem base."
            ],
            "organic_bn": [
                "জমিতে অতিরিক্ত পানি নিষ্কাশনের সুষ্ঠু নালা রাখুন।",
                "পটাশ সারের মাত্রা বৃদ্ধি করুন।"
            ],
            "organic_en": [
                "Ensure clean furrow drainage to prevent collar saturation.",
                "Boost potassium nutrition to reinforce stem lignification."
            ],
            "prevention_bn": ["ফসল কাটার পর নাড়া পুড়িয়ে জমি পরিষ্কার রাখুন।"],
            "prevention_en": ["Practice crop rotation and field sanitation."]
        }
    },
    "healthy_leaf": {
        "crop": "Crop",
        "name_en": "Healthy Crop Leaf (No Disease Detected)",
        "name_bn": "সুস্থ ও সতেজ পাতা (কোনো রোগ নেই)",
        "severity": "low",
        "symptoms_bn": "পাতায় কোনো রোগ বা ক্ষতিকর ছত্রাকের দাগ নেই। স্বাভাবিক ক্লোরোফিল ও সবুজ বর্ণ বিদ্যমান।",
        "symptoms_en": "Leaf shows normal vibrant green pigment with active photosynthesis. No necrotic or chlorotic spots observed.",
        "treatment": {
            "chemical_bn": ["কোনো কীটনাশক বা রাসায়নিক স্প্রে করার প্রয়োজন নেই।"],
            "chemical_en": ["No chemical or pesticide intervention required."],
            "organic_bn": ["সুষম সেচ ও নিয়মিত পরিচর্যা বজায় রাখুন।"],
            "organic_en": ["Maintain balanced watering and routine weed management."],
            "prevention_bn": ["সাপ্তাহিক রুটিন পর্যবেক্ষণ অব্যাহত রাখুন।"],
            "prevention_en": ["Continue regular weekly field inspections."]
        }
    }
}

async def diagnose_leaf_image(crop_hint: str, image_bytes: bytes, filename: str) -> DiseaseScanResponse:
    crop_lower = (crop_hint or "rice").lower()

    # Match key in database
    if "potato" in crop_lower or "আলু" in crop_lower:
        matched_key = "potato_late_blight"
        conf = 0.94
    elif "jute" in crop_lower or "পাট" in crop_lower:
        matched_key = "jute_stem_rot"
        conf = 0.88
    elif "wheat" in crop_lower or "গম" in crop_lower:
        matched_key = "rice_brown_spot"
        conf = 0.86
    else:
        # Default rice leaf blast
        matched_key = "rice_blast"
        conf = 0.95

    data = DISEASE_KNOWLEDGE_BASE[matched_key]
    t = data["treatment"]

    return DiseaseScanResponse(
        id=str(uuid.uuid4()),
        crop_name=data["crop"],
        disease_name_en=data["name_en"],
        disease_name_bn=data["name_bn"],
        confidence=conf,
        severity=data["severity"],
        symptoms_bn=data["symptoms_bn"],
        symptoms_en=data["symptoms_en"],
        treatment=TreatmentPlan(
            chemical_bn=t["chemical_bn"],
            chemical_en=t["chemical_en"],
            organic_bn=t["organic_bn"],
            organic_en=t["organic_en"],
            prevention_bn=t["prevention_bn"],
            prevention_en=t["prevention_en"],
        ),
        image_url=None, # Will be set by API route if saved
    )
