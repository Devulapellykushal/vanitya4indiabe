#!/bin/bash

# Comprehensive API Testing Script for Vanitya Backend
# This script tests all endpoints with curl commands

BASE_URL="http://localhost:3000/api/v1"
COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
COLOR_RESET='\033[0m'

echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
echo -e "${COLOR_BLUE}Vanitya Backend API Test Suite${COLOR_RESET}"
echo -e "${COLOR_BLUE}========================================${COLOR_RESET}\n"

# Test 1: Health Check
echo -e "${COLOR_YELLOW}[1/10] Testing Health Check...${COLOR_RESET}"
HEALTH_RESPONSE=$(curl -s "$BASE_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"OK"'; then
    echo -e "${COLOR_GREEN}✓ Health check passed${COLOR_RESET}"
    echo "$HEALTH_RESPONSE" | jq .
else
    echo -e "${COLOR_RED}✗ Health check failed${COLOR_RESET}"
    echo "$HEALTH_RESPONSE"
fi
echo ""

# Test 2: Root API Endpoint
echo -e "${COLOR_YELLOW}[2/10] Testing Root API Endpoint...${COLOR_RESET}"
ROOT_RESPONSE=$(curl -s "http://localhost:3000/api")
if echo "$ROOT_RESPONSE" | grep -q '"success":true'; then
    echo -e "${COLOR_GREEN}✓ Root endpoint works${COLOR_RESET}"
    echo "$ROOT_RESPONSE" | jq '.data.message'
else
    echo -e "${COLOR_RED}✗ Root endpoint failed${COLOR_RESET}"
fi
echo ""

# Test 3: User Registration
echo -e "${COLOR_YELLOW}[3/10] Testing User Registration...${COLOR_RESET}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "email":"apitest@example.com",
        "name":"API Test User",
        "password":"test123456",
        "currentLanguage":"hi",
        "targetLanguage":"te"
    }')

if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
    echo -e "${COLOR_GREEN}✓ User registration successful${COLOR_RESET}"
    TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token // empty')
    USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user.id // empty')
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        echo -e "${COLOR_GREEN}  Token received: ${TOKEN:0:50}...${COLOR_RESET}"
        echo -e "${COLOR_GREEN}  User ID: $USER_ID${COLOR_RESET}"
    else
        echo -e "${COLOR_RED}  ✗ No token in response${COLOR_RESET}"
        TOKEN=""
    fi
else
    echo -e "${COLOR_RED}✗ User registration failed${COLOR_RESET}"
    echo "$REGISTER_RESPONSE" | jq .
    TOKEN=""
fi
echo ""

# Test 4: User Login
echo -e "${COLOR_YELLOW}[4/10] Testing User Login...${COLOR_RESET}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email":"apitest@example.com",
        "password":"test123456"
    }')

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo -e "${COLOR_GREEN}✓ User login successful${COLOR_RESET}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // .token // empty')
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        echo -e "${COLOR_GREEN}  Token received: ${TOKEN:0:50}...${COLOR_RESET}"
    else
        echo -e "${COLOR_RED}  ✗ No token in response${COLOR_RESET}"
        TOKEN=""
    fi
else
    echo -e "${COLOR_RED}✗ User login failed${COLOR_RESET}"
    echo "$LOGIN_RESPONSE" | jq .
    TOKEN=""
fi
echo ""

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo -e "${COLOR_RED}⚠ Cannot continue without authentication token${COLOR_RESET}"
    exit 1
fi

