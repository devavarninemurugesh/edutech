import sys
import os

# Add the 'backend' directory to sys.path so that 'app' can be imported by Vercel's serverless runtime
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

# Export for ASGI serverless runtime
__all__ = ["app"]
