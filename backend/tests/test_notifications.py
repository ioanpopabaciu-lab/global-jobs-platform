"""
Notification System Tests for GJC Platform
Tests for: notification API endpoints, matching algorithm, profile validation triggers
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from previous iterations
TEST_CANDIDATE = {"email": "test.candidate@example.com", "password": "test123"}
TEST_EMPLOYER = {"email": "test.employer@example.com", "password": "test123"}
TEST_ADMIN = {"email": "admin@gjc.ro", "password": "admin123"}


class TestNotificationEndpoints:
    """Test notification API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as candidate and get session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as candidate
        response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json=TEST_CANDIDATE
        )
        if response.status_code != 200:
            pytest.skip(f"Candidate login failed: {response.status_code}")
        
        self.candidate_user = response.json().get("user", {})
        print(f"✓ Logged in as candidate: {self.candidate_user.get('email')}")
    
    def test_get_notifications_list(self):
        """Test GET /api/notifications - list user notifications"""
        response = self.session.get(f"{BASE_URL}/api/notifications")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "notifications" in data, "Response should contain 'notifications' key"
        assert "unread_count" in data, "Response should contain 'unread_count' key"
        assert "total" in data, "Response should contain 'total' key"
        assert isinstance(data["notifications"], list), "notifications should be a list"
        
        print(f"✓ GET /api/notifications - Found {data['total']} notifications, {data['unread_count']} unread")
        
        # If there are notifications, verify structure
        if data["notifications"]:
            notif = data["notifications"][0]
            assert "notification_id" in notif, "Notification should have notification_id"
            assert "title" in notif, "Notification should have title"
            assert "message" in notif, "Notification should have message"
            assert "type" in notif, "Notification should have type"
            assert "is_read" in notif, "Notification should have is_read"
            assert "created_at" in notif, "Notification should have created_at"
            print(f"✓ Notification structure verified: {notif['title'][:50]}...")
    
    def test_get_notifications_unread_only(self):
        """Test GET /api/notifications?unread_only=true"""
        response = self.session.get(f"{BASE_URL}/api/notifications?unread_only=true")
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned notifications should be unread
        for notif in data["notifications"]:
            assert notif["is_read"] == False, "All notifications should be unread when unread_only=true"
        
        print(f"✓ GET /api/notifications?unread_only=true - Found {len(data['notifications'])} unread notifications")
    
    def test_get_unread_count(self):
        """Test GET /api/notifications/unread-count"""
        response = self.session.get(f"{BASE_URL}/api/notifications/unread-count")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "unread_count" in data, "Response should contain 'unread_count'"
        assert isinstance(data["unread_count"], int), "unread_count should be an integer"
        assert data["unread_count"] >= 0, "unread_count should be non-negative"
        
        print(f"✓ GET /api/notifications/unread-count - Count: {data['unread_count']}")
    
    def test_mark_notification_read(self):
        """Test PUT /api/notifications/{id}/read"""
        # First get notifications to find one to mark as read
        list_response = self.session.get(f"{BASE_URL}/api/notifications")
        notifications = list_response.json().get("notifications", [])
        
        if not notifications:
            pytest.skip("No notifications to test mark as read")
        
        # Find an unread notification or use the first one
        notif_id = None
        for n in notifications:
            if not n["is_read"]:
                notif_id = n["notification_id"]
                break
        
        if not notif_id:
            notif_id = notifications[0]["notification_id"]
        
        # Mark as read
        response = self.session.put(f"{BASE_URL}/api/notifications/{notif_id}/read")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "message" in data
        
        print(f"✓ PUT /api/notifications/{notif_id}/read - Marked as read")
        
        # Verify it's now read
        verify_response = self.session.get(f"{BASE_URL}/api/notifications")
        for n in verify_response.json()["notifications"]:
            if n["notification_id"] == notif_id:
                assert n["is_read"] == True, "Notification should be marked as read"
                print(f"✓ Verified notification is now read")
                break
    
    def test_mark_all_notifications_read(self):
        """Test PUT /api/notifications/read-all"""
        response = self.session.put(f"{BASE_URL}/api/notifications/read-all")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        
        print(f"✓ PUT /api/notifications/read-all - {data['message']}")
        
        # Verify unread count is now 0
        count_response = self.session.get(f"{BASE_URL}/api/notifications/unread-count")
        assert count_response.json()["unread_count"] == 0, "Unread count should be 0 after marking all read"
        print(f"✓ Verified unread count is now 0")
    
    def test_notification_not_found(self):
        """Test marking non-existent notification as read returns 404"""
        fake_id = f"notif_nonexistent_{uuid.uuid4().hex[:8]}"
        response = self.session.put(f"{BASE_URL}/api/notifications/{fake_id}/read")
        
        assert response.status_code == 404, f"Expected 404 for non-existent notification, got {response.status_code}"
        print(f"✓ Non-existent notification returns 404")


class TestNotificationEndpointsUnauthorized:
    """Test notification endpoints without authentication"""
    
    def test_get_notifications_unauthorized(self):
        """Test GET /api/notifications without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ GET /api/notifications without auth returns 401")
    
    def test_get_unread_count_unauthorized(self):
        """Test GET /api/notifications/unread-count without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/notifications/unread-count")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ GET /api/notifications/unread-count without auth returns 401")
    
    def test_mark_read_unauthorized(self):
        """Test PUT /api/notifications/{id}/read without auth returns 401"""
        response = requests.put(f"{BASE_URL}/api/notifications/fake_id/read")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ PUT /api/notifications/{id}/read without auth returns 401")


