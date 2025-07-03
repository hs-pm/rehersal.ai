const fetch = require('node-fetch');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 10000; // 10 seconds

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  sessionId: null,
  questionId: null
};

// Utility functions
function logTest(testName, success, error = null, details = null) {
  const status = success ? '✅ PASSED' : '❌ FAILED';
  console.log(`${status}: ${testName}`);
  
  if (details) {
    console.log(`   Details: ${details}`);
  }
  
  if (success) {
    testResults.passed++;
  } else {
    testResults.failed++;
    if (error) {
      testResults.errors.push({ test: testName, error: error.message || error });
      console.log(`   Error: ${error.message || error}`);
    }
  }
}

async function makeRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Test functions
async function testQuestionsGenerate() {
  try {
    const response = await makeRequest(`${BASE_URL}/api/questions/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject: 'JavaScript',
        count: 3,
        types: ['behavioral', 'technical', 'situational']
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success && data.questions && data.questions.length > 0) {
      testResults.questionId = data.questions[0].id;
      logTest('Questions Generate API', true, null, `Generated ${data.questions.length} questions`);
      return data.questions;
    } else {
      throw new Error('No questions generated or invalid response format');
    }
  } catch (error) {
    logTest('Questions Generate API', false, error);
    return null;
  }
}

async function testSessionsCreate() {
  try {
    const response = await makeRequest(`${BASE_URL}/api/sessions/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Practice Session',
        subject: 'JavaScript',
        totalQuestions: 3,
        resume: 'Test resume content',
        jobDescription: 'Test job description',
        candidateAnalysis: 'Test candidate analysis'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success && data.session && data.session.id) {
      testResults.sessionId = data.session.id;
      logTest('Sessions Create API', true, null, `Created session ID: ${data.session.id}`);
      return data.session;
    } else {
      throw new Error('Session creation failed or invalid response format');
    }
  } catch (error) {
    logTest('Sessions Create API', false, error);
    return null;
  }
}

async function testResponsesEvaluate() {
  if (!testResults.sessionId || !testResults.questionId) {
    logTest('Responses Evaluate API', false, 'Missing sessionId or questionId from previous tests');
    return null;
  }

  try {
    const response = await makeRequest(`${BASE_URL}/api/responses/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: testResults.sessionId,
        questionId: testResults.questionId,
        questionText: 'Test question text',
        textResponse: 'This is a test response for evaluation. I would approach this problem by first understanding the requirements and then implementing a solution step by step.'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success && data.evaluation && data.evaluation.score !== undefined) {
      logTest('Responses Evaluate API', true, null, `Evaluation score: ${data.evaluation.score}`);
      return data.evaluation;
    } else {
      throw new Error('Response evaluation failed or invalid response format');
    }
  } catch (error) {
    logTest('Responses Evaluate API', false, error);
    return null;
  }
}

async function testClarificationAPI() {
  try {
    const response = await makeRequest(`${BASE_URL}/api/clarification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clarifyingQuestion: 'What specific aspects should I focus on in my response?',
        interviewQuestion: 'Tell me about a time when you had to debug a complex JavaScript issue.'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success && data.guidance) {
      logTest('Clarification API', true, null, `Generated guidance: ${data.guidance.substring(0, 50)}...`);
      return data.guidance;
    } else {
      throw new Error('Clarification failed or invalid response format');
    }
  } catch (error) {
    logTest('Clarification API', false, error);
    return null;
  }
}

async function testSessionsResults() {
  if (!testResults.sessionId) {
    logTest('Sessions Results API', false, 'Missing sessionId from previous tests');
    return null;
  }

  try {
    const response = await makeRequest(`${BASE_URL}/api/sessions/${testResults.sessionId}/results`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success && data.session) {
      logTest('Sessions Results API', true, null, `Retrieved session with ${data.session.responses?.length || 0} responses`);
      return data.session;
    } else {
      throw new Error('Session results retrieval failed or invalid response format');
    }
  } catch (error) {
    logTest('Sessions Results API', false, error);
    return null;
  }
}

