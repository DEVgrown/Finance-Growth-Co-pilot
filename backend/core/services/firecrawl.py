# backend/core/services/firecrawl.py
import os
import requests
from typing import Tuple, Dict, Any, List
import json

FIRECRAWL_API_KEY = os.getenv('FIRECRAWL_API_KEY', '')

def classify_business_from_website(website: str) -> Tuple[str, float, Dict[str, Any]]:
    """
    Call Firecrawl (or similar web intelligence API) to classify a business by website.
    Returns (category, confidence, tags_dict).
    """
    if not FIRECRAWL_API_KEY or not website:
        return ("unknown", 0.0, {"reason": "missing_api_key_or_website"})

    # Example placeholder call; replace with actual Firecrawl endpoint/contract.
    try:
        resp = requests.post(
            'https://api.firecrawl.dev/v1/classify',
            headers={'Authorization': f'Bearer {FIRECRAWL_API_KEY}', 'Content-Type': 'application/json'},
            json={'url': website, 'tasks': ['industry', 'tags', 'summary']}
        )
        resp.raise_for_status()
        data = resp.json()
        category = data.get('industry', 'unknown')
        confidence = float(data.get('confidence', 0.0))
        tags = data.get('tags', {})
        return (category, confidence, tags)
    except Exception as e:
        return ("unknown", 0.0, {"error": str(e)})


def get_market_intelligence(industry: str, location: str = "Kenya") -> Dict[str, Any]:
    """
    Get market intelligence data for a specific industry and location.
    """
    if not FIRECRAWL_API_KEY:
        return {"error": "Firecrawl API key not configured"}
    
    try:
        # Search for industry-specific market data
        search_query = f"{industry} market trends {location} 2024"
        
        # Use Firecrawl to search and analyze market data
        resp = requests.post(
            'https://api.firecrawl.dev/v1/search',
            headers={'Authorization': f'Bearer {FIRECRAWL_API_KEY}', 'Content-Type': 'application/json'},
            json={
                'query': search_query,
                'limit': 10,
                'extract': {
                    'schema': {
                        'type': 'object',
                        'properties': {
                            'market_size': {'type': 'string'},
                            'growth_rate': {'type': 'string'},
                            'key_trends': {'type': 'array', 'items': {'type': 'string'}},
                            'competitors': {'type': 'array', 'items': {'type': 'string'}},
                            'opportunities': {'type': 'array', 'items': {'type': 'string'}}
                        }
                    }
                }
            }
        )
        resp.raise_for_status()
        data = resp.json()
        
        return {
            'market_data': data.get('data', []),
            'extracted_info': data.get('extracted', {}),
            'search_query': search_query
        }
    except Exception as e:
        return {"error": f"Market intelligence failed: {str(e)}"}


def analyze_supplier_pricing(supplier_name: str, product_category: str) -> Dict[str, Any]:
    """
    Analyze supplier pricing and market rates for negotiation insights.
    """
    if not FIRECRAWL_API_KEY:
        return {"error": "Firecrawl API key not configured"}
    
    try:
        # Search for supplier and pricing information
        search_query = f"{supplier_name} {product_category} pricing Kenya"
        
        resp = requests.post(
            'https://api.firecrawl.dev/v1/search',
            headers={'Authorization': f'Bearer {FIRECRAWL_API_KEY}', 'Content-Type': 'application/json'},
            json={
                'query': search_query,
                'limit': 5,
                'extract': {
                    'schema': {
                        'type': 'object',
                        'properties': {
                            'pricing_info': {'type': 'array', 'items': {'type': 'string'}},
                            'market_rates': {'type': 'array', 'items': {'type': 'string'}},
                            'negotiation_tips': {'type': 'array', 'items': {'type': 'string'}},
                            'alternative_suppliers': {'type': 'array', 'items': {'type': 'string'}}
                        }
                    }
                }
            }
        )
        resp.raise_for_status()
        data = resp.json()
        
        return {
            'supplier_analysis': data.get('data', []),
            'pricing_insights': data.get('extracted', {}),
            'search_query': search_query
        }
    except Exception as e:
        return {"error": f"Supplier analysis failed: {str(e)}"}


def get_competitor_analysis(business_name: str, industry: str) -> Dict[str, Any]:
    """
    Get competitor analysis and benchmarking data.
    """
    if not FIRECRAWL_API_KEY:
        return {"error": "Firecrawl API key not configured"}
    
    try:
        # Search for competitors and industry benchmarks
        search_query = f"{industry} competitors Kenya market share pricing"
        
        resp = requests.post(
            'https://api.firecrawl.dev/v1/search',
            headers={'Authorization': f'Bearer {FIRECRAWL_API_KEY}', 'Content-Type': 'application/json'},
            json={
                'query': search_query,
                'limit': 8,
                'extract': {
                    'schema': {
                        'type': 'object',
                        'properties': {
                            'competitors': {'type': 'array', 'items': {'type': 'string'}},
                            'market_share': {'type': 'array', 'items': {'type': 'string'}},
                            'pricing_benchmarks': {'type': 'array', 'items': {'type': 'string'}},
                            'competitive_advantages': {'type': 'array', 'items': {'type': 'string'}}
                        }
                    }
                }
            }
        )
        resp.raise_for_status()
        data = resp.json()
        
        return {
            'competitor_data': data.get('data', []),
            'benchmark_insights': data.get('extracted', {}),
            'search_query': search_query
        }
    except Exception as e:
        return {"error": f"Competitor analysis failed: {str(e)}"}


