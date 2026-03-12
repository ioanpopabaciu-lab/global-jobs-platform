"""
Phase 3 Candidate Registration & Dashboard API Tests
Tests for OCR endpoints, profile management, document upload, and dashboard
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_CANDIDATE_EMAIL = "test.candidate@emergent.ro"
TEST_CANDIDATE_PASSWORD = "test1234"


class TestCandidateAuthentication:
    """Test candidate login and session management"""
    
    @pytest.fixture(scope="class")
    def session_token(self):
        """Get session token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_CANDIDATE_EMAIL, "password": TEST_CANDIDATE_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        return data["access_token"]
    
    def test_login_returns_correct_structure(self, session_token):
        """Verify login response has correct structure"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_CANDIDATE_EMAIL, "password": TEST_CANDIDATE_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "access_token" in data
        assert "user" in data
        
        user = data["user"]
        assert user["email"] == TEST_CANDIDATE_EMAIL
        assert user["role"] == "candidate"
        assert user["account_type"] == "candidate"
        assert "user_id" in user
    
    def test_auth_me_with_token(self, session_token):
        """Test /auth/me endpoint with valid token"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_CANDIDATE_EMAIL
        assert data["role"] == "candidate"


class TestCandidateDashboard:
    """Test candidate dashboard endpoint"""
    
    @pytest.fixture(scope="class")
    def session_token(self):
        """Get session token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_CANDIDATE_EMAIL, "password": TEST_CANDIDATE_PASSWORD}
        )
        return response.json()["access_token"]
    
    def test_dashboard_returns_stats(self, session_token):
        """Test GET /api/portal/candidate/dashboard returns proper stats"""
        response = requests.get(
            f"{BASE_URL}/api/portal/candidate/dashboard",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify dashboard structure
        assert "has_profile" in data
        assert "profile_status" in data
        assert "active_projects" in data
        assert "unread_notifications" in data
        assert "documents_count" in data
        
        # Verify types
        assert isinstance(data["has_profile"], bool)
        assert isinstance(data["active_projects"], int)
        assert isinstance(data["unread_notifications"], int)
        assert isinstance(data["documents_count"], int)
    
    def test_dashboard_requires_auth(self):
        """Test dashboard endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/portal/candidate/dashboard")
        assert response.status_code == 401


class TestCandidateProfile:
    """Test candidate profile CRUD operations"""
    
    @pytest.fixture(scope="class")
    def session_token(self):
        """Get session token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_CANDIDATE_EMAIL, "password": TEST_CANDIDATE_PASSWORD}
        )
        return response.json()["access_token"]
    
    def test_get_profile(self, session_token):
        """Test GET /api/portal/candidate/profile"""
        response = requests.get(
            f"{BASE_URL}/api/portal/candidate/profile",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Profile may or may not exist
        assert "profile" in data
        if data["profile"]:
            assert "profile_id" in data["profile"]
            assert "user_id" in data["profile"]
    
    def test_create_update_profile(self, session_token):
        """Test POST /api/portal/candidate/profile creates/updates profile"""
        profile_data = {
            "first_name": "Test",
            "last_name": "Candidate",
            "phone": "+40123456789",
            "country_of_origin": "Nepal",
            "citizenship": "Nepali"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/portal/candidate/profile",
            headers={
                "Authorization": f"Bearer {session_token}",
                "Content-Type": "application/json"
            },
            json=profile_data
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "profile" in data
        assert "message" in data
        
        profile = data["profile"]
        assert profile["first_name"] == "Test"
        assert profile["last_name"] == "Candidate"
        assert profile["phone"] == "+40123456789"
        assert profile["country_of_origin"] == "Nepal"
        assert profile["citizenship"] == "Nepali"
        
        # Verify profile persisted - GET to confirm
        get_response = requests.get(
            f"{BASE_URL}/api/portal/candidate/profile",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data["profile"]["first_name"] == "Test"
    
    def test_profile_requires_auth(self):
        """Test profile endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/portal/candidate/profile")
        assert response.status_code == 401


class TestCandidateDocuments:
    """Test candidate document management"""
    
    @pytest.fixture(scope="class")
    def session_token(self):
        """Get session token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_CANDIDATE_EMAIL, "password": TEST_CANDIDATE_PASSWORD}
        )
        return response.json()["access_token"]
    
    def test_get_documents_list(self, session_token):
        """Test GET /api/portal/candidate/documents returns document list"""
        response = requests.get(
            f"{BASE_URL}/api/portal/candidate/documents",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "documents" in data
        assert isinstance(data["documents"], list)
    
    def test_documents_requires_auth(self):
        """Test documents endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/portal/candidate/documents")
        assert response.status_code == 401


class TestOCREndpoints:
    """Test OCR extraction endpoints"""
    
    def test_passport_ocr_endpoint_exists(self):
        """Test POST /api/auth/candidate/ocr/passport endpoint exists and validates input"""
        # Send invalid base64 to test endpoint exists and handles errors gracefully
        response = requests.post(
            f"{BASE_URL}/api/auth/candidate/ocr/passport",
            headers={"Content-Type": "application/json"},
            json={"image_base64": "invalid_base64", "mime_type": "image/jpeg"}
        )
        
        # Should return 200 with error in response (not 404 or 500)
        assert response.status_code == 200
        data = response.json()
        
        # Should have success field indicating failure due to invalid input
        assert "success" in data
        assert data["success"] == False
        assert "error" in data
    
    def test_cv_ocr_endpoint_exists(self):
        """Test POST /api/auth/candidate/ocr/cv endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/api/auth/candidate/ocr/cv",
            headers={"Content-Type": "application/json"},
            json={"file_base64": "invalid_base64", "mime_type": "application/pdf"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        assert data["success"] == False


class TestDocumentUpload:
    """Test document upload functionality"""
    
    @pytest.fixture(scope="class")
    def session_token(self):
        """Get session token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_CANDIDATE_EMAIL, "password": TEST_CANDIDATE_PASSWORD}
        )
        return response.json()["access_token"]
    
    def test_upload_endpoint_exists(self, session_token):
        """Test POST /api/portal/candidate/documents/upload endpoint exists"""
        # Create a minimal test file
        test_content = b"test file content"
        
        response = requests.post(
            f"{BASE_URL}/api/portal/candidate/documents/upload",
            headers={"Authorization": f"Bearer {session_token}"},
            files={"file": ("test.txt", test_content, "text/plain")},
            data={"document_type": "other"}
        )
        
        # Should fail with 400 because text/plain is not allowed
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "not allowed" in data["detail"].lower()
    
    def test_check_existing_document(self, session_token):
        """Test GET /api/portal/candidate/documents/check-existing"""
        response = requests.get(
            f"{BASE_URL}/api/portal/candidate/documents/check-existing",
            headers={"Authorization": f"Bearer {session_token}"},
            params={"document_type": "passport"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "exists" in data
        assert isinstance(data["exists"], bool)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
