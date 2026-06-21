"""
EcoSphere Backend – pytest Test Suite
======================================
Tests every public endpoint of the FastAPI application and the core
carbon_calculator service functions.

Run from the backend/ directory with:
    pytest -v tests/
"""

import sys
import os

# Ensure backend root is on the path so `from main import app` works
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from main import app
from app.services.carbon_calculator import (
    calculate_carbon,
    get_equivalents,
    get_nudge,
    EMISSION_FACTORS,
)

# ---------------------------------------------------------------------------
# Shared test client
# ---------------------------------------------------------------------------
client = TestClient(app)


# ===========================================================================
# ROOT
# ===========================================================================

def test_root_returns_welcome_message():
    """GET / → 200 with welcome JSON."""
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json() == {"message": "Welcome to EcoSphere API"}


# ===========================================================================
# EMISSION FACTORS
# ===========================================================================

def test_emission_factors_returns_dict():
    """GET /api/emission-factors → dict with at least one category."""
    resp = client.get("/api/emission-factors")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    assert len(data) > 0


def test_emission_factors_contains_expected_categories():
    """Emission factors must contain food, transport, energy, lifestyle."""
    resp = client.get("/api/emission-factors")
    data = resp.json()
    for category in ("food", "transport", "energy", "lifestyle"):
        assert category in data, f"Missing category: {category}"


# ===========================================================================
# CALCULATE
# ===========================================================================

