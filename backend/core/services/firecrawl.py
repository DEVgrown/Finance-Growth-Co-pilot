# backend/core/services/firecrawl.py
import os
import requests
from typing import Tuple, Dict, Any

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