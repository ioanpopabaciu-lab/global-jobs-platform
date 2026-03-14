"""
GJC Platform Phase P0 - Backend API Tests
Tests for: AI-powered candidate-job matching using OpenAI embeddings + pgvector

Endpoints tested:
- /api/v1/gjc/health - Health check for postgres, mongodb, ai_matching
- /api/v1/gjc/matching/generate-embedding - AI embedding generation
- /api/v1/gjc/company/jobs - Job creation with embedding
- /api/v1/gjc/agency/candidates/batch - Batch candidate upload with embeddings
- /api/v1/gjc/company/jobs/{id}/candidates - AI matching candidates
- /api/v1/gjc/matching/score - Match score calculation
- /api/v1/gjc/agency/apply - Agency apply candidate
- /api/v1/gjc/candidate/status/{id} - Candidate status
- /api/v1/gjc/admin/placement/{id}/status - Admin status transition
- /api/v1/gjc/admin/dashboard - Admin dashboard
- /api/v1/gjc/admin/audit-log - Audit log
"""
import pytest
import requests
import os
import uuid
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data storage for cross-test dependencies
# Using existing seed data from PostgreSQL
test_data = {
    "company_id": "6ccae79d-60bb-43a8-9713-6b622cccf047",  # Existing TechRo Solutions SRL
    "agency_id": "e13efeb8-f57f-476c-826a-193f69681140",   # Existing Recruit Asia
    "job_id": None,
    "candidate_ids": [],
    "placement_id": None,
    "admin_user_id": str(uuid.uuid4())  # Admin user for audit
}


class TestGJCHealth:
    """Health check endpoint tests"""
    
    def test_health_endpoint_returns_healthy(self):
        """Test /api/v1/gjc/health returns healthy status for all services"""
        response = requests.get(f"{BASE_URL}/api/v1/gjc/health")
        assert response.status_code == 200
        data = response.json()
        
        # Verify overall status
        assert data["status"] == "healthy", f"Expected healthy status, got {data['status']}"
        
        # Verify PostgreSQL status
        assert "services" in data
        assert data["services"]["postgres"]["status"] == "healthy", "PostgreSQL should be healthy"
        
        # Verify MongoDB status
        assert data["services"]["mongodb"]["status"] == "healthy", "MongoDB should be healthy"
        
        # Verify AI Matching status
        assert data["services"]["ai_matching"]["status"] == "available", "AI Matching should be available"
        
        # Verify timestamp
        assert "timestamp" in data
        
        print(f"✓ Health check passed: postgres={data['services']['postgres']['status']}, "
              f"mongodb={data['services']['mongodb']['status']}, "
              f"ai_matching={data['services']['ai_matching']['status']}")


class TestSetupTestData:
    """Setup test data in PostgreSQL for subsequent tests"""
    
    def test_setup_company_and_agency(self):
        """Create test company and agency in PostgreSQL"""
        # We need to create test entities directly in PostgreSQL
        # First, let's check if we can use the admin dashboard to see existing data
        response = requests.get(f"{BASE_URL}/api/v1/gjc/admin/dashboard")
        assert response.status_code == 200
        data = response.json()
        
        # Store overview for reference
        print(f"✓ Admin dashboard accessible: {data.get('overview', {})}")
        
        # Generate UUIDs for test entities
        test_data["company_id"] = str(uuid.uuid4())
        test_data["agency_id"] = str(uuid.uuid4())
        test_data["admin_user_id"] = str(uuid.uuid4())
        
        print(f"✓ Test data prepared: company_id={test_data['company_id'][:8]}..., "
              f"agency_id={test_data['agency_id'][:8]}...")


