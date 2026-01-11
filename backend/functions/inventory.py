"""
Inventory Functions for ExplainX Demo
Contains stock checking and inventory management with @explainX decorator
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from explainx import explainX

# Simulated inventory database
INVENTORY = {
    "LAPTOP-001": {"name": "Pro Laptop 15\"", "stock": 25, "price": 1299.99, "weight_kg": 2.1},
    "PHONE-001": {"name": "Smart Phone X", "stock": 150, "price": 899.99, "weight_kg": 0.2},
    "HEADPHONES-001": {"name": "Wireless Headphones", "stock": 75, "price": 249.99, "weight_kg": 0.3},
    "TABLET-001": {"name": "Pro Tablet 12\"", "stock": 40, "price": 799.99, "weight_kg": 0.6},
    "WATCH-001": {"name": "Smart Watch Pro", "stock": 200, "price": 399.99, "weight_kg": 0.1}
}


@explainX()
def check_stock(product_id: str, requested_quantity: int) -> dict:
    """
    Check if requested quantity is available in stock.
    
    Returns availability status and stock information.
    """
    product_id_upper = product_id.upper().strip()
    
    if product_id_upper not in INVENTORY:
        return {
            "product_id": product_id_upper,
            "found": False,
            "available": False,
            "error": "Product not found in inventory"
        }
    
    product = INVENTORY[product_id_upper]
    current_stock = product["stock"]
    
    if requested_quantity <= current_stock:
        return {
            "product_id": product_id_upper,
            "product_name": product["name"],
            "found": True,
            "available": True,
            "requested": requested_quantity,
            "current_stock": current_stock,
            "remaining_after": current_stock - requested_quantity,
            "unit_price": product["price"],
            "weight_kg": product["weight_kg"]
        }
    else:
        return {
            "product_id": product_id_upper,
            "product_name": product["name"],
            "found": True,
            "available": False,
            "requested": requested_quantity,
            "current_stock": current_stock,
            "shortage": requested_quantity - current_stock,
            "suggestion": f"Maximum available: {current_stock} units"
        }


@explainX()
def reserve_stock(product_id: str, quantity: int) -> dict:
    """
    Reserve stock for an order (simulated).
    
    In real system, this would lock inventory.
    """
    product_id_upper = product_id.upper().strip()
    
    if product_id_upper not in INVENTORY:
        return {
            "success": False,
            "product_id": product_id_upper,
            "error": "Product not found"
        }
    
    product = INVENTORY[product_id_upper]
    
    if quantity > product["stock"]:
        return {
            "success": False,
            "product_id": product_id_upper,
            "product_name": product["name"],
            "requested": quantity,
            "available": product["stock"],
            "error": "Insufficient stock"
        }
    
    # Simulate reservation
    reservation_id = f"RES-{product_id_upper}-{quantity}"
    
    return {
        "success": True,
        "reservation_id": reservation_id,
        "product_id": product_id_upper,
        "product_name": product["name"],
        "quantity_reserved": quantity,
        "unit_price": product["price"],
        "total_weight_kg": product["weight_kg"] * quantity,
        "line_total": round(product["price"] * quantity, 2),
        "expiry_minutes": 15
    }


@explainX()
def get_product_details(product_id: str) -> dict:
    """
    Get full product details including pricing and weight.
    """
    product_id_upper = product_id.upper().strip()
    
    if product_id_upper not in INVENTORY:
        return {
            "found": False,
            "product_id": product_id_upper,
            "error": "Product not found"
        }
    
    product = INVENTORY[product_id_upper]
    
    return {
        "found": True,
        "product_id": product_id_upper,
        "name": product["name"],
        "price": product["price"],
        "stock": product["stock"],
        "weight_kg": product["weight_kg"],
        "in_stock": product["stock"] > 0
    }
