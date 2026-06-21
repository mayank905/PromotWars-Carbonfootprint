import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routers import calculator

app = FastAPI(
    title="EcoSphere API",
    description="Backend API for tracking and calculating carbon footprints.",
    version="1.0.0"
)

# ---------------------------------------------------------
# Security & Middleware
# ---------------------------------------------------------

# Read allowed origins from environment, default to common local ports if not set.
ALLOWED_ORIGINS_STR = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS_STR.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """
    Middleware to inject standard HTTP security headers to all responses.
    This helps mitigate common web vulnerabilities like XSS and clickjacking.
    """
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

# ---------------------------------------------------------
# Routing
# ---------------------------------------------------------

app.include_router(calculator.router, prefix="/api")

@app.get("/", tags=["Health"])
def root() -> dict:
    """
    Root endpoint serving as a simple health check and welcome message.
    """
    return {"message": "Welcome to EcoSphere API"}