class TestEmployerNotifications:
    """Test notification endpoints for employer user"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as employer and get session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as employer
        response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json=TEST_EMPLOYER
        )
        if response.status_code != 200:
            pytest.skip(f"Employer login failed: {response.status_code}")
        
        self.employer_user = response.json().get("user", {})
        print(f"✓ Logged in as employer: {self.employer_user.get('email')}")
    
    def test_employer_get_notifications(self):
        """Test employer can get their notifications"""
        response = self.session.get(f"{BASE_URL}/api/notifications")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "notifications" in data
        assert "unread_count" in data
        
        print(f"✓ Employer notifications - Found {data['total']} notifications, {data['unread_count']} unread")
    
    def test_employer_get_unread_count(self):
        """Test employer can get unread count"""
        response = self.session.get(f"{BASE_URL}/api/notifications/unread-count")
        
        assert response.status_code == 200
        data = response.json()
        assert "unread_count" in data
        
        print(f"✓ Employer unread count: {data['unread_count']}")


class TestAdminProfileValidationNotifications:
    """Test that profile validation triggers notifications"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as admin"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json=TEST_ADMIN
        )
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.status_code}")
        
        self.admin_user = response.json().get("user", {})
        print(f"✓ Logged in as admin: {self.admin_user.get('email')}")
    
    def test_admin_dashboard_access(self):
        """Test admin can access dashboard"""
        response = self.session.get(f"{BASE_URL}/api/admin/dashboard")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "users" in data
        assert "profiles" in data
        assert "projects" in data
        
        print(f"✓ Admin dashboard - Users: {data['users']['total']}, Pending candidates: {data['profiles']['pending_candidates']}")
    
    def test_admin_list_candidates(self):
        """Test admin can list candidates"""
        response = self.session.get(f"{BASE_URL}/api/admin/candidates")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "candidates" in data
        assert "total" in data
        
        print(f"✓ Admin candidates list - Total: {data['total']}")
        return data["candidates"]
    
    def test_admin_list_employers(self):
        """Test admin can list employers"""
        response = self.session.get(f"{BASE_URL}/api/admin/employers")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "employers" in data
        assert "total" in data
        
        print(f"✓ Admin employers list - Total: {data['total']}")


class TestMatchingAlgorithm:
    """Test the candidate-job matching algorithm via admin endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as admin"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json=TEST_ADMIN
        )
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.status_code}")
        
        print(f"✓ Logged in as admin for matching tests")
    
    def test_admin_list_jobs(self):
        """Test admin can list all jobs"""
        response = self.session.get(f"{BASE_URL}/api/admin/jobs")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "jobs" in data
        assert "total" in data
        
        print(f"✓ Admin jobs list - Total: {data['total']}")
        
        if data["jobs"]:
            job = data["jobs"][0]
            assert "job_id" in job
            print(f"✓ First job: {job.get('title', 'N/A')} (ID: {job['job_id']})")
            return job["job_id"]
        return None
    
    def test_find_matching_candidates_for_job(self):
        """Test finding matching candidates for a job"""
        # First get a job ID
        jobs_response = self.session.get(f"{BASE_URL}/api/admin/jobs")
        jobs = jobs_response.json().get("jobs", [])
        
        if not jobs:
            pytest.skip("No jobs available to test matching")
        
        job_id = jobs[0]["job_id"]
        
        # Find matching candidates
        response = self.session.get(f"{BASE_URL}/api/admin/matching/candidates/{job_id}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "job" in data
        assert "matches" in data
        
        print(f"✓ Matching candidates for job '{data['job'].get('title', 'N/A')}': {len(data['matches'])} matches found")
        
        # Verify match structure if matches exist
        if data["matches"]:
            match = data["matches"][0]
            assert "candidate" in match
            assert "score" in match
            assert isinstance(match["score"], int)
            assert 0 <= match["score"] <= 100
            print(f"✓ Top match score: {match['score']}%")


class TestNotificationDelete:
    """Test notification deletion endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as candidate"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json=TEST_CANDIDATE
        )
        if response.status_code != 200:
            pytest.skip(f"Candidate login failed: {response.status_code}")
        
        print(f"✓ Logged in as candidate for delete tests")
    
    def test_delete_notification(self):
        """Test DELETE /api/notifications/{id}"""
        # Get notifications first
        list_response = self.session.get(f"{BASE_URL}/api/notifications")
        notifications = list_response.json().get("notifications", [])
        
        if not notifications:
            pytest.skip("No notifications to delete")
        
        notif_id = notifications[0]["notification_id"]
        initial_count = len(notifications)
        
        # Delete notification
        response = self.session.delete(f"{BASE_URL}/api/notifications/{notif_id}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify deletion
        verify_response = self.session.get(f"{BASE_URL}/api/notifications")
        new_count = len(verify_response.json()["notifications"])
        
        assert new_count == initial_count - 1, "Notification count should decrease by 1"
        print(f"✓ DELETE /api/notifications/{notif_id} - Notification deleted")
    
    def test_delete_nonexistent_notification(self):
        """Test deleting non-existent notification returns 404"""
        fake_id = f"notif_fake_{uuid.uuid4().hex[:8]}"
        response = self.session.delete(f"{BASE_URL}/api/notifications/{fake_id}")
        
        assert response.status_code == 404
        print(f"✓ DELETE non-existent notification returns 404")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
