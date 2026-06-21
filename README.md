# EcoSphere: Carbon Footprint Awareness App 🌱

EcoSphere is a modern, gamified web application designed to track, visualize, and reduce your daily carbon footprint. By combining an intuitive dashboard with a living, breathing ecosystem visualization, EcoSphere goes beyond simple tracking—it fosters genuine awareness and encourages sustainable behavior through emotional and cognitive feedback.

## Features

- **Living World Visualization:** Your "My World" tab dynamically reacts to your daily carbon footprint. Keep your score high to see a thriving, sunny ecosystem with trees and birds. Let it drop, and watch the smog roll in and trees disappear.
- **Daily Footprint Dashboard:** Log your activities (meals, transport, energy usage, etc.) and see your impact mapped against a daily carbon budget.
- **Smart Insights:** View a breakdown of your emissions via interactive charts, track your trends against national averages, and receive personalized, AI-driven tips based on your specific lifestyle patterns.
- **Community Leaderboard:** Compete in neighborhood challenges. Your rank adjusts dynamically based on your daily emissions, driving collective accountability.
- **Full CRUD Functionality:** Log, edit, and delete activities effortlessly, with robust error-handling and offline-capable fallback mechanisms.

## Tech Stack

- **Frontend:** React + Vite, TailwindCSS (for utility styling and glassmorphism UI), Framer Motion (for animations), Zustand (for state management and local storage persistence), Recharts (for data visualization).
- **Backend:** FastAPI (Python) for rapid, high-performance API endpoints and carbon calculation logic.

## Project Structure

```text
EcoSphere/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── api/       # API integration
│   │   ├── pages/     # Main views (Dashboard, World, Community, etc.)
│   │   └── store/     # Zustand state management
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── routers/   # API endpoints
│   │   └── services/  # Carbon calculation logic
│   └── main.py        # Backend entry point
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```

The application will be accessible at `http://localhost:5173`.

## Deployment

EcoSphere is container-ready and built to be easily deployed using Google Cloud Run or similar platform-as-a-service providers. The MVP uses local storage for the frontend state and an in-memory database for the backend, making it highly portable for initial testing and demonstration.
