import requests
import json

# Test the /me endpoint to see what data is being returned
BASE_URL = "http://localhost:8000"

# First, login to get a token
login_response = requests.post(f"{BASE_URL}/api/users/login/", json={
    "username": "Jackson",
    "password": "password123"  # Replace with actual password
})

if login_response.status_code == 200:
    data = login_response.json()
    token = data.get('access')
    print("✅ Login successful!")
    print(f"Token: {token[:50]}...")
    
    # Now test the /me endpoint
    headers = {"Authorization": f"Bearer {token}"}
    me_response = requests.get(f"{BASE_URL}/api/users/me/", headers=headers)
    
    if me_response.status_code == 200:
        user_data = me_response.json()
        print("\n📋 User data from /me endpoint:")
        print(json.dumps(user_data, indent=2))
        
        # Check for is_superuser field
        if 'is_superuser' in user_data:
            print(f"\n✅ is_superuser field present: {user_data['is_superuser']}")
        else:
            print("\n❌ is_superuser field NOT present in response!")
    else:
        print(f"❌ /me endpoint failed: {me_response.status_code}")
        print(me_response.text)
else:
    print(f"❌ Login failed: {login_response.status_code}")
    print(login_response.text)
