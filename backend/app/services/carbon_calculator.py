import json
import os

DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'emission_factors.json')

with open(DATA_FILE, 'r') as f:
    EMISSION_FACTORS = json.load(f)

def calculate_carbon(category: str, activity: str, amount: float) -> float:
    if category not in EMISSION_FACTORS:
        raise ValueError(f"Unknown category: {category}")
    if activity not in EMISSION_FACTORS[category]:
        raise ValueError(f"Unknown activity: {activity} in category {category}")
    
    factor = EMISSION_FACTORS[category][activity]
    return factor * amount

def get_equivalents(carbon_kg: float) -> dict:
    # 1 tree absorbs ~22kg per year. So 1 kg = 1/22 trees
    # Avg car emits ~0.192 kg per km. So 1 kg = 1/0.192 km
    return {
        "trees": round(carbon_kg / 22, 2),
        "km_driven": round(carbon_kg / 0.192, 1)
    }

def get_nudge(category: str, activity: str, carbon_kg: float) -> str:
    # simple nudge engine
    if category == "food":
        if "beef" in activity or "lamb" in activity:
            return "This choice costs your world. Switching to chicken next time saves ~5kg CO2e."
        elif "vegan" in activity or "vegetarian" in activity:
            return "Great choice! Your ecosystem is thriving thanks to plant-based meals."
    elif category == "transport":
        if "car_petrol" in activity and carbon_kg > 5:
            return "Consider carpooling or public transport for long distances to keep your world green."
        elif "bicycle" in activity or "walk" in activity:
            return "Zero emissions! Your virtual trees are growing."
    return "Every action counts towards a greener world."
