# main.py - Entry point for deployment
# This file imports the app from server.py for compatibility

import sys
import logging

# Configure logging for startup debugging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("main")
logger.info("=== main.py loading ===")

try:
    from server import app
    logger.info("✅ Successfully imported app from server.py")
except Exception as e:
    logger.error(f"❌ Failed to import app: {e}")
    import traceback
    traceback.print_exc()
    raise

# Export app for uvicorn
__all__ = ["app"]
