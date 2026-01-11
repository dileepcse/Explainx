"""
Pricing Functions for ExplainX Demo
Contains discount and pricing logic with @explainX decorator
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from explainx import explainX


@explainX()
def calculate_base_discount(price: float, user_tier: int) -> dict:
    """
    Calculate base discount based on user tier.
    
    Tier discounts:
    - Tier 3 (Premium): 20% off
    - Tier 2 (Standard): 10% off
    - Tier 1 (Guest): 0% off
    """
    discount_rates = {
        3: 0.20,  # Premium
        2: 0.10,  # Standard
        1: 0.00,  # Guest
        0: 0.00   # Invalid
    }
    
    discount_rate = discount_rates.get(user_tier, 0)
    discount_amount = price * discount_rate
    
    return {
        "original_price": price,
        "discount_rate": discount_rate,
        "discount_amount": round(discount_amount, 2),
        "discounted_price": round(price - discount_amount, 2)
    }


@explainX()
def apply_volume_discount(price: float, quantity: int) -> dict:
    """
    Apply volume-based discount.
    
    Volume discounts:
    - 10+ items: 5% off
    - 25+ items: 10% off
    - 50+ items: 15% off
    - 100+ items: 20% off
    """
    if quantity >= 100:
        discount_rate = 0.20
        tier_name = "Bulk (100+)"
    elif quantity >= 50:
        discount_rate = 0.15
        tier_name = "Large (50+)"
    elif quantity >= 25:
        discount_rate = 0.10
        tier_name = "Medium (25+)"
    elif quantity >= 10:
        discount_rate = 0.05
        tier_name = "Small (10+)"
    else:
        discount_rate = 0.00
        tier_name = "No volume discount"
    
    total_before = price * quantity
    discount_amount = total_before * discount_rate
    
    return {
        "unit_price": price,
        "quantity": quantity,
        "volume_tier": tier_name,
        "discount_rate": discount_rate,
        "subtotal_before_discount": round(total_before, 2),
        "volume_discount": round(discount_amount, 2),
        "subtotal_after_discount": round(total_before - discount_amount, 2)
    }


@explainX()
def apply_promo_code(price: float, promo_code: str) -> dict:
    """
    Apply promotional code discount.
    
    Valid codes:
    - SAVE10: 10% off
    - SAVE20: 20% off
    - FLAT50: $50 off (min purchase $100)
    - FREESHIP: Free shipping bonus
    """
    promo_codes = {
        "SAVE10": {"type": "percent", "value": 0.10, "min_purchase": 0},
        "SAVE20": {"type": "percent", "value": 0.20, "min_purchase": 50},
        "FLAT50": {"type": "fixed", "value": 50, "min_purchase": 100},
        "FREESHIP": {"type": "bonus", "value": "free_shipping", "min_purchase": 0}
    }
    
    code_upper = promo_code.upper().strip() if promo_code else ""
    
    if code_upper not in promo_codes:
        return {
            "original_price": price,
            "promo_code": promo_code,
            "valid": False,
            "error": "Invalid promo code",
            "final_price": price,
            "discount_applied": 0
        }
    
    promo = promo_codes[code_upper]
    
    if price < promo["min_purchase"]:
        return {
            "original_price": price,
            "promo_code": code_upper,
            "valid": False,
            "error": f"Minimum purchase of ${promo['min_purchase']} required",
            "final_price": price,
            "discount_applied": 0
        }
    
    if promo["type"] == "percent":
        discount = price * promo["value"]
        final = price - discount
    elif promo["type"] == "fixed":
        discount = min(promo["value"], price)  # Can't go negative
        final = price - discount
    else:  # bonus type
        discount = 0
        final = price
    
    return {
        "original_price": price,
        "promo_code": code_upper,
        "valid": True,
        "promo_type": promo["type"],
        "discount_applied": round(discount, 2),
        "final_price": round(final, 2),
        "bonus": promo["value"] if promo["type"] == "bonus" else None
    }