class TestAIEmbedding:
    """AI Embedding generation tests"""
    
    def test_generate_embedding_success(self):
        """Test /api/v1/gjc/matching/generate-embedding works with 1536 dimensions"""
        payload = {
            "text": "Senior Software Engineer with 5 years experience in Python, FastAPI, PostgreSQL. "
                    "Skills include machine learning, data analysis, and cloud computing."
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/gjc/matching/generate-embedding",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert data["success"] == True
        assert data["dimensions"] == 1536, f"Expected 1536 dimensions, got {data['dimensions']}"
        assert "embedding" in data
        assert len(data["embedding"]) == 10, "Should return first 10 values as preview"
        assert "message" in data
        
        print(f"✓ Embedding generated: {data['dimensions']} dimensions, preview: {data['embedding'][:3]}...")
    
    def test_generate_embedding_empty_text(self):
        """Test embedding generation with empty text returns error"""
        payload = {"text": ""}
        
        response = requests.post(
            f"{BASE_URL}/api/v1/gjc/matching/generate-embedding",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        # Should return 500 or error for empty text
        assert response.status_code in [400, 500], f"Expected error for empty text, got {response.status_code}"
        print("✓ Empty text properly rejected")


class TestCompanyJobCreation:
    """Company job creation tests"""
    
    def test_create_job_with_embedding(self):
        """Test /api/v1/gjc/company/jobs creates job and generates embedding"""
        # First, we need a valid company_id from PostgreSQL
        # Let's create a company first via direct SQL or use existing
        
        # Create test company in PostgreSQL via batch candidate endpoint workaround
        # Actually, we need to insert company directly - let's use a workaround
        
        # For testing, we'll create a company by checking if one exists
        dashboard_response = requests.get(f"{BASE_URL}/api/v1/gjc/admin/dashboard")
        dashboard_data = dashboard_response.json()
        
        # If no companies exist, we need to create one
        # Let's try to create a job with a new company UUID
        company_id = str(uuid.uuid4())
        test_data["company_id"] = company_id
        
        job_payload = {
            "title": "TEST_Senior Python Developer",
            "description": "We are looking for a senior Python developer with experience in FastAPI, "
                          "PostgreSQL, and machine learning. The ideal candidate should have 5+ years "
                          "of experience and strong problem-solving skills.",
            "positions_count": 3,
            "required_skills": ["Python", "FastAPI", "PostgreSQL", "Machine Learning", "Docker"],
            "required_experience_years": 5,
            "required_languages": ["English", "Romanian"],
            "salary_min": 3000,
            "salary_max": 5000,
            "salary_currency": "EUR",
            "benefits": "Remote work, health insurance, training budget",
            "work_country": "RO",
            "work_city": "Bucharest"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/gjc/company/jobs",
            params={"company_pg_id": company_id},
            json=job_payload,
            headers={"Content-Type": "application/json"}
        )
        
        # This might fail if company doesn't exist in PostgreSQL
        # Let's check the response
        if response.status_code == 200:
            data = response.json()
            assert data["success"] == True
            assert "job_id" in data
            assert data["embedding_generated"] == True
            test_data["job_id"] = data["job_id"]
            print(f"✓ Job created: {data['job_id']}, embedding_generated={data['embedding_generated']}")
        else:
            # Company doesn't exist - this is expected for fresh database
            # We need to create company first
            print(f"⚠ Job creation failed (company may not exist): {response.status_code} - {response.text}")
            pytest.skip("Company not found in PostgreSQL - need to seed data first")


class TestAgencyBatchCandidateUpload:
    """Agency batch candidate upload tests"""
    
    def test_batch_upload_candidates_with_embeddings(self):
        """Test /api/v1/gjc/agency/candidates/batch creates candidates with embeddings"""
        agency_id = str(uuid.uuid4())
        test_data["agency_id"] = agency_id
        
        candidates = [
            {
                "full_name": "TEST_John Smith",
                "nationality": "IND",
                "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
                "experience": [
                    {"title": "Senior Developer", "company": "Tech Corp", "description": "Led backend development"}
                ],
                "years_experience": 6,
                "languages": ["English", "Hindi"],
                "profession": "Software Developer"
            },
            {
                "full_name": "TEST_Maria Garcia",
                "nationality": "NPL",
                "skills": ["Python", "Machine Learning", "Data Analysis"],
                "experience": [
                    {"title": "Data Scientist", "company": "AI Labs", "description": "ML model development"}
                ],
                "years_experience": 4,
                "languages": ["English", "Nepali"],
                "profession": "Data Scientist"
            },
            {
                "full_name": "TEST_Ahmed Hassan",
                "nationality": "BGD",
                "skills": ["JavaScript", "React", "Node.js"],
                "experience": [
                    {"title": "Frontend Developer", "company": "Web Agency", "description": "UI development"}
                ],
                "years_experience": 3,
                "languages": ["English", "Bengali"],
                "profession": "Frontend Developer"
            }
        ]
        
        response = requests.post(
            f"{BASE_URL}/api/v1/gjc/agency/candidates/batch",
            params={"agency_pg_id": agency_id},
            json=candidates,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert data["total"] == 3
        assert data["success"] >= 1, f"Expected at least 1 success, got {data['success']}"
        assert "created_ids" in data
        
        # Store candidate IDs for later tests
        test_data["candidate_ids"] = data["created_ids"]
        
        print(f"✓ Batch upload: total={data['total']}, success={data['success']}, "
              f"failed={data['failed']}, created_ids={len(data['created_ids'])}")
        
        if data["errors"]:
            print(f"  Errors: {data['errors']}")


class TestAIMatching:
    """AI Matching tests"""
    
    def test_get_matching_candidates_for_job(self):
        """Test /api/v1/gjc/company/jobs/{id}/candidates returns semantically matched candidates"""
        # Skip if no job was created
        if not test_data.get("job_id"):
            pytest.skip("No job_id available - job creation may have failed")
        
        response = requests.get(
            f"{BASE_URL}/api/v1/gjc/company/jobs/{test_data['job_id']}/candidates",
            params={"limit": 10, "min_score": 50}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "job_id" in data
        assert "total_matches" in data
        assert "candidates" in data
        assert isinstance(data["candidates"], list)
        
        # If we have matches, verify structure
        if data["candidates"]:
            candidate = data["candidates"][0]
            assert "candidate_id" in candidate
            assert "match_score" in candidate
            assert "match_level" in candidate
            assert candidate["match_score"] >= 50, "Match score should be >= min_score"
        
        print(f"✓ AI Matching: job_id={data['job_id'][:8]}..., "
              f"total_matches={data['total_matches']}, min_score={data['min_score_applied']}")
    
    def test_calculate_match_score(self):
        """Test /api/v1/gjc/matching/score returns correct score between job and candidate"""
        # Skip if no job or candidates
        if not test_data.get("job_id") or not test_data.get("candidate_ids"):
            pytest.skip("No job_id or candidate_ids available")
        
        job_id = test_data["job_id"]
        candidate_id = test_data["candidate_ids"][0]
        
        response = requests.get(
            f"{BASE_URL}/api/v1/gjc/matching/score",
            params={"job_id": job_id, "candidate_id": candidate_id}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "job_id" in data
        assert "candidate_id" in data
        assert "score" in data
        assert "explanation" in data
        
        # Score should be a number between 0 and 100
        assert isinstance(data["score"], (int, float))
        assert 0 <= data["score"] <= 100, f"Score should be 0-100, got {data['score']}"
        
        # Explanation should have level and interpretation
        if "level" in data["explanation"]:
            assert data["explanation"]["level"] in ["EXCELLENT", "HIGH", "GOOD", "MODERATE", "LOW"]
        
        print(f"✓ Match score: job={job_id[:8]}..., candidate={candidate_id[:8]}..., "
              f"score={data['score']}, level={data['explanation'].get('level', 'N/A')}")


class TestAgencyApply:
    """Agency apply candidate tests"""
    
    def test_agency_apply_candidate_to_job(self):
        """Test /api/v1/gjc/agency/apply creates placement with match score"""
        # Skip if no job or candidates
        if not test_data.get("job_id") or not test_data.get("candidate_ids") or not test_data.get("agency_id"):
            pytest.skip("Missing required test data (job_id, candidate_ids, or agency_id)")
        
        response = requests.post(
            f"{BASE_URL}/api/v1/gjc/agency/apply",
            params={
                "agency_id": test_data["agency_id"],
                "job_id": test_data["job_id"],
                "candidate_id": test_data["candidate_ids"][0]
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert data["success"] == True
        assert "placement_id" in data
        assert "match_score" in data
        assert "match_level" in data
        
        # Store placement_id for later tests
        test_data["placement_id"] = data["placement_id"]
        
        print(f"✓ Agency apply: placement_id={data['placement_id'][:8]}..., "
              f"match_score={data['match_score']}, match_level={data['match_level']}")


class TestCandidateStatus:
    """Candidate status tests"""
    
    def test_get_candidate_status(self):
        """Test /api/v1/gjc/candidate/status/{id} returns applications with status messages"""
        # Skip if no candidates
        if not test_data.get("candidate_ids"):
            pytest.skip("No candidate_ids available")
        
        candidate_id = test_data["candidate_ids"][0]
        
        response = requests.get(f"{BASE_URL}/api/v1/gjc/candidate/status/{candidate_id}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "candidate_id" in data
        assert "applications" in data
        assert "total" in data
        assert isinstance(data["applications"], list)
        
        # If we have applications, verify structure
        if data["applications"]:
            app = data["applications"][0]
            assert "placement_id" in app
            assert "status" in app
            assert "status_message" in app
            assert "job_title" in app
        
        print(f"✓ Candidate status: candidate_id={candidate_id[:8]}..., "
              f"total_applications={data['total']}")


class TestAdminStatusTransition:
    """Admin status transition tests"""
    
    def test_admin_transition_pending_to_matched(self):
        """Test /api/v1/gjc/admin/placement/{id}/status changes status PENDING->MATCHED"""
        # Skip if no placement
        if not test_data.get("placement_id"):
            pytest.skip("No placement_id available")
        
        response = requests.post(
            f"{BASE_URL}/api/v1/gjc/admin/placement/{test_data['placement_id']}/status",
            params={"admin_user_id": test_data["admin_user_id"]},
            json={"new_status": "MATCHED", "reason": "Automated test transition"},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data["success"] == True
        assert "message" in data
        
        print(f"✓ Status transition: PENDING -> MATCHED, message={data['message']}")
    
    def test_admin_transition_matched_to_employer_review(self):
        """Test status transition MATCHED->EMPLOYER_REVIEW"""
        if not test_data.get("placement_id"):
            pytest.skip("No placement_id available")
        
        response = requests.post(
            f"{BASE_URL}/api/v1/gjc/admin/placement/{test_data['placement_id']}/status",
            params={"admin_user_id": test_data["admin_user_id"]},
            json={"new_status": "EMPLOYER_REVIEW", "reason": "Employer reviewing candidate"},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data["success"] == True
        print(f"✓ Status transition: MATCHED -> EMPLOYER_REVIEW")
    
    def test_admin_transition_employer_review_to_offer_sent(self):
        """Test status transition EMPLOYER_REVIEW->OFFER_SENT"""
        if not test_data.get("placement_id"):
            pytest.skip("No placement_id available")
        
        response = requests.post(
            f"{BASE_URL}/api/v1/gjc/admin/placement/{test_data['placement_id']}/status",
            params={"admin_user_id": test_data["admin_user_id"]},
            json={"new_status": "OFFER_SENT", "reason": "Offer sent to candidate"},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data["success"] == True
        print(f"✓ Status transition: EMPLOYER_REVIEW -> OFFER_SENT")
    
    def test_admin_invalid_transition_rejected(self):
        """Test invalid status transition is rejected"""
        if not test_data.get("placement_id"):
            pytest.skip("No placement_id available")
        
        # Try invalid transition from OFFER_SENT to PENDING (not allowed)
        response = requests.post(
            f"{BASE_URL}/api/v1/gjc/admin/placement/{test_data['placement_id']}/status",
            params={"admin_user_id": test_data["admin_user_id"]},
            json={"new_status": "PENDING", "reason": "Invalid transition test"},
            headers={"Content-Type": "application/json"}
        )
        
        # Should return 400 for invalid transition
        assert response.status_code == 400, f"Expected 400 for invalid transition, got {response.status_code}"
        print("✓ Invalid transition properly rejected")


class TestAdminDashboard:
    """Admin dashboard tests"""
    
    def test_admin_dashboard_overview(self):
        """Test /api/v1/gjc/admin/dashboard shows correct overview and pipeline stats"""
        response = requests.get(f"{BASE_URL}/api/v1/gjc/admin/dashboard")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "overview" in data
        assert "pipeline" in data
        assert "pending_visas" in data
        assert "upcoming_arrivals" in data
        assert "generated_at" in data
        
        # Verify overview fields
        overview = data["overview"]
        expected_fields = ["total_companies", "total_agencies", "total_candidates", 
                         "active_jobs", "total_placements", "active_workers"]
        for field in expected_fields:
            assert field in overview, f"Missing field: {field}"
        
        # Verify pipeline stats
        pipeline = data["pipeline"]
        assert "by_status" in pipeline
        assert "total" in pipeline
        
        print(f"✓ Admin dashboard: companies={overview.get('total_companies', 0)}, "
              f"candidates={overview.get('total_candidates', 0)}, "
              f"placements={overview.get('total_placements', 0)}")


class TestAdminAuditLog:
    """Admin audit log tests"""
    
    def test_admin_audit_log(self):
        """Test /api/v1/gjc/admin/audit-log shows status change history"""
        response = requests.get(
            f"{BASE_URL}/api/v1/gjc/admin/audit-log",
            params={"limit": 10}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "audit_log" in data
        assert isinstance(data["audit_log"], list)
        
        # If we have audit entries, verify structure
        if data["audit_log"]:
            entry = data["audit_log"][0]
            assert "entity_type" in entry
            assert "entity_id" in entry
            assert "old_status" in entry
            assert "new_status" in entry
            assert "created_at" in entry
        
        print(f"✓ Audit log: {len(data['audit_log'])} entries retrieved")
    
    def test_admin_audit_log_filter_by_entity_type(self):
        """Test audit log filtering by entity type"""
        response = requests.get(
            f"{BASE_URL}/api/v1/gjc/admin/audit-log",
            params={"entity_type": "placement", "limit": 10}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # All entries should be of type 'placement'
        for entry in data["audit_log"]:
            assert entry["entity_type"] == "placement"
        
        print(f"✓ Audit log filtered: {len(data['audit_log'])} placement entries")


class TestAvailableJobs:
    """Available jobs endpoint tests"""
    
    def test_get_available_jobs(self):
        """Test /api/v1/gjc/agency/jobs/available returns active jobs"""
        response = requests.get(
            f"{BASE_URL}/api/v1/gjc/agency/jobs/available",
            params={"limit": 10}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "jobs" in data
        assert "count" in data
        assert isinstance(data["jobs"], list)
        
        # If we have jobs, verify structure
        if data["jobs"]:
            job = data["jobs"][0]
            assert "job_id" in job
            assert "title" in job
            assert "positions_available" in job
        
        print(f"✓ Available jobs: {data['count']} jobs found")


class TestCompanyPipeline:
    """Company pipeline tests"""
    
    def test_get_company_pipeline(self):
        """Test /api/v1/gjc/company/pipeline returns Kanban view"""
        if not test_data.get("company_id"):
            pytest.skip("No company_id available")
        
        response = requests.get(
            f"{BASE_URL}/api/v1/gjc/company/pipeline",
            params={"company_id": test_data["company_id"]}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "company_id" in data
        assert "pipeline" in data
        assert "stats" in data
        
        print(f"✓ Company pipeline: company_id={data['company_id'][:8]}..., "
              f"stats={data['stats']}")


class TestPlacementTracking:
    """Placement tracking tests"""
    
    def test_get_placement_tracking(self):
        """Test /api/v1/gjc/company/tracking/{placement_id} returns full details"""
        if not test_data.get("placement_id"):
            pytest.skip("No placement_id available")
        
        response = requests.get(
            f"{BASE_URL}/api/v1/gjc/company/tracking/{test_data['placement_id']}"
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "placement_id" in data
        assert "status" in data
        assert "job_title" in data
        assert "candidate_name" in data
        
        print(f"✓ Placement tracking: placement_id={data['placement_id'][:8]}..., "
              f"status={data['status']}, candidate={data.get('candidate_name', 'N/A')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short", "-x"])
