"""
ExplainX - FastAPI Main Application
Provides Swagger-compatible API with automatic trace explanation
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import asyncio

from explainx import pop_traces, clear_traces
from llm import explain_traces, build_explain_file, explain_traces_sync
from apis.checkout import process_checkout, simple_checkout
from functions.resume import process_applications, generate_applications, parse_candidate_file


# FastAPI App
app = FastAPI(
    title="ExplainX API",
    description="""
    **ExplainX** - Understand what your API actually does!
    
    Every API call returns:
    - The actual response
    - A detailed explanation of every function that ran
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class SimpleCheckoutRequest(BaseModel):
    """Simple checkout with just price and user type"""
    price: float = Field(..., description="Product price", ge=0, example=100)
    user_type: str = Field(..., description="User type: premium, standard, or guest", example="premium")


class FullCheckoutRequest(BaseModel):
    """Full checkout with all options"""
    product_id: str = Field(..., description="Product ID from inventory", example="LAPTOP-001")
    quantity: int = Field(..., description="Number of items to purchase", ge=1, example=2)
    user_type: str = Field(..., description="User type: premium, standard, or guest", example="premium")
    state: str = Field(..., description="US state code for tax calculation", example="CA")
    promo_code: Optional[str] = Field("", description="Optional promo code", example="SAVE10")
    express_shipping: bool = Field(False, description="Use express shipping?")


class ExplainXResponse(BaseModel):
    """Standard response with explainX data"""
    result: Dict[str, Any]
    traces: List[Dict[str, Any]]
    explain_text: str


class TraceItem(BaseModel):
    """Individual trace item"""
    function: str
    file: str
    inputs: Dict[str, Any]
    output: Any
    explanation: str


# API Endpoints
@app.post("/checkout/simple", response_model=ExplainXResponse, tags=["Checkout"])
async def run_simple_checkout(payload: SimpleCheckoutRequest):
    """
    🛒 **Simple Checkout**
    
    Basic checkout flow with:
    - User type validation
    - Price validation  
    - Tier-based discount
    - Tax calculation
    
    Perfect for understanding ExplainX basics.
    """
    # Clear any previous traces
    clear_traces()
    
    # Run the checkout
    result = simple_checkout(
        price=payload.price,
        user_type=payload.user_type
    )
    
    # Get traces
    traces = pop_traces()
    
    # Generate explanations (async)
    try:
        explained_traces = await explain_traces(traces)
    except Exception:
        explained_traces = explain_traces_sync(traces)
    
    # Build explain file
    explain_text = build_explain_file(explained_traces)
    
    return ExplainXResponse(
        result=result,
        traces=explained_traces,
        explain_text=explain_text
    )


@app.post("/checkout/full", response_model=ExplainXResponse, tags=["Checkout"])
async def run_full_checkout(payload: FullCheckoutRequest):
    """
    🛍️ **Full Checkout**
    
    Complete e-commerce checkout with:
    - User validation
    - Product lookup
    - Stock checking
    - Stock reservation
    - Tier discounts
    - Volume discounts
    - Promo codes
    - State-based tax
    - Shipping calculation
    
    Shows the full power of ExplainX tracing!
    """
    # Clear any previous traces
    clear_traces()
    
    # Run the checkout
    result = process_checkout(
        product_id=payload.product_id,
        quantity=payload.quantity,
        user_type=payload.user_type,
        state=payload.state,
        promo_code=payload.promo_code or "",
        express_shipping=payload.express_shipping
    )
    
    # Get traces
    traces = pop_traces()
    
    # Generate explanations
    try:
        explained_traces = await explain_traces(traces)
    except Exception:
        explained_traces = explain_traces_sync(traces)
    
    # Build explain file
    explain_text = build_explain_file(explained_traces)
    
    return ExplainXResponse(
        result=result,
        traces=explained_traces,
        explain_text=explain_text
    )


@app.get("/products", tags=["Products"])
async def list_products():
    """
    📦 **List Available Products**
    
    Returns all products in inventory for testing checkout.
    """
    from functions.inventory import INVENTORY
    
    return {
        "products": [
            {
                "id": pid,
                "name": info["name"],
                "price": info["price"],
                "stock": info["stock"]
            }
            for pid, info in INVENTORY.items()
        ]
    }


