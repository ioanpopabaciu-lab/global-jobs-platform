import requests
from pymongo import MongoClient

# Fetch a valid token
client = MongoClient("mongodb://localhost:27017")
db = client["testdb"]
session = db.user_sessions.find_one({})
if session:
    token = session.get("session_token")
    print(f"Got token: {token}")
    
    files = {"file": ("test.jpg", b"123", "image/jpeg")}
    data = {"document_type": "passport"}
    headers = {"Authorization": f"Bearer {token}"}
    
    r = requests.post("http://localhost:8000/api/portal/candidate/documents/upload", files=files, data=data, headers=headers)
    print(f"Status Code: {r.status_code}")
    print(f"Response: {r.text}")
else:
    print("No active session found in DB")
