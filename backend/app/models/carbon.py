from pydantic import BaseModel, Field
from typing import Optional

class CalculateRequest(BaseModel):
    category: str = Field(..., max_length=50, description="The category of emission (e.g., food, transport).")
    activity: str = Field(..., max_length=100, description="The specific activity (e.g., beef_meal, car_petrol).")
    amount: float = Field(..., ge=0, le=1000000, description="The amount associated with the activity (must be non-negative).")

class CalculateResponse(BaseModel):
    carbon_kg: float = Field(..., description="Calculated carbon emissions in kilograms.")
    equivalent_trees: float = Field(..., description="Equivalent number of trees required to absorb the emissions.")
    equivalent_km_driven: float = Field(..., description="Equivalent kilometers driven by an average car.")

class TrackRequest(BaseModel):
    category: str = Field(..., max_length=50, description="The category of emission.")
    activity: str = Field(..., max_length=100, description="The specific activity.")
    amount: float = Field(..., ge=0, le=1000000, description="The amount associated with the activity (must be non-negative).")

class TrackResponse(BaseModel):
    id: str = Field(..., description="Unique identifier for the tracked entry.")
    carbon_kg: float = Field(..., description="Calculated carbon emissions in kilograms.")
    nudge: Optional[str] = Field(None, description="A personalized eco-nudge or feedback.")
    world_impact: float = Field(..., description="Calculated impact score on the virtual world.")