@app.get("/promo-codes", tags=["Products"])
async def list_promo_codes():
    """
    🎟️ **List Available Promo Codes**
    
    Test codes for checkout.
    """
    return {
        "codes": [
            {"code": "SAVE10", "description": "10% off any order"},
            {"code": "SAVE20", "description": "20% off orders $50+"},
            {"code": "FLAT50", "description": "$50 off orders $100+"},
            {"code": "FREESHIP", "description": "Free shipping bonus"}
        ]
    }


@app.get("/user-types", tags=["Products"])
async def list_user_types():
    """
    👤 **List User Types**
    
    Available user types for testing.
    """
    return {
        "types": [
            {"type": "premium", "tier": 3, "discount": "20%"},
            {"type": "standard", "tier": 2, "discount": "10%"},
            {"type": "guest", "tier": 1, "discount": "0%"}
        ]
    }


@app.get("/states", tags=["Products"])
async def list_states():
    """
    🗺️ **List States with Tax Rates**
    
    US states for tax calculation.
    """
    from functions.tax import TAX_RATES
    
    return {
        "states": [
            {"code": code, "tax_rate": f"{rate * 100:.2f}%"}
            for code, rate in TAX_RATES.items()
            if code != "DEFAULT"
        ]
    }


@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "explainx-api"}


# ... (previous code)

class ChatRequest(BaseModel):
    """Request to chat about a report"""
    report_text: str
    query: str


@app.post("/chat", tags=["Chat"])
async def chat_with_report(payload: ChatRequest):
    """
    💬 **Chat about the Report**
    
    Ask questions about the execution report.
    """
    from llm import chat_about_report
    
    response = await chat_about_report(payload.report_text, payload.query)
    
    return {"response": response}
    




@app.post("/resume/select", response_model=ExplainXResponse, tags=["Resume"])
async def run_resume_selection(
    domain: str = Form(..., description="Target domain (backend, frontend, etc)"),
    min_experience: float = Form(..., description="Minimum years of experience"),
    salary_budget: float = Form(..., description="Maximum budget for the role"),
    file: UploadFile = File(..., description="JSON/Text file with candidate data")
):
    """
    📄 **Resume Selection Pipeline**
    
    Processes applications to find the top candidates.
    
    - **Upload Mode**: Provide a file with candidate data to process those specific users.
    - **Simulation Mode**: Omit the file to generate 5000 mock applications.
    
    Pipeline stages:
    1. **Validation**: Check email and verification status
    2. **Experience**: Filter min experience, score bonus
    3. **Domain**: Match job domain
    4. **Salary**: Check alignment with budget (penalize if too high)
    5. **CGPA**: academic score
    """
    # Clear previous traces
    clear_traces()
    
    # 1. Get Data (File or Mock)
    if file and file.filename:
        content = await file.read()
        applications = parse_candidate_file(content.decode("utf-8"))
        source_msg = f"Processed {len(applications)} candidates from uploaded file"
    else:
        applications = generate_applications(100)
        source_msg = "Generated 100 mock applications"
    
    # Define JD (from Form data)
    jd = {
        "domain": domain,
        "min_experience": min_experience,
        "salary_budget": salary_budget
    }
    
    # 2. Run Pipeline
    top_candidates = process_applications(applications, jd)
    
    # 3. Get Traces
    traces = pop_traces()
    
    # 4. Generate Explanations
    try:
        explained_traces = await explain_traces(traces)
    except Exception:
        explained_traces = explain_traces_sync(traces)
        
    # 5. Build Report
    explain_text = build_explain_file(explained_traces)
    
    # Prepend source info to explain text
    explain_text = f"SOURCE: {source_msg}\n\n{explain_text}"
    
    return ExplainXResponse(
        result={
            "top_candidates": top_candidates, 
            "total_processed": len(applications),
            "source": "upload" if file else "simulation"
        },
        traces=explained_traces,
        explain_text=explain_text
    )


# ... (previous code)


# Run with: uvicorn main:app --reload --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
