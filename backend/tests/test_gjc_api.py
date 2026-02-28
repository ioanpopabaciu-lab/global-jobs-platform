"""
Global Jobs Consulting API Tests
Tests for: health, stats, blog, contact, employers, candidates, and Paula chat endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndStats:
    """Health check and statistics endpoint tests"""
    
    def test_root_endpoint(self):
        """Test root API endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Global Jobs Consulting" in data["message"]
        print(f"✓ Root endpoint working: {data['message']}")
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        print(f"✓ Health check passed: {data['status']}")
    
    def test_stats_endpoint(self):
        """Test statistics endpoint"""
        response = requests.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert "employers" in data
        assert "candidates" in data
        assert "contacts" in data
        assert data["partner_countries"] == 11
        assert data["experience_years"] == 4
        assert data["continents"] == 2
        print(f"✓ Stats endpoint working: {data}")


class TestBlogEndpoints:
    """Blog posts endpoint tests"""
    
    def test_init_sample_posts(self):
        """Test initializing sample blog posts"""
        response = requests.post(f"{BASE_URL}/api/blog/init-sample")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Blog init: {data['message']}")
    
    def test_get_blog_posts(self):
        """Test getting all blog posts"""
        response = requests.get(f"{BASE_URL}/api/blog/posts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify post structure
        post = data[0]
        assert "id" in post
        assert "title" in post
        assert "slug" in post
        assert "excerpt" in post
        assert "content" in post
        print(f"✓ Blog posts retrieved: {len(data)} posts")
    
    def test_get_blog_post_by_slug(self):
        """Test getting a specific blog post by slug"""
        # First get all posts to find a valid slug
        posts_response = requests.get(f"{BASE_URL}/api/blog/posts")
        posts = posts_response.json()
        if posts:
            slug = posts[0]["slug"]
            response = requests.get(f"{BASE_URL}/api/blog/posts/{slug}")
            assert response.status_code == 200
            data = response.json()
            assert data["slug"] == slug
            print(f"✓ Blog post by slug retrieved: {data['title']}")
    
    def test_get_nonexistent_blog_post(self):
        """Test getting a non-existent blog post returns 404"""
        response = requests.get(f"{BASE_URL}/api/blog/posts/nonexistent-slug-12345")
        assert response.status_code == 404
        print("✓ Non-existent blog post returns 404")


class TestContactEndpoint:
    """Contact form submission tests"""
    
    def test_submit_contact_form(self):
        """Test submitting a contact form"""
        unique_id = str(uuid.uuid4())[:8]
        payload = {
            "name": f"TEST_Contact User {unique_id}",
            "email": f"test_{unique_id}@example.com",
            "phone": "+40700000000",
            "subject": "Test Subject",
            "message": "This is a test message from automated testing."
        }
        response = requests.post(
            f"{BASE_URL}/api/contact/submit",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert "id" in data
        print(f"✓ Contact form submitted: {data['id']}")
    
    def test_submit_contact_form_missing_fields(self):
        """Test contact form with missing required fields"""
        payload = {
            "name": "Test User",
            # Missing email, phone, subject, message
        }
        response = requests.post(
            f"{BASE_URL}/api/contact/submit",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422  # Validation error
        print("✓ Contact form validation working (missing fields rejected)")


class TestEmployerEndpoints:
    """Employer form submission tests"""
    
    def test_submit_employer_form(self):
        """Test submitting an employer form"""
        unique_id = str(uuid.uuid4())[:8]
        payload = {
            "company_name": f"TEST_Company {unique_id}",
            "contact_person": f"Test Person {unique_id}",
            "email": f"employer_{unique_id}@example.com",
            "phone": "+40700000001",
            "country": "RO",
            "industry": "constructii",
            "workers_needed": 10,
            "qualification_type": "calificat",
            "salary_offered": "1000-1500 EUR",
            "accommodation_provided": True,
            "meals_provided": False,
            "message": "Test employer submission"
        }
        response = requests.post(
            f"{BASE_URL}/api/employers/submit",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["company_name"] == payload["company_name"]
        assert data["workers_needed"] == payload["workers_needed"]
        assert "id" in data
        print(f"✓ Employer form submitted: {data['id']}")
    
    def test_get_employer_submissions(self):
        """Test getting employer submissions list"""
        response = requests.get(f"{BASE_URL}/api/employers/submissions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Employer submissions retrieved: {len(data)} submissions")


class TestCandidateEndpoints:
    """Candidate form submission tests"""
    
    def test_submit_candidate_form(self):
        """Test submitting a candidate form (multipart/form-data)"""
        unique_id = str(uuid.uuid4())[:8]
        form_data = {
            "full_name": f"TEST_Candidate {unique_id}",
            "email": f"candidate_{unique_id}@example.com",
            "phone": "+8801700000000",
            "whatsapp": "+8801700000000",
            "citizenship": "bangladesh",
            "experience_years": "3",
            "english_level": "mediu",
            "industry_preference": "constructii",
            "message": "Test candidate submission"
        }
        response = requests.post(
            f"{BASE_URL}/api/candidates/submit",
            data=form_data
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "id" in data
        print(f"✓ Candidate form submitted: {data['id']}")
    
    def test_get_candidate_submissions(self):
        """Test getting candidate submissions list"""
        response = requests.get(f"{BASE_URL}/api/candidates/submissions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Candidate submissions retrieved: {len(data)} submissions")


class TestPaulaChatEndpoint:
    """Paula AI Chat assistant tests"""
    
    def test_paula_chat_romanian(self):
        """Test Paula chat in Romanian"""
        payload = {
            "message": "Ce servicii oferiti?",
            "session_id": f"test_ro_{uuid.uuid4()}",
            "language": "ro"
        }
        response = requests.post(
            f"{BASE_URL}/api/chat/paula",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30  # AI responses may take time
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "session_id" in data
        assert len(data["response"]) > 0
        print(f"✓ Paula chat (RO) working: {data['response'][:100]}...")
    
    def test_paula_chat_english(self):
        """Test Paula chat in English"""
        payload = {
            "message": "What services do you offer?",
            "session_id": f"test_en_{uuid.uuid4()}",
            "language": "en"
        }
        response = requests.post(
            f"{BASE_URL}/api/chat/paula",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert len(data["response"]) > 0
        print(f"✓ Paula chat (EN) working: {data['response'][:100]}...")
    
    def test_paula_chat_german(self):
        """Test Paula chat in German"""
        payload = {
            "message": "Welche Dienstleistungen bieten Sie an?",
            "session_id": f"test_de_{uuid.uuid4()}",
            "language": "de"
        }
        response = requests.post(
            f"{BASE_URL}/api/chat/paula",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert len(data["response"]) > 0
        print(f"✓ Paula chat (DE) working: {data['response'][:100]}...")
    
    def test_paula_chat_serbian(self):
        """Test Paula chat in Serbian"""
        payload = {
            "message": "Koje usluge nudite?",
            "session_id": f"test_sr_{uuid.uuid4()}",
            "language": "sr"
        }
        response = requests.post(
            f"{BASE_URL}/api/chat/paula",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert len(data["response"]) > 0
        print(f"✓ Paula chat (SR) working: {data['response'][:100]}...")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
