"""
Validation Functions for ExplainX Demo
Contains input validation logic with @explainX decorator
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from explainx import explainX


@explainX()
def validate_user_type(user_type: str) -> dict:
    """
    Validate user type and return user tier information.
    
    Valid types: 'premium', 'standard', 'guest'
    Returns tier info with discount eligibility.
    """
    valid_types = {
        "premium": {"tier": 3, "discount_eligible": True, "max_discount": 0.25},
        "standard": {"tier": 2, "discount_eligible": True, "max_discount": 0.10},
        "guest": {"tier": 1, "discount_eligible": False, "max_discount": 0.0}
    }
    
    user_type_lower = user_type.lower().strip()
    
    if user_type_lower in valid_types:
        return {
            "valid": True,
            "user_type": user_type_lower,
            **valid_types[user_type_lower]
        }
    
    return {
        "valid": False,
        "user_type": user_type_lower,
        "tier": 0,
        "discount_eligible": False,
        "max_discount": 0.0,
        "error": f"Invalid user type: {user_type}"
    }


@explainX()
def validate_price(price: float) -> dict:
    """
    Validate price input and apply business rules.
    
    Rules:
    - Price must be positive
    - Price must be less than 1,000,000
    - Minimum order value: 10
    """
    if not isinstance(price, (int, float)):
        return {
            "valid": False,
            "original_price": price,
            "error": "Price must be a number"
        }
    
    if price <= 0:
        return {
            "valid": False,
            "original_price": price,
            "error": "Price must be positive"
        }
    
    if price > 1000000:
        return {
            "valid": False,
            "original_price": price,
            "error": "Price exceeds maximum allowed (1,000,000)"
        }
    
    if price < 10:
        return {
            "valid": True,
            "original_price": price,
            "adjusted_price": 10,
            "warning": "Minimum order value applied (10)"
        }
    
    return {
        "valid": True,
        "original_price": price,
        "adjusted_price": price
    }


@explainX()
def validate_quantity(quantity: int, max_stock: int = 100) -> dict:
    """
    Validate order quantity against available stock.
    
    Returns validation result with available quantity.
    """
    if not isinstance(quantity, int) or quantity <= 0:
        return {
            "valid": False,
            "requested": quantity,
            "error": "Quantity must be a positive integer"
        }
    
    if quantity > max_stock:
        return {
            "valid": True,
            "requested": quantity,
            "approved": max_stock,
            "warning": f"Only {max_stock} items available, quantity adjusted"
        }
    
    return {
        "valid": True,
        "requested": quantity,
        "approved": quantity
    }
