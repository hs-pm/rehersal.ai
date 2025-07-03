#!/bin/bash

# Test the /api/responses/evaluate endpoint
echo "🧪 Testing /api/responses/evaluate endpoint..."

# Test 1: Basic evaluation with text response
echo "\\n1. Testing basic text response evaluation:"
curl -X POST http://localhost:3000/api/responses/evaluate \\
  -H "Content-Type: application/json" \\
  -d '{
    "sessionId": "1",
    "questionId": "1", 
    "questionText": "Tell me about a time when you had to debug a complex JavaScript issue. How did you approach it?",
    "textResponse": "I encountered a memory leak in a React application. I used Chrome DevTools to profile the memory usage and identified that event listeners were not being properly cleaned up. I implemented proper cleanup in useEffect hooks and the issue was resolved."
  }' | jq '.'

# Test 2: Evaluation with different question type
echo "\\n\\n2. Testing technical question evaluation:"
curl -X POST http://localhost:3000/api/responses/evaluate \\
  -H "Content-Type: application/json" \\
  -d '{
    "sessionId": "1",
    "questionId": "2",
    "questionText": "What is the difference between var, let, and const in JavaScript?",
    "textResponse": "var has function scope and can be redeclared and reassigned. let has block scope, cannot be redeclared but can be reassigned. const has block scope and cannot be redeclared or reassigned after initialization."
  }' | jq '.'

# Test 3: Evaluation with coding question
echo "\\n\\n3. Testing coding question evaluation:"
curl -X POST http://localhost:3000/api/responses/evaluate \\
  -H "Content-Type: application/json" \\
  -d '{
    "sessionId": "1",
    "questionId": "3",
    "questionText": "Write a SQL query to find the top 5 most expensive products.",
    "textResponse": "SELECT product_name, price FROM products ORDER BY price DESC LIMIT 5;"
  }' | jq '.'

# Test 4: Evaluation with minimal response (should get low score)
echo "\\n\\n4. Testing minimal response evaluation:"
curl -X POST http://localhost:3000/api/responses/evaluate \\
  -H "Content-Type: application/json" \\
  -d '{
    "sessionId": "1",
    "questionId": "4",
    "questionText": "Describe a challenging project you worked on.",
    "textResponse": "It was hard."
  }' | jq '.'

# Test 5: Evaluation with missing required fields (should return error)
echo "\\n\\n5. Testing missing required fields:"
curl -X POST http://localhost:3000/api/responses/evaluate \\
  -H "Content-Type: application/json" \\
  -d '{
    "questionText": "This should fail because sessionId and questionId are missing"
  }' | jq '.'

echo "\\n✅ Evaluation tests completed!" 