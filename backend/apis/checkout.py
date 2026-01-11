"""
Checkout API Flow for ExplainX Demo
Orchestrates multiple internal functions to process an order
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from functions.validation import validate_user_type, validate_price, validate_quantity
from functions.inventory import check_stock, reserve_stock, get_product_details
from functions.pricing import calculate_base_discount, apply_volume_discount, apply_promo_code
from functions.tax import calculate_sales_tax, calculate_shipping_cost, calculate_final_total


def process_checkout(
    product_id: str,
    quantity: int,
    user_type: str,
    state: str,
    promo_code: str = "",
    express_shipping: bool = False
) -> dict:
    """
    Complete checkout flow that calls multiple @explainX decorated functions.
    
    Flow:
    1. Validate user type
    2. Get product details
    3. Check stock availability
    4. Validate quantity
    5. Reserve stock
    6. Calculate base discount
    7. Apply volume discount
    8. Apply promo code
    9. Calculate sales tax
    10. Calculate shipping
    11. Calculate final total
    """
    
    # Step 1: Validate user
    user_info = validate_user_type(user_type=user_type)
    if not user_info["valid"]:
        return {
            "success": False,
            "error": user_info.get("error", "Invalid user type"),
            "step": "user_validation"
        }
    
    # Step 2: Get product details
    product = get_product_details(product_id=product_id)
    if not product["found"]:
        return {
            "success": False,
            "error": product.get("error", "Product not found"),
            "step": "product_lookup"
        }
    
    # Step 3: Check stock
    stock_check = check_stock(product_id=product_id, requested_quantity=quantity)
    if not stock_check["available"]:
        return {
            "success": False,
            "error": stock_check.get("suggestion", "Out of stock"),
            "step": "stock_check"
        }
    
    # Step 4: Validate quantity
    quantity_validation = validate_quantity(quantity=quantity, max_stock=stock_check["current_stock"])
    approved_quantity = quantity_validation["approved"]
    
    # Step 5: Reserve stock
    reservation = reserve_stock(product_id=product_id, quantity=approved_quantity)
    if not reservation["success"]:
        return {
            "success": False,
            "error": reservation.get("error", "Could not reserve stock"),
            "step": "reservation"
        }
    
    # Step 6: Calculate base discount (user tier)
    unit_price = product["price"]
    base_discount = calculate_base_discount(price=unit_price, user_tier=user_info["tier"])
    discounted_unit_price = base_discount["discounted_price"]
    
    # Step 7: Apply volume discount
    volume_result = apply_volume_discount(price=discounted_unit_price, quantity=approved_quantity)
    subtotal = volume_result["subtotal_after_discount"]
    
    # Step 8: Apply promo code (if provided)
    if promo_code:
        promo_result = apply_promo_code(price=subtotal, promo_code=promo_code)
        subtotal = promo_result["final_price"]
        promo_applied = promo_result["valid"]
    else:
        promo_result = None
        promo_applied = False
    
    # Step 9: Calculate sales tax
    tax_result = calculate_sales_tax(amount=subtotal, state=state)
    
    # Step 10: Calculate shipping
    total_weight = reservation["total_weight_kg"]
    shipping_result = calculate_shipping_cost(
        subtotal=subtotal, 
        weight_kg=total_weight, 
        express=express_shipping
    )
    
    # Step 11: Calculate final total
    final_result = calculate_final_total(
        subtotal=subtotal,
        tax_amount=tax_result["tax_amount"],
        shipping_cost=shipping_result["shipping_cost"]
    )
    
    # Build response
    return {
        "success": True,
        "order_summary": {
            "reservation_id": reservation["reservation_id"],
            "product": {
                "id": product_id,
                "name": product["name"],
                "unit_price": unit_price,
                "quantity": approved_quantity
            },
            "customer": {
                "type": user_info["user_type"],
                "tier": user_info["tier"],
                "state": state
            },
            "pricing": {
                "original_subtotal": round(unit_price * approved_quantity, 2),
                "tier_discount": base_discount["discount_amount"] * approved_quantity,
                "volume_discount": volume_result["volume_discount"],
                "promo_discount": promo_result["discount_applied"] if promo_result else 0,
                "subtotal": subtotal,
                "tax": tax_result["tax_amount"],
                "tax_rate": tax_result["tax_rate_percent"],
                "shipping": shipping_result["shipping_cost"],
                "shipping_type": shipping_result.get("shipping_type", "Free"),
                "grand_total": final_result["grand_total"]
            },
            "promo_applied": promo_applied,
            "free_shipping": shipping_result["free_shipping"]
        }
    }


def simple_checkout(price: int, user_type: str) -> dict:
    """
    Simplified checkout for basic demo.
    Just applies user discount and tax.
    """
    # Validate user
    user_info = validate_user_type(user_type=user_type)
    
    # Validate price
    price_validation = validate_price(price=price)
    validated_price = price_validation.get("adjusted_price", price)
    
    # Apply discount
    discount_result = calculate_base_discount(price=validated_price, user_tier=user_info["tier"])
    
    # Apply tax (default state)
    tax_result = calculate_sales_tax(amount=discount_result["discounted_price"], state="DEFAULT")
    
    return {
        "success": True,
        "original_price": price,
        "user_type": user_info["user_type"],
        "discount_applied": discount_result["discount_amount"],
        "subtotal": discount_result["discounted_price"],
        "tax": tax_result["tax_amount"],
        "final_total": tax_result["total_with_tax"]
    }
