#!/bin/bash
# Test Alumni Role System using curl

API_URL="http://localhost:3001"

echo "====== ALUMNI ROLE SYSTEM TEST ======"
echo ""

# Test 1: Alumni Signup
echo "[1/3] Testing Alumni Signup..."
curl -X POST "$API_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Alumni",
    "email": "john@alumni.com",
    "password": "Test@123456",
    "roll_number": "ALUM-2024-001",
    "user_type": "alumni"
  }' \
  -s -w "\nStatus: %{http_code}\n" | grep -E "token|roll_number|user_type|Status"

echo ""
echo "[2/3] Testing Student Signup..."
curl -X POST "$API_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Student",
    "email": "jane@student.com",
    "password": "Test@123456",
    "roll_number": "STU-2024-001",
    "user_type": "student"
  }' \
  -s -w "\nStatus: %{http_code}\n" | grep -E "token|roll_number|user_type|Status"

echo ""
echo "[3/3] Testing Login..."
curl -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@alumni.com",
    "password": "Test@123456"
  }' \
  -s -w "\nStatus: %{http_code}\n" | grep -E "token|roll_number|user_type|Status"

echo ""
echo "====== READY TO TEST IN BROWSER ======"
echo "URL: http://localhost:3001/signup.html"
echo ""
echo "Test signup with:"
echo "  Name: Alumni Test"
echo "  Email: test@alumni.com"
echo "  Password: Test@123"
echo "  Roll Number: ALUM-2024-TEST"
echo "  Role: Alumni"
echo ""
echo "Expected: Redirect to /alumni_dashboard/dashboard.html"
