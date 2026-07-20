
# # app/routes/variant.py
# from fastapi import APIRouter, HTTPException
# from app.services.variant_service import VariantPipeline
# from app.models.variant_model import VariantResponse

# router = APIRouter()

# @router.get("/variant/{identifier}", response_model=VariantResponse)
# async def analyze_variant(identifier: str):
#     """
#     Analyze a genomic variant and return interpretation.
#     """
#     if not identifier or not identifier.strip():
#         raise HTTPException(status_code=400, detail="Variant identifier cannot be empty")
    
#     try:
#         result = await VariantPipeline.run_pipeline(identifier)
#         return result
#     except Exception as e:
#         print(f"[Route Error] {e}")
#         raise HTTPException(status_code=500, detail=f"Error processing variant: {str(e)}")

# app/routes/variant.py
from fastapi import APIRouter, HTTPException
from app.services.variant_service import VariantPipeline
from app.models.variant_model import VariantResponse

router = APIRouter()

@router.get("/variant/{identifier}", response_model=VariantResponse)
async def analyze_variant(identifier: str):
    """
    Analyze a genomic variant and return interpretation.
    """
    if not identifier or not identifier.strip():
        raise HTTPException(status_code=400, detail="Variant identifier cannot be empty")
    
    try:
        result = await VariantPipeline.run_pipeline(identifier)
        return result
    except Exception as e:
        print(f"[Route Error] {e}")
        raise HTTPException(status_code=500, detail=f"Error processing variant: {str(e)}")