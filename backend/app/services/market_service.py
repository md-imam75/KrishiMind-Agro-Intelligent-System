import random
from datetime import date, timedelta
from typing import List
from app.models.intelligence import MarketPrice

COMMODITIES = [
    "বোরো ধান (Boro Rice)",
    "আমন ধান (Aman Rice)",
    "আলু (Potato)",
    "কাঁচা মরিচ (Green Chilli)",
    "টমেটো (Tomato)",
    "পাট (Jute)",
    "পেঁয়াজ (Onion)",
    "রসুন (Garlic)",
    "বেগুন (Brinjal)"
]

VALID_DISTRICTS = [
    "dhaka", "faridpur", "gazipur", "gopalganj", "kishoreganj", "madaripur", "manikganj", "munshiganj", "narayanganj", "narsingdi", "rajbari", "shariatpur", "tangail",
    "bogra", "joypurhat", "naogaon", "natore", "chapainawabganj", "pabna", "rajshahi", "sirajganj",
    "dinajpur", "gaibandha", "kurigram", "lalmonirhat", "nilphamari", "panchagarh", "rangpur", "thakurgaon",
    "habiganj", "moulvibazar", "sunamganj", "sylhet",
    "barguna", "barisal", "bhola", "jhalokati", "patuakhali", "pirojpur",
    "bandarban", "brahmanbaria", "chandpur", "chattogram", "comilla", "cox's bazar", "feni", "khagrachari", "lakshmipur", "noakhali", "rangamati",
    "chuadanga", "jessore", "jhenaidah", "khulna", "kushtia", "magura", "meherpur", "narail", "satkhira",
    "jamalpur", "mymensingh", "netrokona", "sherpur"
]

def generate_mock_market_prices(district: str) -> List[dict]:
    """
    Generates realistic looking market prices for a given district.
    """
    normalized_district = district.lower().strip()
    if normalized_district not in VALID_DISTRICTS:
        return []
        
    random.seed(normalized_district) # Consistent per district for the day
    
    prices = []
    today = date.today()
    
    for commodity in COMMODITIES:
        # Base prices in BDT per kg or per maund depending on the item, let's assume per kg for simplicity
        base = random.randint(30, 150)
        
        # Wholesale is usually 20-30% cheaper than retail
        wholesale = float(base)
        retail = float(base * random.uniform(1.2, 1.4))
        
        # Random trend
        trend = random.choice(["up", "down", "stable", "stable"])
        
        prices.append({
            "commodity": commodity,
            "district": district,
            "wholesale_price": round(wholesale, 2),
            "retail_price": round(retail, 2),
            "date": today,
            "trend": trend
        })
        
    return prices