def get_regulatory_updates(industry: str, location: str = "Kenya") -> Dict[str, Any]:
    """
    Get regulatory updates and compliance information for the industry.
    """
    if not FIRECRAWL_API_KEY:
        return {"error": "Firecrawl API key not configured"}
    
    try:
        # Search for regulatory updates
        search_query = f"{industry} regulations {location} 2024 compliance updates"
        
        resp = requests.post(
            'https://api.firecrawl.dev/v1/search',
            headers={'Authorization': f'Bearer {FIRECRAWL_API_KEY}', 'Content-Type': 'application/json'},
            json={
                'query': search_query,
                'limit': 5,
                'extract': {
                    'schema': {
                        'type': 'object',
                        'properties': {
                            'regulatory_updates': {'type': 'array', 'items': {'type': 'string'}},
                            'compliance_requirements': {'type': 'array', 'items': {'type': 'string'}},
                            'deadlines': {'type': 'array', 'items': {'type': 'string'}},
                            'penalties': {'type': 'array', 'items': {'type': 'string'}}
                        }
                    }
                }
            }
        )
        resp.raise_for_status()
        data = resp.json()
        
        return {
            'regulatory_data': data.get('data', []),
            'compliance_info': data.get('extracted', {}),
            'search_query': search_query
        }
    except Exception as e:
        return {"error": f"Regulatory analysis failed: {str(e)}"}


def get_financial_benchmarks(industry: str, business_size: str) -> Dict[str, Any]:
    """
    Get financial benchmarks and KPIs for the industry and business size.
    """
    if not FIRECRAWL_API_KEY:
        return {"error": "Firecrawl API key not configured"}
    
    try:
        # Search for financial benchmarks
        search_query = f"{industry} {business_size} financial benchmarks KPIs Kenya"
        
        resp = requests.post(
            'https://api.firecrawl.dev/v1/search',
            headers={'Authorization': f'Bearer {FIRECRAWL_API_KEY}', 'Content-Type': 'application/json'},
            json={
                'query': search_query,
                'limit': 5,
                'extract': {
                    'schema': {
                        'type': 'object',
                        'properties': {
                            'financial_benchmarks': {'type': 'array', 'items': {'type': 'string'}},
                            'kpis': {'type': 'array', 'items': {'type': 'string'}},
                            'industry_averages': {'type': 'array', 'items': {'type': 'string'}},
                            'performance_metrics': {'type': 'array', 'items': {'type': 'string'}}
                        }
                    }
                }
            }
        )
        resp.raise_for_status()
        data = resp.json()
        
        return {
            'benchmark_data': data.get('data', []),
            'financial_insights': data.get('extracted', {}),
            'search_query': search_query
        }
    except Exception as e:
        return {"error": f"Financial benchmark analysis failed: {str(e)}"}


def get_growth_opportunities(business_profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Get growth opportunities and market expansion insights.
    """
    if not FIRECRAWL_API_KEY:
        return {"error": "Firecrawl API key not configured"}
    
    try:
        industry = business_profile.get('industry', '')
        location = business_profile.get('location', 'Kenya')
        business_size = business_profile.get('size', 'SME')
        
        # Search for growth opportunities
        search_query = f"{industry} growth opportunities {location} {business_size} expansion"
        
        resp = requests.post(
            'https://api.firecrawl.dev/v1/search',
            headers={'Authorization': f'Bearer {FIRECRAWL_API_KEY}', 'Content-Type': 'application/json'},
            json={
                'query': search_query,
                'limit': 6,
                'extract': {
                    'schema': {
                        'type': 'object',
                        'properties': {
                            'growth_opportunities': {'type': 'array', 'items': {'type': 'string'}},
                            'market_expansion': {'type': 'array', 'items': {'type': 'string'}},
                            'new_markets': {'type': 'array', 'items': {'type': 'string'}},
                            'partnership_opportunities': {'type': 'array', 'items': {'type': 'string'}}
                        }
                    }
                }
            }
        )
        resp.raise_for_status()
        data = resp.json()
        
        return {
            'growth_data': data.get('data', []),
            'opportunity_insights': data.get('extracted', {}),
            'search_query': search_query
        }
    except Exception as e:
        return {"error": f"Growth opportunity analysis failed: {str(e)}"}