"""
ExplainX - Core decorator and trace management system
Automatically captures function execution details for LLM explanation
"""

import inspect
import functools
from typing import Any, Dict, List
from datetime import datetime

# Global trace storage
TRACE: List[Dict[str, Any]] = []


def explainX():
    """
    Decorator that automatically captures:
    - Function name
    - File location
    - Input arguments
    - Output result
    - Source code
    - Execution timestamp
    """
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            # Capture start time
            start_time = datetime.now()
            
            # Get function signature to map positional args to names
            sig = inspect.signature(fn)
            params = list(sig.parameters.keys())
            
            # Build complete inputs dict
            inputs = {}
            for i, arg in enumerate(args):
                if i < len(params):
                    inputs[params[i]] = arg
            inputs.update(kwargs)
            
            # Execute the function
            result = fn(*args, **kwargs)
            
            # Capture end time
            end_time = datetime.now()
            
            # Get source code safely
            try:
                source_code = inspect.getsource(fn)
            except Exception:
                source_code = "Source code not available"
            
            # Append trace
            TRACE.append({
                "function": fn.__name__,
                "file": inspect.getfile(fn),
                "inputs": inputs,
                "output": result,
                "code": source_code,
                "start_time": start_time.isoformat(),
                "end_time": end_time.isoformat(),
                "duration_ms": (end_time - start_time).total_seconds() * 1000,
                "explanation": None
            })
            
            return result
        return wrapper
    return decorator


def pop_traces() -> List[Dict[str, Any]]:
    """
    Pop all traces and reset the global store.
    Returns the list of captured traces.
    """
    global TRACE
    traces = TRACE.copy()
    TRACE = []
    return traces


def clear_traces() -> None:
    """Clear all traces without returning them."""
    global TRACE
    TRACE = []


def get_traces() -> List[Dict[str, Any]]:
    """Get current traces without clearing them."""
    return TRACE.copy()
