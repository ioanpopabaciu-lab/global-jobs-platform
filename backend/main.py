"""
GJC Backend - Entry point for deployment
Imports the full app from server.py
"""
import logging
import sys

# Configure early logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("main")
logger.info("=== main.py starting ===")

try:
    # Import the full FastAPI app from server.py
    from server import app
    logger.info("✅ App imported successfully from server.py")
except Exception as e:
    logger.error(f"❌ Failed to import app: {e}")
    import traceback
    traceback.print_exc()
    
    # Fallback: create minimal app for health check
    logger.warning("Creating fallback minimal app...")
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
    app = FastAPI(title="GJC API - Fallback", version="1.0.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.get("/health")
    @app.get("/api/health")
    async def health():
        return {"status": "ok", "mode": "fallback", "error": str(e)}
    
    logger.info("✅ Fallback app created")

__all__ = ["app"]