async function testMissingSessionsAPI() {
  try {
    const response = await makeRequest(`${BASE_URL}/api/sessions`);

    if (response.status === 404) {
      logTest('Missing Sessions API', true, null, 'Expected 404 - endpoint not implemented');
      return null;
    } else if (response.ok) {
      const data = await response.json();
      logTest('Sessions API', true, null, `Retrieved ${data.sessions?.length || 0} sessions`);
      return data.sessions;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    logTest('Missing Sessions API', false, error);
    return null;
  }
}

async function testInvalidEndpoints() {
  const invalidEndpoints = [
    '/api/nonexistent',
    '/api/questions/invalid',
    '/api/sessions/invalid/endpoint'
  ];

  for (const endpoint of invalidEndpoints) {
    try {
      const response = await makeRequest(`${BASE_URL}${endpoint}`);
      
      if (response.status === 404) {
        logTest(`Invalid Endpoint (${endpoint})`, true, null, 'Correctly returned 404');
      } else {
        logTest(`Invalid Endpoint (${endpoint})`, false, `Expected 404, got ${response.status}`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        logTest(`Invalid Endpoint (${endpoint})`, false, 'Request timed out');
      } else {
        logTest(`Invalid Endpoint (${endpoint})`, false, error);
      }
    }
  }
}

async function testErrorHandling() {
  // Test with invalid JSON
  try {
    const response = await makeRequest(`${BASE_URL}/api/questions/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: 'invalid json'
    });

    if (response.status === 400) {
      logTest('Error Handling - Invalid JSON', true, null, 'Correctly returned 400 for invalid JSON');
    } else {
      logTest('Error Handling - Invalid JSON', false, `Expected 400, got ${response.status}`);
    }
  } catch (error) {
    logTest('Error Handling - Invalid JSON', false, error);
  }

  // Test with missing required fields
  try {
    const response = await makeRequest(`${BASE_URL}/api/questions/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (response.status === 400) {
      logTest('Error Handling - Missing Fields', true, null, 'Correctly returned 400 for missing fields');
    } else {
      logTest('Error Handling - Missing Fields', false, `Expected 400, got ${response.status}`);
    }
  } catch (error) {
    logTest('Error Handling - Missing Fields', false, error);
  }
}

async function testPerformance() {
  const startTime = Date.now();
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/questions/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject: 'Performance Test',
        count: 1,
        types: ['behavioral']
      })
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (response.ok && duration < 5000) { // Should complete within 5 seconds
      logTest('API Performance', true, null, `Request completed in ${duration}ms`);
    } else if (duration >= 5000) {
      logTest('API Performance', false, `Request took too long: ${duration}ms`);
    } else {
      logTest('API Performance', false, `Request failed with status ${response.status}`);
    }
  } catch (error) {
    logTest('API Performance', false, error);
  }
}

async function testConcurrentRequests() {
  try {
    const promises = [];
    
    // Make 3 concurrent requests
    for (let i = 0; i < 3; i++) {
      promises.push(
        makeRequest(`${BASE_URL}/api/questions/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subject: `Concurrent Test ${i}`,
            count: 1,
            types: ['behavioral']
          })
        })
      );
    }

    const responses = await Promise.all(promises);
    const successfulResponses = responses.filter(r => r.ok).length;
    
    if (successfulResponses === 3) {
      logTest('Concurrent Requests', true, null, 'All 3 concurrent requests succeeded');
    } else {
      logTest('Concurrent Requests', false, `${successfulResponses}/3 requests succeeded`);
    }
  } catch (error) {
    logTest('Concurrent Requests', false, error);
  }
}

// Main test runner
async function runAllAPITests() {
  console.log('🚀 Starting API Health Check...\n');
  console.log(`📍 Testing against: ${BASE_URL}\n`);

  // Test basic functionality
  await testQuestionsGenerate();
  await testSessionsCreate();
  await testResponsesEvaluate();
  await testClarificationAPI();
  await testSessionsResults();
  
  // Test missing endpoints
  await testMissingSessionsAPI();
  
  // Test error handling
  await testErrorHandling();
  
  // Test performance and concurrency
  await testPerformance();
  await testConcurrentRequests();
  
  // Test invalid endpoints
  await testInvalidEndpoints();

  // Print summary
  console.log('\n📊 API Test Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🔍 Detailed Errors:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`);
    });
  }

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllAPITests().catch(error => {
    console.error('💥 API test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllAPITests,
  testResults
}; 