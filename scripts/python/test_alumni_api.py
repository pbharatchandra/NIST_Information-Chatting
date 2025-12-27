#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script for Alumni Role System
Tests signup, login, and profile endpoints
"""

import requests
import json
import sys
import io

# Fix Unicode output on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

API_URL = "http://localhost:3001"

def test_alumni_signup():
    """Test alumni signup"""
    print("\n" + "="*60)
    print("🧪 Testing Alumni Signup")
    print("="*60)
    
    signup_data = {
        "full_name": "John Alumni",
        "email": "john.alumni@test.com",
        "password": "Test@123456",
        "roll_number": "ALUM-2024-001",
        "user_type": "alumni"
    }
    
    print("\nSending signup request...")
    print(json.dumps(signup_data, indent=2))
    
    try:
        response = requests.post(f"{API_URL}/api/auth/signup", json=signup_data)
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            user = data.get('user')
            
            print("\n✅ Signup successful!")
            print(f"   Token: {token[:20]}...")
            print(f"   User ID: {user.get('id')}")
            print(f"   Name: {user.get('full_name')}")
            print(f"   Email: {user.get('email')}")
            print(f"   Roll Number: {user.get('roll_number')}")
            print(f"   User Type: {user.get('user_type')}")
            
            return token, user
        else:
            print(f"\n❌ Signup failed: {response.status_code}")
            print(response.json())
            return None, None
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return None, None

def test_student_signup():
    """Test student signup"""
    print("\n" + "="*60)
    print("🧪 Testing Student Signup")
    print("="*60)
    
    signup_data = {
        "full_name": "Jane Student",
        "email": "jane.student@test.com",
        "password": "Test@123456",
        "roll_number": "STU-2024-001",
        "user_type": "student"
    }
    
    print("\nSending signup request...")
    
    try:
        response = requests.post(f"{API_URL}/api/auth/signup", json=signup_data)
        
        if response.status_code == 200:
            data = response.json()
            user = data.get('user')
            
            print(f"✅ Student signup successful!")
            print(f"   Name: {user.get('full_name')}")
            print(f"   Roll Number: {user.get('roll_number')}")
            print(f"   User Type: {user.get('user_type')}")
            
            return data.get('token')
        else:
            print(f"❌ Signup failed: {response.status_code}")
            print(response.json())
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_login(email, password):
    """Test login"""
    print("\n" + "="*60)
    print("🧪 Testing Login")
    print("="*60)
    
    login_data = {
        "email": email,
        "password": password
    }
    
    print(f"\nLogging in as {email}...")
    
    try:
        response = requests.post(f"{API_URL}/api/auth/login", json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            user = data.get('user')
            
            print(f"\n✅ Login successful!")
            print(f"   Name: {user.get('full_name')}")
            print(f"   Email: {user.get('email')}")
            print(f"   Roll Number: {user.get('roll_number')}")
            print(f"   User Type: {user.get('user_type')}")
            
            return data.get('token')
        else:
            print(f"\n❌ Login failed: {response.status_code}")
            print(response.json())
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_profile(token):
    """Test profile endpoint"""
    print("\n" + "="*60)
    print("🧪 Testing Profile Endpoint")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\nFetching user profile...")
    
    try:
        response = requests.get(f"{API_URL}/api/auth/me", headers=headers)
        
        if response.status_code == 200:
            user = response.json()
            
            print(f"\n✅ Profile fetched successfully!")
            print(f"   ID: {user.get('id')}")
            print(f"   Name: {user.get('full_name')}")
            print(f"   Email: {user.get('email')}")
            print(f"   Roll Number: {user.get('roll_number')}")
            print(f"   User Type: {user.get('user_type')}")
            
            return True
        else:
            print(f"\n❌ Profile fetch failed: {response.status_code}")
            print(response.json())
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("\nALUMNI ROLE SYSTEM - API TESTS")
    print("="*60)
    
    print(f"\nConnecting to: {API_URL}")
    
    try:
        response = requests.get(f"{API_URL}/api/chat/users", timeout=2)
        print("✓ Server is running!")
    except:
        print("❌ Server is not running!")
        print("   Start it with: node backend/auth-server.js")
        return False
    
    # Test 1: Alumni Signup
    token_alumni, user_alumni = test_alumni_signup()
    
    # Test 2: Student Signup
    token_student = test_student_signup()
    
    # Test 3: Login
    if token_alumni:
        token_login = test_login("john.alumni@test.com", "Test@123456")
        
        # Test 4: Profile
        if token_login:
            test_profile(token_login)
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    print("\n✅ Alumni signup: PASSED" if token_alumni else "\n❌ Alumni signup: FAILED")
    print("✅ Student signup: PASSED" if token_student else "❌ Student signup: FAILED")
    print("✅ Login: PASSED" if test_login("john.alumni@test.com", "Test@123456") else "❌ Login: FAILED")
    
    print("\n📋 Ready to test in browser:")
    print("   URL: http://localhost:3001/signup.html")
    print("   Try signup with:")
    print("     - Roll Number: ALUM-2024-002")
    print("     - Role: Alumni")
    print("   Should redirect to: /alumni_dashboard/dashboard.html")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTest cancelled")
        sys.exit(1)
