# # app/main.py
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.routing import APIRoute
# import logging

# # Set up logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# app = FastAPI(
#     title="Mutation Explorer API",
#     description="Variant Intelligence Platform",
#     version="1.0.0"
# )

# # CORS middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Import routes
# try:
#     from app.routes import variant
#     app.include_router(variant.router)
#     logger.info("✅ Variant router registered successfully")
# except Exception as e:
#     logger.error(f"❌ Failed to import variant router: {e}")

# @app.get("/")
# async def root():
#     return {
#         "message": "Mutation Explorer API is running",
#         "endpoints": [
#             "/",
#             "/health",
#             "/variant/{identifier}"
#         ]
#     }

# @app.get("/health")
# async def health_check():
#     return {"status": "healthy", "routes": [r.path for r in app.routes if isinstance(r, APIRoute)]}

# # Print all routes on startup
# @app.on_event("startup")
# async def startup_event():
#     logger.info("🚀 Application startup complete")
#     logger.info("📋 Available routes:")
#     for route in app.routes:
#         if isinstance(route, APIRoute):
#             logger.info(f"  {route.path}")

# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Mutation Explorer API",
    description="Variant Intelligence Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routes
try:
    from app.routes import variant
    app.include_router(variant.router)
    logger.info("✅ Variant router registered successfully")
except Exception as e:
    logger.error(f"❌ Failed to import variant router: {e}")

@app.get("/")
async def root():
    return {
        "message": "Mutation Explorer API is running",
        "endpoints": [
            "/",
            "/health",
            "/variant/{identifier}"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "routes": [r.path for r in app.routes if isinstance(r, APIRoute)]}

# Print all routes on startup
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Application startup complete")
    logger.info("📋 Available routes:")
    for route in app.routes:
        if isinstance(route, APIRoute):
            logger.info(f"  {route.path}")