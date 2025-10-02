from fastapi import FastAPI
import os
import logging
from datetime import datetime

from routers import session as session_router

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Archon API",
    description="OS One Archon Integration Service",
    version="1.0.0"
)

# existing routes...
app.include_router(session_router.router)


@app.get("/")
async def root():
    return {
        "service": "Archon API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for Docker and monitoring"""
    return {
        "status": "healthy",
        "service": "archon-api",
        "timestamp": datetime.now().isoformat(),
        "env_vars": {
            "ELEVENLABS_API_KEY": "present" if os.getenv("ELEVENLABS_API_KEY") else "missing"
        }
    }


@app.get("/env")
async def get_env():
    """Debug endpoint to check environment variables"""
    return {
        "ELEVENLABS_API_KEY": "present" if os.getenv("ELEVENLABS_API_KEY") else "missing",
        "environment": os.getenv("ENVIRONMENT", "development")
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=7700)
