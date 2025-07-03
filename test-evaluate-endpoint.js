const BASE_URL = 'http://localhost:3002'; // Using port 3002 as shown in logs

async function testEvaluateEndpoint() {
  console.log('🧪 Testing /api/responses/evaluate endpoint...\n');

  const testCases = [
    {
      name: 'Test with existing session and question',
      data: {
        sessionId: "1",
        questionId: "1",
        questionText: "Tell me about a time when you had to debug a complex JavaScript issue. How did you approach it?",
        textResponse: "I encountered a memory leak in a React application. I used Chrome DevTools to profile the memory usage and identified that event listeners were not being properly cleaned up. I implemented proper cleanup in useEffect hooks and the issue was resolved."
      }
    },
    {
      name: 'Test with new session and question',
      data: {
        sessionId: "2",
        questionId: "7",
        questionText: "Test question for evaluation",
        textResponse: "This is a test response to see if the evaluation endpoint is working correctly."
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
        if (result.response) {
          console.log(`Response ID: ${result.response.id}`);
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

testEvaluateEndpoint(); 