from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

@csrf_exempt
@require_http_methods(["GET", "POST", "OPTIONS"])
def test_cors(request):
    """Test endpoint for CORS"""
    if request.method == "OPTIONS":
        response = JsonResponse({"message": "CORS preflight"})
        response["Access-Control-Allow-Origin"] = "http://localhost:5173"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response
    
    return JsonResponse({"message": "CORS test successful", "method": request.method})