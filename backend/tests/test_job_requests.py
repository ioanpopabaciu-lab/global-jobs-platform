"""
Job Request CRUD API Tests
Tests for employer job request management endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://visa-relocation-hub.preview.emergentagent.com')

# Test credentials
TEST_EMPLOYER_EMAIL = "test.employer@emergent.ro"
TEST_EMPLOYER_PASSWORD = "test1234"
UNVALIDATED_EMPLOYER_EMAIL = f"unvalidated.employer.{uuid.uuid4().hex[:8]}@test.com"
UNVALIDATED_EMPLOYER_PASSWORD = "test1234"


class TestJobRequestCRUD:
    """Job Request CRUD endpoint tests"""
    
    @pytest.fixture(scope="class")
    def employer_session(self):
        """Get authenticated session for validated employer"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        # Login as validated employer
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMPLOYER_EMAIL,
            "password": TEST_EMPLOYER_PASSWORD
        })
        
        if response.status_code != 200:
            pytest.skip("Could not authenticate as test employer")
        
        token = response.json().get("access_token")
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    @pytest.fixture(scope="class")
    def unvalidated_employer_session(self):
        """Get authenticated session for unvalidated employer"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        # Register new employer
        response = session.post(f"{BASE_URL}/api/auth/register", json={
            "email": UNVALIDATED_EMPLOYER_EMAIL,
            "password": UNVALIDATED_EMPLOYER_PASSWORD,
            "name": "Unvalidated Test Employer",
            "account_type": "employer"
        })
        
        if response.status_code not in [200, 201]:
            # Try login if already exists
            response = session.post(f"{BASE_URL}/api/auth/login", json={
                "email": UNVALIDATED_EMPLOYER_EMAIL,
                "password": UNVALIDATED_EMPLOYER_PASSWORD
            })
        
        if response.status_code != 200:
            pytest.skip("Could not create/authenticate unvalidated employer")
        
        token = response.json().get("access_token")
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    def test_list_jobs_authenticated(self, employer_session):
        """Test GET /api/portal/employer/jobs - List jobs for authenticated employer"""
        response = employer_session.get(f"{BASE_URL}/api/portal/employer/jobs")
        
        assert response.status_code == 200
        data = response.json()
        assert "jobs" in data
        assert isinstance(data["jobs"], list)
        print(f"✓ Listed {len(data['jobs'])} jobs")
    
    def test_list_jobs_unauthenticated(self):
        """Test GET /api/portal/employer/jobs - Unauthenticated returns 401"""
        response = requests.get(f"{BASE_URL}/api/portal/employer/jobs")
        assert response.status_code == 401
        print("✓ Unauthenticated access correctly denied")
    
    def test_create_job_validated_employer(self, employer_session):
        """Test POST /api/portal/employer/jobs - Create job with validated profile"""
        job_data = {
            "title": f"TEST_Job_{uuid.uuid4().hex[:8]}",
            "cor_code": "721401",
            "description": "Test job description for automated testing",
            "positions_count": 5,
            "industry": "Construcții",
            "work_location": "București, Sector 1",
            "salary_gross": "1000-1500 EUR",
            "contract_type": "permanent",
            "required_experience_years": 2,
            "preferred_gender": "any",
            "required_english_level": "basic",
            "accommodation_provided": True,
            "meals_provided": False,
            "transport_provided": True
        }
        
        response = employer_session.post(f"{BASE_URL}/api/portal/employer/jobs", json=job_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "job" in data
        assert data["job"]["title"] == job_data["title"]
        assert data["job"]["cor_code"] == job_data["cor_code"]
        assert data["job"]["positions_count"] == job_data["positions_count"]
        assert data["job"]["industry"] == job_data["industry"]
        assert data["job"]["work_location"] == job_data["work_location"]
        assert data["job"]["status"] == "draft"
        assert "job_id" in data["job"]
        
        # Store job_id for later tests
        self.__class__.created_job_id = data["job"]["job_id"]
        print(f"✓ Created job: {data['job']['job_id']}")
    
    def test_create_job_unvalidated_employer_no_profile(self, unvalidated_employer_session):
        """Test POST /api/portal/employer/jobs - Fails without profile"""
        job_data = {
            "title": "Should Fail Job",
            "cor_code": "123456",
            "positions_count": 1,
            "industry": "Construcții",
            "work_location": "București"
        }
        
        response = unvalidated_employer_session.post(f"{BASE_URL}/api/portal/employer/jobs", json=job_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "profile" in data["detail"].lower()
        print("✓ Job creation correctly rejected without profile")
    
    def test_create_job_unvalidated_employer_with_profile(self, unvalidated_employer_session):
        """Test POST /api/portal/employer/jobs - Fails with unvalidated profile"""
        # First create a profile
        profile_data = {
            "company_name": "Unvalidated Test Company SRL",
            "company_cui": f"RO{uuid.uuid4().hex[:8]}",
            "address": "Test Address"
        }
        unvalidated_employer_session.post(f"{BASE_URL}/api/portal/employer/profile", json=profile_data)
        
        # Now try to create a job
        job_data = {
            "title": "Should Fail Job",
            "cor_code": "123456",
            "positions_count": 1,
            "industry": "Construcții",
            "work_location": "București"
        }
        
        response = unvalidated_employer_session.post(f"{BASE_URL}/api/portal/employer/jobs", json=job_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "validated" in data["detail"].lower()
        print("✓ Job creation correctly rejected with unvalidated profile")
    
    def test_get_job_detail(self, employer_session):
        """Test GET /api/portal/employer/jobs/{job_id} - Get job details"""
        if not hasattr(self.__class__, 'created_job_id'):
            pytest.skip("No job created in previous test")
        
        job_id = self.__class__.created_job_id
        response = employer_session.get(f"{BASE_URL}/api/portal/employer/jobs/{job_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert "job" in data
        assert data["job"]["job_id"] == job_id
        assert "projects" in data  # Should include matched candidates
        print(f"✓ Retrieved job details for {job_id}")
    
    def test_get_job_detail_not_found(self, employer_session):
        """Test GET /api/portal/employer/jobs/{job_id} - Non-existent job returns 404"""
        response = employer_session.get(f"{BASE_URL}/api/portal/employer/jobs/job_nonexistent123")
        
        assert response.status_code == 404
        print("✓ Non-existent job correctly returns 404")
    
    def test_update_job(self, employer_session):
        """Test PUT /api/portal/employer/jobs/{job_id} - Update job"""
        if not hasattr(self.__class__, 'created_job_id'):
            pytest.skip("No job created in previous test")
        
        job_id = self.__class__.created_job_id
        update_data = {
            "title": f"UPDATED_TEST_Job_{uuid.uuid4().hex[:8]}",
            "cor_code": "654321",
            "description": "Updated test job description",
            "positions_count": 10,
            "industry": "Producție / Manufacturing",
            "work_location": "Cluj-Napoca",
            "salary_gross": "1500-2000 EUR",
            "contract_type": "seasonal",
            "contract_duration_months": 6,
            "required_experience_years": 3,
            "preferred_gender": "male",
            "required_english_level": "intermediate",
            "accommodation_provided": True,
            "meals_provided": True,
            "transport_provided": False
        }
        
        response = employer_session.put(f"{BASE_URL}/api/portal/employer/jobs/{job_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "job" in data
        assert data["job"]["title"] == update_data["title"]
        assert data["job"]["cor_code"] == update_data["cor_code"]
        assert data["job"]["positions_count"] == update_data["positions_count"]
        assert data["job"]["contract_type"] == update_data["contract_type"]
        assert data["job"]["contract_duration_months"] == update_data["contract_duration_months"]
        print(f"✓ Updated job {job_id}")
        
        # Verify update persisted
        get_response = employer_session.get(f"{BASE_URL}/api/portal/employer/jobs/{job_id}")
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data["job"]["title"] == update_data["title"]
        print("✓ Update verified via GET")
    
    def test_delete_job(self, employer_session):
        """Test DELETE /api/portal/employer/jobs/{job_id} - Cancel job"""
        if not hasattr(self.__class__, 'created_job_id'):
            pytest.skip("No job created in previous test")
        
        job_id = self.__class__.created_job_id
        response = employer_session.delete(f"{BASE_URL}/api/portal/employer/jobs/{job_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Cancelled job {job_id}")
        
        # Verify status changed to cancelled
        get_response = employer_session.get(f"{BASE_URL}/api/portal/employer/jobs/{job_id}")
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data["job"]["status"] == "cancelled"
        print("✓ Job status verified as 'cancelled'")
    
    def test_delete_job_not_found(self, employer_session):
        """Test DELETE /api/portal/employer/jobs/{job_id} - Non-existent job returns 404"""
        response = employer_session.delete(f"{BASE_URL}/api/portal/employer/jobs/job_nonexistent123")
        
        assert response.status_code == 404
        print("✓ Delete non-existent job correctly returns 404")


class TestJobRequestSearch:
    """Job Request search/filter tests"""
    
    @pytest.fixture(scope="class")
    def employer_session(self):
        """Get authenticated session for validated employer"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMPLOYER_EMAIL,
            "password": TEST_EMPLOYER_PASSWORD
        })
        
        if response.status_code != 200:
            pytest.skip("Could not authenticate as test employer")
        
        token = response.json().get("access_token")
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    def test_list_jobs_returns_all_employer_jobs(self, employer_session):
        """Test that job list returns all jobs for the employer"""
        response = employer_session.get(f"{BASE_URL}/api/portal/employer/jobs")
        
        assert response.status_code == 200
        data = response.json()
        assert "jobs" in data
        
        # All jobs should belong to the same employer
        if len(data["jobs"]) > 0:
            employer_id = data["jobs"][0]["employer_id"]
            for job in data["jobs"]:
                assert job["employer_id"] == employer_id
        
        print(f"✓ All {len(data['jobs'])} jobs belong to same employer")


