from fastapi import APIRouter, HTTPException
from app.models.carbon import CalculateRequest, CalculateResponse, TrackRequest, TrackResponse
from app.services.carbon_calculator import calculate_carbon, get_equivalents, get_nudge, EMISSION_FACTORS
import uuid

router = APIRouter()

# In-memory store for MVP
TRACKED_ENTRIES = []

@router.get("/emission-factors")
def get_factors():
    return EMISSION_FACTORS

@router.post("/calculate", response_model=CalculateResponse)
def calculate(req: CalculateRequest):
    try:
        carbon = calculate_carbon(req.category, req.activity, req.amount)
        eq = get_equivalents(carbon)
        return CalculateResponse(
            carbon_kg=round(carbon, 2),
            equivalent_trees=eq["trees"],
            equivalent_km_driven=eq["km_driven"]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/track", response_model=TrackResponse)
def track(req: TrackRequest):
    try:
        carbon = calculate_carbon(req.category, req.activity, req.amount)
        nudge = get_nudge(req.category, req.activity, carbon)
        
        entry = {
            "id": str(uuid.uuid4()),
            "category": req.category,
            "activity": req.activity,
            "amount": req.amount,
            "carbon_kg": carbon
        }
        TRACKED_ENTRIES.append(entry)
        
        # negative impact if carbon is high, positive if low
        # e.g., baseline for a meal might be 2kg. 
        # So impact = 2.0 - carbon
        world_impact = round(2.0 - carbon, 2) if req.category == "food" else round(1.0 - carbon, 2)
        
        return TrackResponse(
            id=entry["id"],
            carbon_kg=round(carbon, 2),
            nudge=nudge,
            world_impact=world_impact
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/track/daily")
def get_daily():
    total_carbon = sum(entry["carbon_kg"] for entry in TRACKED_ENTRIES)
    return {
        "entries": TRACKED_ENTRIES,
        "total_carbon_kg": round(total_carbon, 2),
        "budget_remaining": max(0, 15.0 - total_carbon)
    }
@router.delete("/track/{entry_id}")
def delete_track(entry_id: str):
    global TRACKED_ENTRIES
    # Even if not found (due to server restart), return success for frontend MVP
    TRACKED_ENTRIES = [e for e in TRACKED_ENTRIES if e["id"] != entry_id]
    return {"status": "success", "deleted_id": entry_id}

@router.put("/track/{entry_id}", response_model=TrackResponse)
def update_track(entry_id: str, req: TrackRequest):
    global TRACKED_ENTRIES
    
    try:
        carbon = calculate_carbon(req.category, req.activity, req.amount)
        nudge = get_nudge(req.category, req.activity, carbon)
        world_impact = round(2.0 - carbon, 2) if req.category == "food" else round(1.0 - carbon, 2)
        
        entry_idx = next((i for i, e in enumerate(TRACKED_ENTRIES) if e["id"] == entry_id), None)
        if entry_idx is not None:
            TRACKED_ENTRIES[entry_idx].update({
                "category": req.category,
                "activity": req.activity,
                "amount": req.amount,
                "carbon_kg": carbon
            })
        else:
            # If backend restarted, just add it back so it doesn't fail
            TRACKED_ENTRIES.append({
                "id": entry_id,
                "category": req.category,
                "activity": req.activity,
                "amount": req.amount,
                "carbon_kg": carbon
            })
            
        return TrackResponse(
            id=entry_id,
            carbon_kg=round(carbon, 2),
            nudge=nudge,
            world_impact=world_impact
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