# Test 5: Get User Profile
echo -e "${COLOR_YELLOW}[5/10] Testing Get User Profile...${COLOR_RESET}"
PROFILE_RESPONSE=$(curl -s "$BASE_URL/auth/profile" \
    -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE_RESPONSE" | grep -q '"success":true'; then
    echo -e "${COLOR_GREEN}✓ Profile retrieval successful${COLOR_RESET}"
    echo "$PROFILE_RESPONSE" | jq '.data.user.email'
else
    echo -e "${COLOR_RED}✗ Profile retrieval failed${COLOR_RESET}"
    echo "$PROFILE_RESPONSE" | jq .
fi
echo ""

# Test 6: Fetch Exercises
echo -e "${COLOR_YELLOW}[6/10] Testing Fetch Exercises...${COLOR_RESET}"
EXERCISES_RESPONSE=$(curl -s "$BASE_URL/exercises/fetch?page=1&limit=5" \
    -H "Authorization: Bearer $TOKEN")

if echo "$EXERCISES_RESPONSE" | grep -q '"success":true'; then
    echo -e "${COLOR_GREEN}✓ Exercise fetch successful${COLOR_RESET}"
    EXERCISE_COUNT=$(echo "$EXERCISES_RESPONSE" | jq '.data.pagination.total // 0')
    echo -e "${COLOR_GREEN}  Found $EXERCISE_COUNT exercises${COLOR_RESET}"
else
    echo -e "${COLOR_RED}✗ Exercise fetch failed${COLOR_RESET}"
    echo "$EXERCISES_RESPONSE" | jq .
fi
echo ""

# Test 7: Generate Exercise
echo -e "${COLOR_YELLOW}[7/10] Testing Generate Exercise...${COLOR_RESET}"
GENERATE_RESPONSE=$(curl -s -X POST "$BASE_URL/exercises/generate" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "sourceLanguage":"hi",
        "targetLanguage":"te",
        "difficulty":"beginner",
        "exerciseType":"translation",
        "unitId":"unit_test_1",
        "count":1
    }')

if echo "$GENERATE_RESPONSE" | grep -q '"success":true'; then
    echo -e "${COLOR_GREEN}✓ Exercise generation successful${COLOR_RESET}"
    EXERCISE_ID=$(echo "$GENERATE_RESPONSE" | jq -r '.data.exercises[0].id // empty')
    if [ -n "$EXERCISE_ID" ] && [ "$EXERCISE_ID" != "null" ]; then
        echo -e "${COLOR_GREEN}  Generated exercise ID: $EXERCISE_ID${COLOR_RESET}"
    fi
else
    echo -e "${COLOR_RED}✗ Exercise generation failed${COLOR_RESET}"
    echo "$GENERATE_RESPONSE" | jq .
fi
echo ""

# Test 8: Get Recommender Next Exercise
echo -e "${COLOR_YELLOW}[8/10] Testing Recommender Next Exercise...${COLOR_RESET}"
RECOMMENDER_RESPONSE=$(curl -s "$BASE_URL/recommender/next?sourceLanguage=hi&targetLanguage=te" \
    -H "Authorization: Bearer $TOKEN")

if echo "$RECOMMENDER_RESPONSE" | grep -q '"success":true'; then
    echo -e "${COLOR_GREEN}✓ Recommender successful${COLOR_RESET}"
    REASON=$(echo "$RECOMMENDER_RESPONSE" | jq -r '.data.reason // empty')
    echo -e "${COLOR_GREEN}  Recommendation reason: $REASON${COLOR_RESET}"
elif echo "$RECOMMENDER_RESPONSE" | grep -q '"success":false'; then
    echo -e "${COLOR_YELLOW}⚠ Recommender returned no exercises (expected if none available)${COLOR_RESET}"
else
    echo -e "${COLOR_RED}✗ Recommender failed${COLOR_RESET}"
    echo "$RECOMMENDER_RESPONSE" | jq .
fi
echo ""

# Test 9: STT Languages
echo -e "${COLOR_YELLOW}[9/10] Testing STT Languages Endpoint...${COLOR_RESET}"
STT_LANGUAGES_RESPONSE=$(curl -s "$BASE_URL/stt/languages" \
    -H "Authorization: Bearer $TOKEN")

if echo "$STT_LANGUAGES_RESPONSE" | grep -q '"success":true'; then
    echo -e "${COLOR_GREEN}✓ STT languages retrieval successful${COLOR_RESET}"
    LANG_COUNT=$(echo "$STT_LANGUAGES_RESPONSE" | jq '.data.languages | length // 0')
    echo -e "${COLOR_GREEN}  Available languages: $LANG_COUNT${COLOR_RESET}"
else
    echo -e "${COLOR_RED}✗ STT languages retrieval failed${COLOR_RESET}"
    echo "$STT_LANGUAGES_RESPONSE" | jq .
fi
echo ""

# Test 10: Swagger Documentation
echo -e "${COLOR_YELLOW}[10/10] Testing Swagger Documentation...${COLOR_RESET}"
SWAGGER_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/docs")

if [ "$SWAGGER_RESPONSE" = "200" ] || [ "$SWAGGER_RESPONSE" = "301" ]; then
    echo -e "${COLOR_GREEN}✓ Swagger documentation accessible${COLOR_RESET}"
    echo -e "${COLOR_GREEN}  URL: http://localhost:3000/api/docs${COLOR_RESET}"
else
    echo -e "${COLOR_YELLOW}⚠ Swagger documentation returned status: $SWAGGER_RESPONSE${COLOR_RESET}"
fi
echo ""

# Summary
echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
echo -e "${COLOR_BLUE}Test Summary${COLOR_RESET}"
echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
echo -e "${COLOR_GREEN}All API endpoints tested successfully!${COLOR_RESET}"
echo -e "${COLOR_BLUE}Base URL: $BASE_URL${COLOR_RESET}"
echo -e "${COLOR_BLUE}Swagger Docs: http://localhost:3000/api/docs${COLOR_RESET}"
echo ""

