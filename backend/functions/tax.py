"""
Tax Functions for ExplainX Demo
Contains tax calculation logic with @explainX decorator
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from explainx import explainX


# Tax rates by state/region
TAX_RATES = {
    "CA": 0.0725,   # California
    "NY": 0.08,     # New York
    "TX": 0.0625,   # Texas
    "FL": 0.06,     # Florida
    "WA": 0.065,    # Washington
    "OR": 0.0,      # Oregon (no sales tax)
    "DEFAULT": 0.07
}


@explainX()
def calculate_sales_tax(amount: float, state: str) -> dict:
    """
    Calculate sales tax based on state.
    
    Uses state-specific tax rates.
    Falls back to default rate (7%) for unknown states.
    """
    state_upper = state.upper().strip() if state else "DEFAULT"
    tax_rate = TAX_RATES.get(state_upper, TAX_RATES["DEFAULT"])
    
    tax_amount = amount * tax_rate
    
    return {
        "subtotal": round(amount, 2),
        "state": state_upper,
        "tax_rate": tax_rate,
        "tax_rate_percent": f"{tax_rate * 100:.2f}%",
        "tax_amount": round(tax_amount, 2),
        "total_with_tax": round(amount + tax_amount, 2)
    }


@explainX()
def calculate_shipping_cost(subtotal: float, weight_kg: float, express: bool = False) -> dict:
    """
    Calculate shipping cost based on order value and weight.
    
    Rules:
    - Free shipping for orders over $100
    - Base rate: $5 + $1 per kg
    - Express shipping: 2x base rate
    """
    # Free shipping threshold
    if subtotal >= 100:
        return {
            "subtotal": round(subtotal, 2),
            "weight_kg": weight_kg,
            "express": express,
            "free_shipping": True,
            "shipping_cost": 0.0,
            "reason": "Free shipping for orders over $100"
        }
    
    # Calculate base shipping
    base_cost = 5.0 + (weight_kg * 1.0)
    
    # Apply express multiplier
    if express:
        shipping_cost = base_cost * 2
        shipping_type = "Express (2-day)"
    else:
        shipping_cost = base_cost
        shipping_type = "Standard (5-7 days)"
    
    return {
        "subtotal": round(subtotal, 2),
        "weight_kg": weight_kg,
        "express": express,
        "free_shipping": False,
        "shipping_type": shipping_type,
        "base_cost": round(base_cost, 2),
        "shipping_cost": round(shipping_cost, 2)
    }


@explainX()
def calculate_final_total(subtotal: float, tax_amount: float, shipping_cost: float, 
                          tip_percent: float = 0) -> dict:
    """
    Calculate final order total with all charges.
    
    Combines subtotal, tax, shipping, and optional tip.
    """
    tip_amount = subtotal * (tip_percent / 100) if tip_percent > 0 else 0
    
    total = subtotal + tax_amount + shipping_cost + tip_amount
    
    return {
        "subtotal": round(subtotal, 2),
        "tax": round(tax_amount, 2),
        "shipping": round(shipping_cost, 2),
        "tip_percent": tip_percent,
        "tip_amount": round(tip_amount, 2),
        "grand_total": round(total, 2),
        "breakdown": {
            "products": round(subtotal, 2),
            "tax": round(tax_amount, 2),
            "shipping": round(shipping_cost, 2),
            "tip": round(tip_amount, 2)
        }
    }
