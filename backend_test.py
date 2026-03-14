#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
from pathlib import Path

class GlobalJobsAPITester:
    def __init__(self, base_url="https://visa-relocation-hub.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'} if not files else {}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:500]}")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:500]
                })

            return success, response.json() if success and response.content else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            return False, {}

    def test_health_endpoints(self):
        """Test basic health and info endpoints"""
        print("\n" + "="*50)
        print("TESTING HEALTH ENDPOINTS")
        print("="*50)
        
        self.run_test("API Root", "GET", "", 200)
        self.run_test("Health Check", "GET", "health", 200)

    def test_employer_endpoints(self):
        """Test employer form submission"""
        print("\n" + "="*50)
        print("TESTING EMPLOYER ENDPOINTS")
        print("="*50)
        
        # Test employer form submission
        employer_data = {
            "company_name": "Test Company SRL",
            "contact_person": "John Doe",
            "email": "test@company.com",
            "phone": "+40123456789",
            "country": "RO",
            "industry": "constructii",
            "workers_needed": 10,
            "qualification_type": "calificat",
            "salary_offered": "800-1200 EUR",
            "accommodation_provided": True,
            "meals_provided": False,
            "message": "We need experienced construction workers for our project in Bucharest."
        }
        
        success, response = self.run_test(
            "Submit Employer Form",
            "POST",
            "employers/submit",
            200,
            data=employer_data
        )
        
        if success:
            print(f"   Employer ID: {response.get('id', 'N/A')}")
        
        # Test get employer submissions
        self.run_test("Get Employer Submissions", "GET", "employers/submissions", 200)

    def test_candidate_endpoints(self):
        """Test candidate form submission with file upload"""
        print("\n" + "="*50)
        print("TESTING CANDIDATE ENDPOINTS")
        print("="*50)
        
        # Create a test CV file
        test_cv_content = b"Test CV Content - This is a sample CV for testing purposes."
        
        candidate_data = {
            "full_name": "Jane Smith",
            "email": "jane.smith@email.com",
            "phone": "+40987654321",
            "whatsapp": "+40987654321",
            "citizenship": "bangladesh",
            "experience_years": "5",
            "english_level": "mediu",
            "industry_preference": "horeca",
            "video_cv_url": "https://youtube.com/watch?v=test123",
            "message": "I am an experienced chef looking for opportunities in Europe."
        }
        
        files = {
            'cv_file': ('test_cv.pdf', test_cv_content, 'application/pdf')
        }
        
        success, response = self.run_test(
            "Submit Candidate Form with CV",
            "POST",
            "candidates/submit",
            200,
            data=candidate_data,
            files=files
        )
        
        if success:
            print(f"   Candidate ID: {response.get('id', 'N/A')}")
        
        # Test get candidate submissions
        self.run_test("Get Candidate Submissions", "GET", "candidates/submissions", 200)

    def test_contact_endpoints(self):
        """Test contact form submission"""
        print("\n" + "="*50)
        print("TESTING CONTACT ENDPOINTS")
        print("="*50)
        
        contact_data = {
            "name": "Maria Popescu",
            "email": "maria.popescu@email.com",
            "phone": "+40765432109",
            "subject": "Întrebare despre servicii",
            "message": "Aș dori să aflu mai multe informații despre procesul de recrutare pentru industria HoReCa."
        }
        
        success, response = self.run_test(
            "Submit Contact Form",
            "POST",
            "contact/submit",
            200,
            data=contact_data
        )
        
        if success:
            print(f"   Contact ID: {response.get('id', 'N/A')}")

    def test_blog_endpoints(self):
        """Test blog endpoints"""
        print("\n" + "="*50)
        print("TESTING BLOG ENDPOINTS")
        print("="*50)
        
        # Initialize sample blog posts
        self.run_test("Initialize Sample Blog Posts", "POST", "blog/init-sample", 200)
        
        # Get blog posts
        success, response = self.run_test("Get Blog Posts", "GET", "blog/posts", 200)
        
        if success and response:
            posts = response
            print(f"   Found {len(posts)} blog posts")
            
            # Test getting a specific blog post by slug
            if posts:
                first_post_slug = posts[0].get('slug')
                if first_post_slug:
                    self.run_test(
                        f"Get Blog Post by Slug",
                        "GET",
                        f"blog/posts/{first_post_slug}",
                        200
                    )

    def test_stats_endpoint(self):
        """Test statistics endpoint"""
        print("\n" + "="*50)
        print("TESTING STATS ENDPOINT")
        print("="*50)
        
        success, response = self.run_test("Get Statistics", "GET", "stats", 200)
        
        if success:
            print(f"   Stats: {json.dumps(response, indent=2)}")

    def test_error_cases(self):
        """Test error handling"""
        print("\n" + "="*50)
        print("TESTING ERROR CASES")
        print("="*50)
        
        # Test invalid employer data
        invalid_employer = {
            "company_name": "",  # Empty required field
            "email": "invalid-email"  # Invalid email
        }
        
        self.run_test(
            "Invalid Employer Data",
            "POST",
            "employers/submit",
            422  # Validation error
        )
        
        # Test non-existent blog post
        self.run_test(
            "Non-existent Blog Post",
            "GET",
            "blog/posts/non-existent-slug",
            404
        )

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\nFAILED TESTS:")
            for test in self.failed_tests:
                print(f"❌ {test['name']}")
                if 'error' in test:
                    print(f"   Error: {test['error']}")
                else:
                    print(f"   Expected: {test['expected']}, Got: {test['actual']}")
        
        return len(self.failed_tests) == 0

def main():
    print("🚀 Starting Global Jobs Consulting API Tests")
    print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tester = GlobalJobsAPITester()
    
    # Run all test suites
    tester.test_health_endpoints()
    tester.test_employer_endpoints()
    tester.test_candidate_endpoints()
    tester.test_contact_endpoints()
    tester.test_blog_endpoints()
    tester.test_stats_endpoint()
    tester.test_error_cases()
    
    # Print summary and return exit code
    success = tester.print_summary()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())