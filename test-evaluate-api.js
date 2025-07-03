const BASE_URL = 'http://localhost:3000';

async function testEvaluationAPI() {
  console.log('🧪 Testing /api/responses/evaluate endpoint...\n');

  const testCases = [
    {
      name: 'Good behavioral response',
      data: {
        sessionId: "1",
        questionId: "1",
        questionText: "Tell me about a time when you had to debug a complex JavaScript issue. How did you approach it?",
        textResponse: "I encountered a memory leak in a React application. I used Chrome DevTools to profile the memory usage and identified that event listeners were not being properly cleaned up. I implemented proper cleanup in useEffect hooks and the issue was resolved."
      }
    },
    {
      name: 'Technical response',
      data: {
        sessionId: "1",
        questionId: "2",
        questionText: "What is the difference between var, let, and const in JavaScript?",
        textResponse: "var has function scope and can be redeclared and reassigned. let has block scope, cannot be redeclared but can be reassigned. const has block scope and cannot be redeclared or reassigned after initialization."
      }
    },
    {
      name: 'Coding response',
      data: {
        sessionId: "1",
        questionId: "3",
        questionText: "Write a SQL query to find the top 5 most expensive products.",
        textResponse: "SELECT product_name, price FROM products ORDER BY price DESC LIMIT 5;"
      }
    },
    {
      name: 'Poor response',
      data: {
        sessionId: "1",
        questionId: "4",
        questionText: "Describe a challenging project you worked on.",
        textResponse: "It was hard."
      }
    },
    {
      name: 'Missing required fields',
      data: {
        questionText: "This should fail because sessionId and questionId are missing"
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Testing: ${testCase.name}`);
    console.log(`Data:`, JSON.stringify(testCase.data, null, 2));
    
    try {
      const response = await fetch(`${BASE_URL}/api/responses/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('\n✅ Success Response:');
        console.log(`Status: ${response.status}`);
        if (result.evaluation) {
          console.log(`Score: ${result.evaluation.score}/100`);
          console.log(`Feedback: ${result.evaluation.feedback}`);
          console.log(`Strengths: ${result.evaluation.strengths?.join(', ') || 'None'}`);
          console.log(`Improvements: ${result.evaluation.improvements?.join(', ') || 'None'}`);
          if (result.evaluation.timeline_analysis) {
            console.log('Timeline Analysis:', result.evaluation.timeline_analysis);
          }
        }
      } else {
        console.log('\n❌ Error Response:');
        console.log(`Status: ${response.status}`);
        console.log(`Error: ${result.error}`);
        if (result.details) {
          console.log(`Details: ${JSON.stringify(result.details, null, 2)}`);
        }
      }
    } catch (error) {
      console.error('❌ Network Error:', error.message);
    }
    
    console.log('\n' + '='.repeat(80));
  }
}

testEvaluationAPI().catch(console.error); 