"""
Test suite for the 4 technical problems in GJC platform:
1. PROBLEMA 1: Duplicate documents - max 1 active document per type with archive logic
2. PROBLEMA 2: Job 'Sudor Industrial' status should be 'open' (was 'draft')
3. PROBLEMA 3: Admin Jobs page shows company name in Angajator column
4. PROBLEMA 4: Admin Employers page shows city from address when city field empty
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_EMAIL = "admin@gjc.ro"
ADMIN_PASSWORD = "admin123"


class TestSetup:
    """Setup and authentication tests"""
    
    @pytest.fixture(scope="class")
    def session(self):
        """Create authenticated session"""
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        return s
    
    @pytest.fixture(scope="class")
    def admin_session(self, session):
        """Login as admin and return authenticated session"""
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return session
    
    def test_api_health(self, session):
        """Test API is accessible"""
        response = session.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("✓ API health check passed")


class TestProblema1DocumentDuplicates:
    """
    PROBLEMA 1: Document upload should check for existing documents of same type
    - Backend returns 'exists' flag when document already exists
    - Documents can be archived with status='archived'
    - Document list endpoint excludes archived documents by default
    """
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Login as admin"""
        s = requests.Session()
        response = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return s
    
    def test_check_existing_candidate_document_endpoint_exists(self, admin_session):
        """Test that check-existing endpoint exists for candidates"""
        response = admin_session.get(
            f"{BASE_URL}/api/portal/candidate/documents/check-existing",
            params={"document_type": "passport"}
        )
        # Should return 200 (even if no profile exists, it returns exists: false)
        assert response.status_code in [200, 403], f"Unexpected status: {response.status_code}"
        print("✓ Check-existing endpoint for candidates exists")
    
    def test_check_existing_employer_document_endpoint_exists(self, admin_session):
        """Test that check-existing endpoint exists for employers"""
        response = admin_session.get(
            f"{BASE_URL}/api/portal/employer/documents/check-existing",
            params={"document_type": "cui_certificate"}
        )
        # Should return 200 or 403 (role check)
        assert response.status_code in [200, 403], f"Unexpected status: {response.status_code}"
        print("✓ Check-existing endpoint for employers exists")
    
    def test_candidate_documents_exclude_archived_by_default(self, admin_session):
        """Test that candidate documents endpoint excludes archived by default"""
        response = admin_session.get(f"{BASE_URL}/api/portal/candidate/documents")
        # Should return 200 or 403 (role check)
        assert response.status_code in [200, 403], f"Unexpected status: {response.status_code}"
        if response.status_code == 200:
            data = response.json()
            documents = data.get("documents", [])
            # Verify no archived documents in default response
            archived_docs = [d for d in documents if d.get("status") == "archived"]
            assert len(archived_docs) == 0, "Archived documents should not appear in default list"
            print(f"✓ Candidate documents endpoint returns {len(documents)} non-archived documents")
    
    def test_employer_documents_exclude_archived_by_default(self, admin_session):
        """Test that employer documents endpoint excludes archived by default"""
        response = admin_session.get(f"{BASE_URL}/api/portal/employer/documents")
        # Should return 200 or 403 (role check)
        assert response.status_code in [200, 403], f"Unexpected status: {response.status_code}"
        if response.status_code == 200:
            data = response.json()
            documents = data.get("documents", [])
            # Verify no archived documents in default response
            archived_docs = [d for d in documents if d.get("status") == "archived"]
            assert len(archived_docs) == 0, "Archived documents should not appear in default list"
            print(f"✓ Employer documents endpoint returns {len(documents)} non-archived documents")