class TestEmployerProfile:
    """Employer profile validation tests"""
    
    @pytest.fixture(scope="class")
    def employer_session(self):
        """Get authenticated session for validated employer"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMPLOYER_EMAIL,
            "password": TEST_EMPLOYER_PASSWORD
        })
        
        if response.status_code != 200:
            pytest.skip("Could not authenticate as test employer")
        
        token = response.json().get("access_token")
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    def test_get_employer_profile(self, employer_session):
        """Test GET /api/portal/employer/profile - Get employer profile"""
        response = employer_session.get(f"{BASE_URL}/api/portal/employer/profile")
        
        assert response.status_code == 200
        data = response.json()
        assert "profile" in data
        assert data["profile"]["status"] == "validated"
        print(f"✓ Employer profile status: {data['profile']['status']}")
    
    def test_employer_dashboard(self, employer_session):
        """Test GET /api/portal/employer/dashboard - Get dashboard stats"""
        response = employer_session.get(f"{BASE_URL}/api/portal/employer/dashboard")
        
        assert response.status_code == 200
        data = response.json()
        assert "has_profile" in data
        assert "profile_status" in data
        assert "total_jobs" in data or "open_jobs" in data
        print(f"✓ Dashboard: has_profile={data['has_profile']}, status={data['profile_status']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