class TestCalculate:
    """Tests for POST /api/calculate."""

    def test_calculate_food_beef(self):
        payload = {"category": "food", "activity": "beef_meal", "amount": 1.0}
        resp = client.post("/api/calculate", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "carbon_kg" in data
        assert "equivalent_trees" in data
        assert "equivalent_km_driven" in data
        assert data["carbon_kg"] == round(6.61 * 1.0, 2)

    def test_calculate_transport_car(self):
        payload = {"category": "transport", "activity": "car_petrol", "amount": 100.0}
        resp = client.post("/api/calculate", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["carbon_kg"] == round(0.192 * 100.0, 2)

    def test_calculate_energy_coal(self):
        payload = {"category": "energy", "activity": "coal", "amount": 10.0}
        resp = client.post("/api/calculate", json=payload)
        assert resp.status_code == 200
        assert resp.json()["carbon_kg"] == round(0.91 * 10.0, 2)

    def test_calculate_lifestyle_laptop(self):
        payload = {"category": "lifestyle", "activity": "new_laptop", "amount": 1.0}
        resp = client.post("/api/calculate", json=payload)
        assert resp.status_code == 200
        assert resp.json()["carbon_kg"] == round(350 * 1.0, 2)

    def test_calculate_zero_amount(self):
        """Zero amount should return 0 carbon."""
        payload = {"category": "food", "activity": "vegan_meal", "amount": 0}
        resp = client.post("/api/calculate", json=payload)
        assert resp.status_code == 200
        assert resp.json()["carbon_kg"] == 0.0

    def test_calculate_missing_amount_returns_422(self):
        """Missing required field → 422 Validation Error."""
        payload = {"category": "food", "activity": "beef_meal"}
        resp = client.post("/api/calculate", json=payload)
        assert resp.status_code == 422

    def test_calculate_unknown_category_returns_400(self):
        """Unknown category → 400 Bad Request."""
        payload = {"category": "invalid_cat", "activity": "something", "amount": 1.0}
        resp = client.post("/api/calculate", json=payload)
        assert resp.status_code == 400

    def test_calculate_unknown_activity_returns_400(self):
        """Unknown activity in valid category → 400 Bad Request."""
        payload = {"category": "food", "activity": "moon_cheese", "amount": 1.0}
        resp = client.post("/api/calculate", json=payload)
        assert resp.status_code == 400


# ===========================================================================
# TRACK
# ===========================================================================

class TestTrack:
    """Tests for POST /api/track and related endpoints."""

    def test_track_creates_entry_with_id(self):
        payload = {"category": "food", "activity": "beef_meal", "amount": 1.0}
        resp = client.post("/api/track", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert len(data["id"]) > 0
        assert "carbon_kg" in data
        assert "nudge" in data
        assert "world_impact" in data

    def test_track_carbon_matches_calculate(self):
        """Tracked carbon_kg should equal what /calculate returns for same input."""
        payload = {"category": "transport", "activity": "car_petrol", "amount": 50.0}
        calc_resp = client.post("/api/calculate", json=payload).json()
        track_resp = client.post("/api/track", json=payload).json()
        assert track_resp["carbon_kg"] == calc_resp["carbon_kg"]

    def test_track_invalid_category_returns_400(self):
        payload = {"category": "unknown", "activity": "something", "amount": 1.0}
        resp = client.post("/api/track", json=payload)
        assert resp.status_code == 400

    def test_track_entry_appears_in_daily(self):
        """After tracking, entry must appear in the daily summary."""
        payload = {"category": "energy", "activity": "coal", "amount": 5.0}
        track = client.post("/api/track", json=payload).json()
        daily = client.get("/api/track/daily").json()
        ids = [e["id"] for e in daily["entries"]]
        assert track["id"] in ids

    def test_track_delete_entry(self):
        """Deleting a tracked entry returns success."""
        payload = {"category": "food", "activity": "vegan_meal", "amount": 1.0}
        track = client.post("/api/track", json=payload).json()
        del_resp = client.delete(f"/api/track/{track['id']}")
        assert del_resp.status_code == 200
        data = del_resp.json()
        assert data["status"] == "success"
        assert data["deleted_id"] == track["id"]

    def test_track_update_entry(self):
        """Updating a tracked entry returns updated values."""
        payload = {"category": "food", "activity": "beef_meal", "amount": 1.0}
        track = client.post("/api/track", json=payload).json()

        updated_payload = {"category": "food", "activity": "vegan_meal", "amount": 1.0}
        update_resp = client.put(f"/api/track/{track['id']}", json=updated_payload)
        assert update_resp.status_code == 200
        updated = update_resp.json()
        # Vegan meal emits less CO2 than beef
        assert updated["carbon_kg"] < track["carbon_kg"]


# ===========================================================================
# DAILY SUMMARY
# ===========================================================================

class TestDailySummary:
    """Tests for GET /api/track/daily."""

    def test_daily_summary_structure(self):
        resp = client.get("/api/track/daily")
        assert resp.status_code == 200
        data = resp.json()
        assert "entries" in data
        assert "total_carbon_kg" in data
        assert "budget_remaining" in data

    def test_daily_total_is_non_negative(self):
        resp = client.get("/api/track/daily")
        data = resp.json()
        assert data["total_carbon_kg"] >= 0

    def test_daily_budget_remaining_is_non_negative(self):
        resp = client.get("/api/track/daily")
        data = resp.json()
        assert data["budget_remaining"] >= 0


# ===========================================================================
# SERVICE UNIT TESTS – carbon_calculator.py
# ===========================================================================

class TestCarbonCalculatorService:
    """Unit tests for the carbon_calculator service (no HTTP layer)."""

    def test_calculate_carbon_beef(self):
        result = calculate_carbon("food", "beef_meal", 1.0)
        assert result == pytest.approx(6.61)

    def test_calculate_carbon_amount_scaling(self):
        result = calculate_carbon("transport", "car_petrol", 100.0)
        assert result == pytest.approx(0.192 * 100.0)

    def test_calculate_carbon_zero(self):
        assert calculate_carbon("food", "vegan_meal", 0) == 0.0

    def test_calculate_carbon_unknown_category_raises(self):
        with pytest.raises(ValueError, match="Unknown category"):
            calculate_carbon("invalid", "beef_meal", 1.0)

    def test_calculate_carbon_unknown_activity_raises(self):
        with pytest.raises(ValueError, match="Unknown activity"):
            calculate_carbon("food", "mystery_meat", 1.0)

    def test_get_equivalents_structure(self):
        result = get_equivalents(22.0)
        assert "trees" in result
        assert "km_driven" in result
        assert result["trees"] == pytest.approx(1.0)

    def test_get_equivalents_zero(self):
        result = get_equivalents(0.0)
        assert result["trees"] == 0.0
        assert result["km_driven"] == 0.0

    def test_get_nudge_beef_returns_string(self):
        nudge = get_nudge("food", "beef_meal", 6.61)
        assert isinstance(nudge, str)
        assert len(nudge) > 0

    def test_get_nudge_vegan_positive(self):
        nudge = get_nudge("food", "vegan_meal", 0.37)
        assert "great" in nudge.lower() or "thriving" in nudge.lower()

    def test_get_nudge_bicycle_positive(self):
        nudge = get_nudge("transport", "bicycle_walk", 0.0)
        assert "zero" in nudge.lower() or "tree" in nudge.lower()

    def test_emission_factors_loaded(self):
        assert isinstance(EMISSION_FACTORS, dict)
        assert "food" in EMISSION_FACTORS
        assert "transport" in EMISSION_FACTORS
