const BASE_URL = 'http://localhost:3000';

async function testErrorHandling() {
  console.log('🧪 Testing Improved Error Handling...\n');

  // Test 1: Missing GROQ API Key
  console.log('1. Testing API Key Error:');
  try {
    const response = await fetch(`${BASE_URL}/api/questions/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'JavaScript',
        count: 3
      })
    });

    const data = await response.json();
    console.log('   Status:', response.status);
    console.log('   Error:', data.error);
    console.log('   Details:', data.details ? 'Available' : 'None');
    console.log('   Timestamp:', data.timestamp);
  } catch (error) {
    console.log('   Network Error:', error.message);
  }

  console.log('\n2. Testing Response Evaluation Error:');
  try {
    const response = await fetch(`${BASE_URL}/api/responses/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: '999',
        questionId: '999',
        questionText: 'Test question',
        textResponse: 'Test response'
      })
    });

    const data = await response.json();
    console.log('   Status:', response.status);
    console.log('   Error:', data.error);
    console.log('   Details:', data.details ? 'Available' : 'None');
    console.log('   Timestamp:', data.timestamp);
  } catch (error) {
    console.log('   Network Error:', error.message);
  }

  console.log('\n3. Testing Invalid JSON:');
  try {
    const response = await fetch(`${BASE_URL}/api/questions/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    });

    const data = await response.json();
    console.log('   Status:', response.status);
    console.log('   Error:', data.error);
  } catch (error) {
    console.log('   Network Error:', error.message);
  }

  console.log('\n✅ Error handling test completed!');
}

testErrorHandling().catch(console.error); 