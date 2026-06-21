const API_URL = 'http://localhost:8000/api';

export const getEmissionFactors = async () => {
    try {
        const res = await fetch(`${API_URL}/emission-factors`);
        return await res.json();
    } catch (e) {
        console.warn("Failed to fetch emission factors, using fallback", e);
        return null;
    }
};

export const calculateCarbon = async (data) => {
    const res = await fetch(`${API_URL}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Calculation failed");
    return await res.json();
};

export const trackActivity = async (data) => {
    const res = await fetch(`${API_URL}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Tracking failed");
    return await res.json();
};

export const deleteActivity = async (id) => {
    const res = await fetch(`${API_URL}/track/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error("Deletion failed");
    return await res.json();
};

export const updateActivity = async (id, data) => {
    const res = await fetch(`${API_URL}/track/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Update failed");
    return await res.json();
};