class TestProblema2SudorIndustrialJob:
    """
    PROBLEMA 2: Job 'Sudor Industrial' should have status 'open' (was 'draft')
    """
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Login as admin"""
        s = requests.Session()
        response = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return s
    
    def test_sudor_industrial_job_status_is_open(self, admin_session):
        """Test that 'Sudor Industrial' job has status 'open'"""
        response = admin_session.get(f"{BASE_URL}/api/admin/jobs")
        assert response.status_code == 200, f"Failed to get jobs: {response.text}"
        
        data = response.json()
        jobs = data.get("jobs", [])
        
        # Find Sudor Industrial job
        sudor_job = None
        for job in jobs:
            if "Sudor Industrial" in job.get("title", ""):
                sudor_job = job
                break
        
        assert sudor_job is not None, "Sudor Industrial job not found"
        assert sudor_job.get("status") == "open", f"Expected status 'open', got '{sudor_job.get('status')}'"
        print(f"✓ Sudor Industrial job status is 'open' (job_id: {sudor_job.get('job_id')})")


class TestProblema3AdminJobsCompanyName:
    """
    PROBLEMA 3: Admin Jobs page should show company name in Angajator column
    - Backend should return employer info with company_name
    """
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Login as admin"""
        s = requests.Session()
        response = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return s
    
    def test_admin_jobs_returns_employer_info(self, admin_session):
        """Test that admin jobs endpoint returns employer info with company_name"""
        response = admin_session.get(f"{BASE_URL}/api/admin/jobs")
        assert response.status_code == 200, f"Failed to get jobs: {response.text}"
        
        data = response.json()
        jobs = data.get("jobs", [])
        
        assert len(jobs) > 0, "No jobs found to test"
        
        # Check that each job has employer info with company_name
        for job in jobs:
            employer = job.get("employer")
            assert employer is not None, f"Job {job.get('job_id')} missing employer info"
            assert "company_name" in employer, f"Job {job.get('job_id')} employer missing company_name"
            print(f"✓ Job '{job.get('title')}' has employer: {employer.get('company_name')}")
        
        print(f"✓ All {len(jobs)} jobs have employer company_name")


class TestProblema4AdminEmployersCity:
    """
    PROBLEMA 4: Admin Employers page should show city from address when city field empty
    - Backend returns employer data with city and address fields
    - Frontend helper function extracts city from address
    """
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Login as admin"""
        s = requests.Session()
        response = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return s
    
    def test_admin_employers_returns_address_and_city(self, admin_session):
        """Test that admin employers endpoint returns address and city fields"""
        response = admin_session.get(f"{BASE_URL}/api/admin/employers")
        assert response.status_code == 200, f"Failed to get employers: {response.text}"
        
        data = response.json()
        employers = data.get("employers", [])
        
        assert len(employers) > 0, "No employers found to test"
        
        # Check that each employer has address field (city may be empty)
        for employer in employers:
            company_name = employer.get("company_name", "Unknown")
            address = employer.get("address")
            city = employer.get("city")
            country = employer.get("country")
            
            # At least address or city should be present for location display
            has_location_info = address or city or country
            assert has_location_info, f"Employer {company_name} has no location info"
            
            print(f"✓ Employer '{company_name}': city='{city}', address='{address}', country='{country}'")
        
        print(f"✓ All {len(employers)} employers have location data for display")


class TestAdminPagesLoad:
    """Test that admin pages load correctly"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Login as admin"""
        s = requests.Session()
        response = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return s
    
    def test_admin_jobs_endpoint(self, admin_session):
        """Test admin jobs endpoint returns data"""
        response = admin_session.get(f"{BASE_URL}/api/admin/jobs")
        assert response.status_code == 200
        data = response.json()
        assert "jobs" in data
        assert "total" in data
        print(f"✓ Admin jobs endpoint returns {data['total']} jobs")
    
    def test_admin_employers_endpoint(self, admin_session):
        """Test admin employers endpoint returns data"""
        response = admin_session.get(f"{BASE_URL}/api/admin/employers")
        assert response.status_code == 200
        data = response.json()
        assert "employers" in data
        print(f"✓ Admin employers endpoint returns {len(data['employers'])} employers")
    
    def test_admin_candidates_endpoint(self, admin_session):
        """Test admin candidates endpoint returns data"""
        response = admin_session.get(f"{BASE_URL}/api/admin/candidates")
        assert response.status_code == 200
        data = response.json()
        assert "candidates" in data
        print(f"✓ Admin candidates endpoint returns {len(data['candidates'])} candidates")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
