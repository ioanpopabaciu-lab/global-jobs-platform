"""
Phase 2 Tests: Candidate and Employer Profile Forms with Document Upload
Tests for: Profile CRUD, Document Upload to Cloud Storage, Profile Submission Workflow
"""
import pytest
import requests
import os
import uuid
import io
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test session tokens - will be set by fixtures
CANDIDATE_TOKEN = None
EMPLOYER_TOKEN = None

@pytest.fixture(scope="module", autouse=True)
def setup_test_users():
    """Setup test users and get session tokens via login"""
    global CANDIDATE_TOKEN, EMPLOYER_TOKEN
    
    # Login as candidate
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": "test.candidate@example.com", "password": "test123"},
        headers={"Content-Type": "application/json"}
    )
    if response.status_code == 200:
        CANDIDATE_TOKEN = response.json().get("access_token")
        print(f"✓ Candidate login successful, token: {CANDIDATE_TOKEN[:20]}...")
    else:
        print(f"✗ Candidate login failed: {response.status_code} - {response.text}")
    
    # Login as employer
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": "test.employer@example.com", "password": "test123"},
        headers={"Content-Type": "application/json"}
    )
    if response.status_code == 200:
        EMPLOYER_TOKEN = response.json().get("access_token")
        print(f"✓ Employer login successful, token: {EMPLOYER_TOKEN[:20]}...")
    else:
        print(f"✗ Employer login failed: {response.status_code} - {response.text}")
    
    yield
    
    # Cleanup is optional - test data can be reused

def get_candidate_headers():
    return {
        "Authorization": f"Bearer {CANDIDATE_TOKEN}",
        "Content-Type": "application/json"
    }

