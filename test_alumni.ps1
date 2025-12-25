# PowerShell Test Script for Alumni Role System

$API_URL = "http://localhost:3001"

Write-Host "`n====== ALUMNI ROLE SYSTEM - SETUP COMPLETE ======`n" -ForegroundColor Green

Write-Host "Backend Server Status:" -ForegroundColor Cyan
$response = try {
    Invoke-WebRequest -Uri "$API_URL/api/chat/users" -ErrorAction Stop -TimeoutSec 2
    Write-Host "✓ Server is RUNNING on port 3001" -ForegroundColor Green
} catch {
    Write-Host "✗ Server is NOT running" -ForegroundColor Red
    Write-Host "  Start with: node backend/auth-server.js" -ForegroundColor Yellow
}

Write-Host "`n====== TESTING SIGNUP (ALUMNI) ======`n" -ForegroundColor Cyan

$signupData = @{
    full_name = "John Alumni Test"
    email = "john.test@alumni.com"
    password = "Test@123456"
    roll_number = "ALUM-2024-001"
    user_type = "alumni"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/auth/signup" `
                                 -Method Post `
                                 -Headers @{"Content-Type"="application/json"} `
                                 -Body $signupData `
                                 -ErrorAction Stop

    Write-Host "✓ Signup Successful!" -ForegroundColor Green
    Write-Host "  User ID: $($response.user.id)"
    Write-Host "  Name: $($response.user.full_name)"
    Write-Host "  Email: $($response.user.email)"
    Write-Host "  Roll Number: $($response.user.roll_number)"
    Write-Host "  User Type: $($response.user.user_type)"
    Write-Host "  Token: $($response.token.Substring(0,20))..."
    
    $token = $response.token
    
} catch {
    Write-Host "✗ Signup Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n====== TESTING LOGIN ======`n" -ForegroundColor Cyan

$loginData = @{
    email = "john.test@alumni.com"
    password = "Test@123456"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/auth/login" `
                                 -Method Post `
                                 -Headers @{"Content-Type"="application/json"} `
                                 -Body $loginData `
                                 -ErrorAction Stop

    Write-Host "✓ Login Successful!" -ForegroundColor Green
    Write-Host "  User Type: $($response.user.user_type)"
    Write-Host "  Roll Number: $($response.user.roll_number)"
    
} catch {
    Write-Host "✗ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n====== TESTING PROFILE ======`n" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/auth/me" `
                                 -Method Get `
                                 -Headers @{"Authorization"="Bearer $token"} `
                                 -ErrorAction Stop

    Write-Host "✓ Profile Fetched!" -ForegroundColor Green
    Write-Host "  Name: $($response.full_name)"
    Write-Host "  Roll Number: $($response.roll_number)"
    Write-Host "  User Type: $($response.user_type)"
    
} catch {
    Write-Host "✗ Profile Fetch Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n====== READY FOR BROWSER TESTING ======`n" -ForegroundColor Green
Write-Host "Open: http://localhost:3001/signup.html" -ForegroundColor Cyan
Write-Host "`nTest with:" -ForegroundColor Yellow
Write-Host "  Name: Alumni Test User"
Write-Host "  Email: alumni2@test.com"
Write-Host "  Password: Secure@123"
Write-Host "  Roll Number: ALUM-2024-999"
Write-Host "  Role: Alumni"
Write-Host "`nExpected Result:" -ForegroundColor Yellow
Write-Host "  ✓ Account created"
Write-Host "  ✓ Redirected to /alumni_dashboard/dashboard.html" -ForegroundColor Cyan
Write-Host "  ✓ Can see alumni profile with company/job fields"
Write-Host "`n====== IMPLEMENTATION COMPLETE ======`n" -ForegroundColor Green
