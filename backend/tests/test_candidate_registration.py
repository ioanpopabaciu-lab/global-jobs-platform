"""
Test suite for Candidate Registration with OCR feature
Tests the new 7-step candidate registration flow endpoints
"""
import pytest
import requests
import os
import base64
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCandidateRegistrationEndpoints:
    """Test candidate registration OCR and profile endpoints"""
    
    def test_passport_ocr_endpoint_exists(self):
        """Test POST /api/auth/candidate/ocr/passport endpoint exists"""
        # Send minimal request to check endpoint exists
        response = requests.post(
            f"{BASE_URL}/api/auth/candidate/ocr/passport",
            json={
                "image_base64": "invalid_base64",
                "mime_type": "image/jpeg"
            },
            headers={"Content-Type": "application/json"}
        )
        # Should not return 404 - endpoint exists
        assert response.status_code != 404, f"Passport OCR endpoint not found. Status: {response.status_code}"
        print(f"Passport OCR endpoint exists. Status: {response.status_code}")
        
        # Check response structure
        data = response.json()
        assert "success" in data or "error" in data or "detail" in data, "Response should have success/error field"
        print(f"Response: {data}")
    
    def test_cv_ocr_endpoint_exists(self):
        """Test POST /api/auth/candidate/ocr/cv endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/api/auth/candidate/ocr/cv",
            json={
                "file_base64": "invalid_base64",
                "mime_type": "application/pdf"
            },
            headers={"Content-Type": "application/json"}
        )
        # Should not return 404 - endpoint exists
        assert response.status_code != 404, f"CV OCR endpoint not found. Status: {response.status_code}"
        print(f"CV OCR endpoint exists. Status: {response.status_code}")
        
        data = response.json()
        assert "success" in data or "error" in data or "detail" in data, "Response should have success/error field"
        print(f"Response: {data}")
    
    def test_register_with_profile_endpoint_exists(self):
        """Test POST /api/auth/candidate/register-with-profile endpoint exists"""
        # Use unique email to avoid conflicts
        test_email = f"test.candidate.{uuid.uuid4().hex[:8]}@test.com"
        
        response = requests.post(
            f"{BASE_URL}/api/auth/candidate/register-with-profile",
            json={
                "email": test_email,
                "password": "test1234",
                "profile_data": {
                    "first_name": "Test",
                    "last_name": "Candidate",
                    "citizenship": "India",
                    "phone": "+91 9876543210",
                    "current_profession": "Welder"
                }
            },
            headers={"Content-Type": "application/json"}
        )
        # Should not return 404 - endpoint exists
        assert response.status_code != 404, f"Register with profile endpoint not found. Status: {response.status_code}"
        print(f"Register with profile endpoint exists. Status: {response.status_code}")
        print(f"Response: {response.json()}")
    
    def test_register_with_profile_creates_user_and_profile(self):
        """Test that register-with-profile creates both user and candidate profile"""
        test_email = f"test.candidate.{uuid.uuid4().hex[:8]}@test.com"
        
        response = requests.post(
            f"{BASE_URL}/api/auth/candidate/register-with-profile",
            json={
                "email": test_email,
                "password": "test1234",
                "profile_data": {
                    "first_name": "John",
                    "last_name": "Doe",
                    "date_of_birth": "1990-01-15",
                    "citizenship": "Nepal",
                    "nationality": "NPL",
                    "passport_number": "N1234567",
                    "passport_expiry_date": "2030-01-01",
                    "gender": "male",
                    "phone": "+977 9876543210",
                    "current_profession": "Electrician",
                    "experience_years": 5,
                    "countries_worked_in": ["UAE", "Qatar"],
                    "languages_known": ["English", "Hindi", "Nepali"],
                    "marital_status": "married",
                    "address": "Kathmandu, Nepal",
                    "target_position": "Electrician",
                    "salary_expectation": "1000-1500 EUR",
                    "availability": "immediate"
                }
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code in [200, 201], f"Registration failed. Status: {response.status_code}, Response: {response.text}"
        
        data = response.json()
        
        # Check response structure
        assert "access_token" in data, "Response should contain access_token"
        assert "user" in data, "Response should contain user object"
        
        user = data["user"]
        assert user["email"] == test_email, "User email should match"
        assert user["role"] == "candidate", "User role should be candidate"
        assert user["account_type"] == "candidate", "Account type should be candidate"
        
        print(f"SUCCESS: User created with ID: {user['user_id']}")
        print(f"User name: {user['name']}")
        
        # Now verify the profile was created by accessing it
        session_token = data["access_token"]
        
        profile_response = requests.get(
            f"{BASE_URL}/api/portal/candidate/profile",
            headers={
                "Authorization": f"Bearer {session_token}",
                "Content-Type": "application/json"
            }
        )
        
        assert profile_response.status_code == 200, f"Profile fetch failed. Status: {profile_response.status_code}"
        
        profile = profile_response.json()
        assert profile.get("first_name") == "John", "Profile first_name should match"
        assert profile.get("last_name") == "Doe", "Profile last_name should match"
        assert profile.get("citizenship") == "Nepal", "Profile citizenship should match"
        assert profile.get("current_profession") == "Electrician", "Profile profession should match"
        
        print(f"SUCCESS: Profile created with ID: {profile.get('profile_id')}")
        print(f"Profile status: {profile.get('status')}")
    
    def test_register_with_profile_duplicate_email(self):
        """Test that duplicate email registration fails"""
        test_email = f"test.duplicate.{uuid.uuid4().hex[:8]}@test.com"
        
        # First registration
        response1 = requests.post(
            f"{BASE_URL}/api/auth/candidate/register-with-profile",
            json={
                "email": test_email,
                "password": "test1234",
                "profile_data": {
                    "first_name": "First",
                    "last_name": "User"
                }
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response1.status_code in [200, 201], f"First registration should succeed. Status: {response1.status_code}"
        
        # Second registration with same email
        response2 = requests.post(
            f"{BASE_URL}/api/auth/candidate/register-with-profile",
            json={
                "email": test_email,
                "password": "test1234",
                "profile_data": {
                    "first_name": "Second",
                    "last_name": "User"
                }
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response2.status_code == 400, f"Duplicate email should return 400. Status: {response2.status_code}"
        
        data = response2.json()
        assert "detail" in data, "Error response should have detail field"
        print(f"SUCCESS: Duplicate email correctly rejected with message: {data.get('detail')}")
    
    def test_passport_ocr_response_structure(self):
        """Test passport OCR returns correct response structure"""
        # Create a minimal valid base64 image (1x1 red pixel PNG)
        # This is a valid PNG but won't contain passport data
        minimal_png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
        
        response = requests.post(
            f"{BASE_URL}/api/auth/candidate/ocr/passport",
            json={
                "image_base64": minimal_png,
                "mime_type": "image/png"
            },
            headers={"Content-Type": "application/json"}
        )
        
        # The endpoint should return a response (may be error due to invalid image)
        assert response.status_code in [200, 400, 422, 500], f"Unexpected status: {response.status_code}"
        
        data = response.json()
        print(f"Passport OCR response: {data}")
        
        # Check that response has expected structure
        assert "success" in data or "error" in data or "detail" in data, "Response should indicate success/error"
    
    def test_cv_ocr_response_structure(self):
        """Test CV OCR returns correct response structure"""
        # Create a minimal valid base64 (not a real PDF but tests endpoint)
        minimal_data = base64.b64encode(b"test content").decode()
        
        response = requests.post(
            f"{BASE_URL}/api/auth/candidate/ocr/cv",
            json={
                "file_base64": minimal_data,
                "mime_type": "application/pdf"
            },
            headers={"Content-Type": "application/json"}
        )
        
        # The endpoint should return a response
        assert response.status_code in [200, 400, 422, 500], f"Unexpected status: {response.status_code}"
        
        data = response.json()
        print(f"CV OCR response: {data}")
        
        # Check that response has expected structure
        assert "success" in data or "error" in data or "detail" in data, "Response should indicate success/error"


class TestCandidateProfileAccess:
    """Test that registered candidates can access their profile"""
    
    @pytest.fixture
    def registered_candidate(self):
        """Create a registered candidate and return session token"""
        test_email = f"test.access.{uuid.uuid4().hex[:8]}@test.com"
        
        response = requests.post(
            f"{BASE_URL}/api/auth/candidate/register-with-profile",
            json={
                "email": test_email,
                "password": "test1234",
                "profile_data": {
                    "first_name": "Access",
                    "last_name": "Test",
                    "citizenship": "Bangladesh",
                    "phone": "+880 1234567890",
                    "current_profession": "Plumber"
                }
            },
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code not in [200, 201]:
            pytest.skip(f"Could not create test candidate: {response.text}")
        
        data = response.json()
        return {
            "session_token": data["access_token"],
            "user_id": data["user"]["user_id"],
            "email": test_email
        }
    
    def test_candidate_can_access_profile(self, registered_candidate):
        """Test GET /api/portal/candidate/profile returns profile data"""
        response = requests.get(
            f"{BASE_URL}/api/portal/candidate/profile",
            headers={
                "Authorization": f"Bearer {registered_candidate['session_token']}",
                "Content-Type": "application/json"
            }
        )
        
        assert response.status_code == 200, f"Profile access failed. Status: {response.status_code}"
        
        profile = response.json()
        assert profile.get("first_name") == "Access", "First name should match"
        assert profile.get("last_name") == "Test", "Last name should match"
        assert profile.get("citizenship") == "Bangladesh", "Citizenship should match"
        assert profile.get("current_profession") == "Plumber", "Profession should match"
        
        print(f"SUCCESS: Profile accessed successfully")
        print(f"Profile ID: {profile.get('profile_id')}")
        print(f"Status: {profile.get('status')}")
    
    def test_candidate_can_update_profile(self, registered_candidate):
        """Test PUT /api/portal/candidate/profile updates profile"""
        # First get current profile
        get_response = requests.get(
            f"{BASE_URL}/api/portal/candidate/profile",
            headers={
                "Authorization": f"Bearer {registered_candidate['session_token']}",
                "Content-Type": "application/json"
            }
        )
        
        assert get_response.status_code == 200
        
        # Update profile
        update_response = requests.put(
            f"{BASE_URL}/api/portal/candidate/profile",
            json={
                "current_profession": "Senior Plumber",
                "experience_years": 10,
                "target_position_cor": "Plumber Industrial"
            },
            headers={
                "Authorization": f"Bearer {registered_candidate['session_token']}",
                "Content-Type": "application/json"
            }
        )
        
        assert update_response.status_code == 200, f"Profile update failed. Status: {update_response.status_code}"
        
        updated_profile = update_response.json()
        assert updated_profile.get("current_profession") == "Senior Plumber", "Profession should be updated"
        assert updated_profile.get("experience_years") == 10, "Experience years should be updated"
        
        print(f"SUCCESS: Profile updated successfully")


class TestAuthMeEndpoint:
    """Test /api/auth/me endpoint for registered candidates"""
    
    def test_auth_me_returns_user_data(self):
        """Test that /api/auth/me returns correct user data after registration"""
        test_email = f"test.authme.{uuid.uuid4().hex[:8]}@test.com"
        
        # Register
        reg_response = requests.post(
            f"{BASE_URL}/api/auth/candidate/register-with-profile",
            json={
                "email": test_email,
                "password": "test1234",
                "profile_data": {
                    "first_name": "Auth",
                    "last_name": "Me"
                }
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert reg_response.status_code in [200, 201], f"Registration failed: {reg_response.text}"
        
        session_token = reg_response.json()["access_token"]
        
        # Call /api/auth/me
        me_response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={
                "Authorization": f"Bearer {session_token}",
                "Content-Type": "application/json"
            }
        )
        
        assert me_response.status_code == 200, f"/api/auth/me failed. Status: {me_response.status_code}"
        
        user = me_response.json()
        assert user["email"] == test_email, "Email should match"
        assert user["role"] == "candidate", "Role should be candidate"
        assert user["name"] == "Auth Me", "Name should be constructed from first/last name"
        
        print(f"SUCCESS: /api/auth/me returns correct user data")
        print(f"User ID: {user['user_id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