def get_employer_headers():
    return {
        "Authorization": f"Bearer {EMPLOYER_TOKEN}",
        "Content-Type": "application/json"
    }


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_auth_me_candidate(self):
        """Test /auth/me for candidate"""
        if not CANDIDATE_TOKEN:
            pytest.skip("Candidate token not available")
        
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers=get_candidate_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test.candidate@example.com"
        assert data["role"] == "candidate"
        print(f"✓ Auth/me candidate: {data['name']} ({data['role']})")
    
    def test_auth_me_employer(self):
        """Test /auth/me for employer"""
        if not EMPLOYER_TOKEN:
            pytest.skip("Employer token not available")
        
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers=get_employer_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test.employer@example.com"
        assert data["role"] == "employer"
        print(f"✓ Auth/me employer: {data['name']} ({data['role']})")
    
    def test_auth_me_unauthorized(self):
        """Test /auth/me without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ Auth/me unauthorized returns 401")


class TestCandidateProfile:
    """Candidate profile CRUD tests - 5 sections"""
    
    def test_get_candidate_profile_initial(self):
        """Test getting candidate profile (may be empty initially)"""
        if not CANDIDATE_TOKEN:
            pytest.skip("Candidate token not available")
        
        response = requests.get(
            f"{BASE_URL}/api/portal/candidate/profile",
            headers=get_candidate_headers()
        )
        assert response.status_code == 200
        data = response.json()
        # Profile may or may not exist
        print(f"✓ Candidate profile fetch: {'exists' if data.get('profile') else 'not created yet'}")
    
    def test_create_candidate_profile_section1_personal(self):
        """Test creating/updating candidate profile - Section 1: Personal Information"""
        if not CANDIDATE_TOKEN:
            pytest.skip("Candidate token not available")
        
        payload = {
            "first_name": "Test",
            "last_name": "Candidate",
            "country_of_origin": "Nepal",
            "date_of_birth": "1990-05-15",
            "gender": "male",
            "marital_status": "single",
            "religion": "Hindu",
            "citizenship": "Nepal",
            "phone": "+977 9812345678",
            "whatsapp": "+977 9812345678"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/portal/candidate/profile",
            json=payload,
            headers=get_candidate_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("profile") is not None
        assert data["profile"]["first_name"] == "Test"
        assert data["profile"]["last_name"] == "Candidate"
        assert data["profile"]["country_of_origin"] == "Nepal"
        assert data["profile"]["citizenship"] == "Nepal"
        print(f"✓ Candidate profile Section 1 (Personal) saved: {data['profile']['first_name']} {data['profile']['last_name']}")
    
    def test_update_candidate_profile_section2_family(self):
        """Test updating candidate profile - Section 2: Family"""
        if not CANDIDATE_TOKEN:
            pytest.skip("Candidate token not available")
        
        payload = {
            "father_name": "Ram Bahadur",
            "mother_name": "Sita Devi",
            "children_count": 2,
            "children_ages": [5, 8]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/portal/candidate/profile",
            json=payload,
            headers=get_candidate_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert data["profile"]["father_name"] == "Ram Bahadur"
        assert data["profile"]["children_count"] == 2
        print(f"✓ Candidate profile Section 2 (Family) saved: father={data['profile']['father_name']}")
    
    def test_update_candidate_profile_section3_professional(self):
        """Test updating candidate profile - Section 3: Professional Experience"""
        if not CANDIDATE_TOKEN:
            pytest.skip("Candidate token not available")
        
        payload = {
            "current_profession": "Welder",
            "target_position_cor": "721401",
            "experience_years": 5,
            "worked_abroad": True,
            "countries_worked_in": ["UAE", "Qatar"],
            "languages_known": ["English", "Hindi", "Nepali"],
            "english_level": "intermediate"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/portal/candidate/profile",
            json=payload,
            headers=get_candidate_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert data["profile"]["current_profession"] == "Welder"
        assert data["profile"]["experience_years"] == 5
        assert data["profile"]["worked_abroad"] == True
        assert "UAE" in data["profile"]["countries_worked_in"]
        print(f"✓ Candidate profile Section 3 (Professional) saved: {data['profile']['current_profession']}, {data['profile']['experience_years']} years")
    
    def test_update_candidate_profile_section5_additional(self):
        """Test updating candidate profile - Section 5: Additional Information"""
        if not CANDIDATE_TOKEN:
            pytest.skip("Candidate token not available")
        
        payload = {
            "salary_expectation": "1500-2000 EUR",
            "existing_residence_permit": "Work permit in UAE",
            "existing_residence_permit_country": "UAE"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/portal/candidate/profile",
            json=payload,
            headers=get_candidate_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert data["profile"]["salary_expectation"] == "1500-2000 EUR"
        print(f"✓ Candidate profile Section 5 (Additional) saved: salary={data['profile']['salary_expectation']}")
    
    def test_get_candidate_profile_complete(self):
        """Test getting complete candidate profile with all sections"""
        if not CANDIDATE_TOKEN:
            pytest.skip("Candidate token not available")
        
        response = requests.get(
            f"{BASE_URL}/api/portal/candidate/profile",
            headers=get_candidate_headers()
        )
        assert response.status_code == 200
        data = response.json()
        profile = data.get("profile")
        assert profile is not None
        
        # Verify all sections are populated
        assert profile.get("first_name") == "Test"  # Section 1
        assert profile.get("father_name") == "Ram Bahadur"  # Section 2
        assert profile.get("current_profession") == "Welder"  # Section 3
        assert profile.get("salary_expectation") == "1500-2000 EUR"  # Section 5
        # Status can be draft or pending_validation depending on test order
        assert profile.get("status") in ["draft", "pending_validation"]
        
        print(f"✓ Complete candidate profile retrieved: {profile['first_name']} {profile['last_name']}, status={profile['status']}")


class TestCandidateDocumentUpload:
    """Candidate document upload tests - Section 4"""
    
    def test_upload_cv_document(self):
        """Test uploading CV document"""
        if not CANDIDATE_TOKEN:
            pytest.skip("Candidate token not available")
        
        # Create a simple PDF-like file content
        file_content = b"%PDF-1.4 Test CV Document Content"
        files = {
            'file': ('test_cv.pdf', io.BytesIO(file_content), 'application/pdf')
        }
        data = {
            'document_type': 'cv'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/portal/candidate/documents/upload",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {CANDIDATE_TOKEN}"}
        )
        assert response.status_code == 200
        result = response.json()
        assert "doc_id" in result
        assert result["message"] == "Document uploaded successfully"
        print(f"✓ CV document uploaded: {result['doc_id']}")
    
    def test_upload_passport_document(self):
        """Test uploading passport document"""
        if not CANDIDATE_TOKEN:
            pytest.skip("Candidate token not available")
        
        file_content = b"%PDF-1.4 Test Passport Document"
        files = {
            'file': ('passport.pdf', io.BytesIO(file_content), 'application/pdf')
        }
        data = {
            'document_type': 'passport',
            'document_number': 'NP12345678'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/portal/candidate/documents/upload",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {CANDIDATE_TOKEN}"}
        )
        assert response.status_code == 200
        result = response.json()
        assert "doc_id" in result
        print(f"✓ Passport document uploaded: {result['doc_id']}")
    
    def test_upload_criminal_record_document(self):
        """Test uploading criminal record document"""
        if not CANDIDATE_TOKEN:
            pytest.skip("Candidate token not available")
        
        file_content = b"%PDF-1.4 Test Criminal Record"
        files = {
            'file': ('criminal_record.pdf', io.BytesIO(file_content), 'application/pdf')
        }
        data = {
            'document_type': 'criminal_record'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/portal/candidate/documents/upload",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {CANDIDATE_TOKEN}"}
        )
        assert response.status_code == 200
        result = response.json()
        assert "doc_id" in result
        print(f"✓ Criminal record document uploaded: {result['doc_id']}")
    
    def test_upload_passport_photo(self):
        """Test uploading passport photo"""
        if not CANDIDATE_TOKEN:
            pytest.skip("Candidate token not available")
        
        # Create a simple image-like content
        file_content = b'\x89PNG\r\n\x1a\n' + b'\x00' * 100  # Minimal PNG header
        files = {
            'file': ('photo.png', io.BytesIO(file_content), 'image/png')
        }
        data = {
            'document_type': 'passport_photo'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/portal/candidate/documents/upload",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {CANDIDATE_TOKEN}"}
        )
        assert response.status_code == 200
        result = response.json()
        assert "doc_id" in result
        print(f"✓ Passport photo uploaded: {result['doc_id']}")
    
    def test_get_candidate_documents(self):
        """Test getting all candidate documents"""
        if not CANDIDATE_TOKEN:
            pytest.skip("Candidate token not available")
        
        response = requests.get(
            f"{BASE_URL}/api/portal/candidate/documents",
            headers=get_candidate_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert "documents" in data
        assert len(data["documents"]) >= 4  # CV, passport, criminal_record, passport_photo
        
        doc_types = [d["document_type"] for d in data["documents"]]
        assert "cv" in doc_types
        assert "passport" in doc_types
        print(f"✓ Candidate documents retrieved: {len(data['documents'])} documents")
    
    def test_upload_invalid_file_type(self):
        """Test uploading invalid file type returns error"""
        if not CANDIDATE_TOKEN:
            pytest.skip("Candidate token not available")
        
        file_content = b"This is a text file"
        files = {
            'file': ('test.txt', io.BytesIO(file_content), 'text/plain')
        }
        data = {
            'document_type': 'cv'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/portal/candidate/documents/upload",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {CANDIDATE_TOKEN}"}
        )
        assert response.status_code == 400
        print("✓ Invalid file type rejected with 400")


class TestCandidateProfileSubmission:
    """Candidate profile submission workflow tests"""
    
    def test_submit_candidate_profile_for_validation(self):
        """Test submitting candidate profile for validation"""
        if not CANDIDATE_TOKEN:
            pytest.skip("Candidate token not available")
        
        response = requests.post(
            f"{BASE_URL}/api/portal/candidate/profile/submit",
            headers=get_candidate_headers()
        )
        # 200 = success, 400 = already submitted (both are valid outcomes)
        assert response.status_code in [200, 400]
        data = response.json()
        if response.status_code == 200:
            assert data["status"] == "pending_validation"
            print(f"✓ Candidate profile submitted for validation: {data['status']}")
        else:
            print(f"✓ Candidate profile already submitted: {data.get('detail', 'already submitted')}")
    
    def test_verify_profile_status_pending(self):
        """Test that profile status is now pending_validation"""
        if not CANDIDATE_TOKEN:
            pytest.skip("Candidate token not available")
        
        response = requests.get(
            f"{BASE_URL}/api/portal/candidate/profile",
            headers=get_candidate_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert data["profile"]["status"] == "pending_validation"
        print(f"✓ Profile status verified: {data['profile']['status']}")


class TestCandidateDashboard:
    """Candidate dashboard tests"""
    
    def test_get_candidate_dashboard(self):
        """Test getting candidate dashboard data"""
        if not CANDIDATE_TOKEN:
            pytest.skip("Candidate token not available")
        
        response = requests.get(
            f"{BASE_URL}/api/portal/candidate/dashboard",
            headers=get_candidate_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert data["has_profile"] == True
        assert "profile_status" in data
        assert "documents_count" in data
        assert data["documents_count"] >= 4
        print(f"✓ Candidate dashboard: status={data['profile_status']}, docs={data['documents_count']}")


class TestEmployerProfile:
    """Employer profile CRUD tests - 4 sections"""
    
    def test_get_employer_profile_initial(self):
        """Test getting employer profile (may be empty initially)"""
        if not EMPLOYER_TOKEN:
            pytest.skip("Employer token not available")
        
        response = requests.get(
            f"{BASE_URL}/api/portal/employer/profile",
            headers=get_employer_headers()
        )
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Employer profile fetch: {'exists' if data.get('profile') else 'not created yet'}")
    
    def test_create_employer_profile_section1_company(self):
        """Test creating/updating employer profile - Section 1: Company Information"""
        if not EMPLOYER_TOKEN:
            pytest.skip("Employer token not available")
        
        payload = {
            "company_name": "Test Company SRL",
            "company_cui": "RO12345678",
            "company_j_number": "J40/1234/2020",
            "address": "Str. Test nr. 1, Sector 1, București",
            "phone": "+40 21 123 4567",
            "email": "test.employer@example.com",
            "administrator_name": "Ion Popescu",
            "country": "RO",
            "city": "București",
            "industry": "Construcții / Construction",
            "employees_count": 50,
            "year_founded": 2020,
            "website": "https://testcompany.ro"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/portal/employer/profile",
            json=payload,
            headers=get_employer_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("profile") is not None
        assert data["profile"]["company_name"] == "Test Company SRL"
        assert data["profile"]["company_cui"] == "RO12345678"
        print(f"✓ Employer profile Section 1 (Company) saved: {data['profile']['company_name']}")
    
    def test_update_employer_profile_section2_contact(self):
        """Test updating employer profile - Section 2: Contact Person"""
        if not EMPLOYER_TOKEN:
            pytest.skip("Employer token not available")
        
        payload = {
            "contact_person": "Maria Ionescu",
            "contact_email": "maria@testcompany.ro",
            "contact_phone": "+40 712 345 678"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/portal/employer/profile",
            json=payload,
            headers=get_employer_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert data["profile"]["contact_person"] == "Maria Ionescu"
        print(f"✓ Employer profile Section 2 (Contact) saved: {data['profile']['contact_person']}")
    
    def test_update_employer_profile_section4_igi_eligibility(self):
        """Test updating employer profile - Section 4: IGI Eligibility (Romania)"""
        if not EMPLOYER_TOKEN:
            pytest.skip("Employer token not available")
        
        payload = {
            "has_no_debts": True,
            "has_no_sanctions": True,
            "has_min_employees": True,
            "company_age_over_1_year": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/portal/employer/profile",
            json=payload,
            headers=get_employer_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert data["profile"]["has_no_debts"] == True
        assert data["profile"]["has_no_sanctions"] == True
        assert data["profile"]["has_min_employees"] == True
        assert data["profile"]["company_age_over_1_year"] == True
        print(f"✓ Employer profile Section 4 (IGI Eligibility) saved: all checks passed")


class TestEmployerDocumentUpload:
    """Employer document upload tests - Section 3"""
    
    def test_upload_cui_certificate(self):
        """Test uploading CUI certificate"""
        if not EMPLOYER_TOKEN:
            pytest.skip("Employer token not available")
        
        file_content = b"%PDF-1.4 Test CUI Certificate"
        files = {
            'file': ('cui_certificate.pdf', io.BytesIO(file_content), 'application/pdf')
        }
        data = {
            'document_type': 'cui_certificate'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/portal/employer/documents/upload",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {EMPLOYER_TOKEN}"}
        )
        assert response.status_code == 200
        result = response.json()
        assert "doc_id" in result
        print(f"✓ CUI certificate uploaded: {result['doc_id']}")
    
    def test_upload_administrator_id(self):
        """Test uploading administrator ID"""
        if not EMPLOYER_TOKEN:
            pytest.skip("Employer token not available")
        
        file_content = b"%PDF-1.4 Test Administrator ID"
        files = {
            'file': ('admin_id.pdf', io.BytesIO(file_content), 'application/pdf')
        }
        data = {
            'document_type': 'administrator_id'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/portal/employer/documents/upload",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {EMPLOYER_TOKEN}"}
        )
        assert response.status_code == 200
        result = response.json()
        assert "doc_id" in result
        print(f"✓ Administrator ID uploaded: {result['doc_id']}")
    
    def test_upload_company_criminal_record(self):
        """Test uploading company criminal record"""
        if not EMPLOYER_TOKEN:
            pytest.skip("Employer token not available")
        
        file_content = b"%PDF-1.4 Test Company Criminal Record"
        files = {
            'file': ('company_criminal.pdf', io.BytesIO(file_content), 'application/pdf')
        }
        data = {
            'document_type': 'company_criminal_record'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/portal/employer/documents/upload",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {EMPLOYER_TOKEN}"}
        )
        assert response.status_code == 200
        result = response.json()
        assert "doc_id" in result
        print(f"✓ Company criminal record uploaded: {result['doc_id']}")
    
    def test_get_employer_documents(self):
        """Test getting all employer documents"""
        if not EMPLOYER_TOKEN:
            pytest.skip("Employer token not available")
        
        response = requests.get(
            f"{BASE_URL}/api/portal/employer/documents",
            headers=get_employer_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert "documents" in data
        assert len(data["documents"]) >= 3
        
        doc_types = [d["document_type"] for d in data["documents"]]
        assert "cui_certificate" in doc_types
        assert "administrator_id" in doc_types
        assert "company_criminal_record" in doc_types
        print(f"✓ Employer documents retrieved: {len(data['documents'])} documents")


class TestEmployerProfileSubmission:
    """Employer profile submission workflow tests"""
    
    def test_submit_employer_profile_for_validation(self):
        """Test submitting employer profile for validation"""
        if not EMPLOYER_TOKEN:
            pytest.skip("Employer token not available")
        
        response = requests.post(
            f"{BASE_URL}/api/portal/employer/profile/submit",
            headers=get_employer_headers()
        )
        # 200 = success, 400 = already submitted (both are valid outcomes)
        assert response.status_code in [200, 400]
        data = response.json()
        if response.status_code == 200:
            assert data["status"] == "pending_validation"
            print(f"✓ Employer profile submitted for validation: {data['status']}")
        else:
            print(f"✓ Employer profile already submitted: {data.get('detail', 'already submitted')}")
    
    def test_verify_employer_profile_status_pending(self):
        """Test that employer profile status is now pending_validation"""
        if not EMPLOYER_TOKEN:
            pytest.skip("Employer token not available")
        
        response = requests.get(
            f"{BASE_URL}/api/portal/employer/profile",
            headers=get_employer_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert data["profile"]["status"] == "pending_validation"
        print(f"✓ Employer profile status verified: {data['profile']['status']}")


class TestEmployerDashboard:
    """Employer dashboard tests"""
    
    def test_get_employer_dashboard(self):
        """Test getting employer dashboard data"""
        if not EMPLOYER_TOKEN:
            pytest.skip("Employer token not available")
        
        response = requests.get(
            f"{BASE_URL}/api/portal/employer/dashboard",
            headers=get_employer_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert data["has_profile"] == True
        assert "profile_status" in data
        assert "documents_count" in data
        assert data["documents_count"] >= 3
        print(f"✓ Employer dashboard: status={data['profile_status']}, docs={data['documents_count']}")


class TestAccessControl:
    """Access control and authorization tests"""
    
    def test_candidate_cannot_access_employer_profile(self):
        """Test that candidate cannot access employer profile endpoint"""
        if not CANDIDATE_TOKEN:
            pytest.skip("Candidate token not available")
        
        response = requests.get(
            f"{BASE_URL}/api/portal/employer/profile",
            headers=get_candidate_headers()
        )
        assert response.status_code == 403
        print("✓ Candidate correctly denied access to employer profile")
    
    def test_employer_cannot_access_candidate_profile(self):
        """Test that employer cannot access candidate profile endpoint"""
        if not EMPLOYER_TOKEN:
            pytest.skip("Employer token not available")
        
        response = requests.get(
            f"{BASE_URL}/api/portal/candidate/profile",
            headers=get_employer_headers()
        )
        assert response.status_code == 403
        print("✓ Employer correctly denied access to candidate profile")
    
    def test_unauthenticated_cannot_access_profiles(self):
        """Test that unauthenticated users cannot access profiles"""
        response = requests.get(f"{BASE_URL}/api/portal/candidate/profile")
        assert response.status_code == 401
        
        response = requests.get(f"{BASE_URL}/api/portal/employer/profile")
        assert response.status_code == 401
        print("✓ Unauthenticated users correctly denied access")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
