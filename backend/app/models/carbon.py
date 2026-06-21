from pydantic import BaseModel
from typing import Optional

class CalculateRequest(BaseModel):
    category: str
    activity: str
    amount: float # e.g., meals, km, kWh, items

class CalculateResponse(BaseModel):
    carbon_kg: float
    equivalent_trees: float
    equivalent_km_driven: float

class TrackRequest(BaseModel):
    category: str
    activity: str
    amount: float

class TrackResponse(BaseModel):
    id: str
    carbon_kg: float
    nudge: Optional[str] = None
    world_impact: float
