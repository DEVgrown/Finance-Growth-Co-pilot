from django.core.cache import cache
from functools import wraps
import hashlib
import json

def cached_response(timeout=300, key_prefix=""):
    """
    Simple decorator to cache API responses.
    Usage: @cached_response(timeout=600, key_prefix="dashboard")
    """
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            # Build cache key from user and params
            user_id = request.user.id if hasattr(request, 'user') and request.user.is_authenticated else 'anon'
            business_id = request.query_params.get('business_id') or kwargs.get('business_id', '')
            period = request.query_params.get('period', '30')
            
            # Create unique cache key
            cache_key = f"{key_prefix}:user_{user_id}:business_{business_id}:period_{period}"
            
            # Try to get from cache
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                from rest_framework.response import Response
                return Response(cached_data)
            
            # Execute view function
            response = func(request, *args, **kwargs)
            
            # Cache successful GET responses
            if hasattr(response, 'status_code') and response.status_code == 200:
                if hasattr(response, 'data'):
                    cache.set(cache_key, response.data, timeout)
            
            return response
        return wrapper
    return decorator

def invalidate_user_cache(user_id, pattern=""):
    """Invalidate cache for a specific user"""
    # For database cache, we can't easily pattern match, so this is a helper
    # In production with Redis, this would use pattern matching
    pass

# Add this function to cache_utils.py (after line 44)

def invalidate_dashboard_cache(user_id, business_id=None):
    """
    Helper function to invalidate dashboard cache when data changes.
    Call this after creating/updating transactions, invoices, budgets, etc.
    """
    periods = ['7', '30', '90', '365']  # Common periods
    for period in periods:
        # Delete with business_id
        if business_id:
            cache_key = f"dashboard:user_{user_id}:business_{business_id}:period_{period}"
            cache.delete(cache_key)
        # Delete without business_id (all businesses view)
        cache_key_all = f"dashboard:user_{user_id}:business_:period_{period}"
        cache.delete(cache_key_all)