const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test data
const testData = {
  question: {
    question: "Test question for database health check",
    type: "behavioral",
    category: "Test Category"
  },
  session: {
    title: "Test Practice Session",
    subject: "Test Subject",
    total_questions: 3,
    resume: "Test resume content",
    job_description: "Test job description",
    candidate_analysis: "Test candidate analysis"
  },
  response: {
    session_id: null, // Will be set after session creation
    question_id: null, // Will be set after question creation
    question_text: "Test question text",
    text_response: "Test response content",
    transcription: "Test transcription",
    evaluation: {
      score: 75,
      feedback: "Test feedback",
      strengths: ["Good communication"],
      improvements: ["Could be more specific"],
      timeline_analysis: {
        clarity: 7,
        confidence: 6,
        technical_depth: 5,
        communication: 8,
        structure: 7,
        engagement: 6,
        completeness: 6
      }
    }
  }
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Utility functions
function logTest(testName, success, error = null) {
  const status = success ? '✅ PASSED' : '❌ FAILED';
  console.log(`${status}: ${testName}`);
  
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

async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logTest('Database Connection', true);
    return true;
  } catch (error) {
    logTest('Database Connection', false, error);
    return false;
  }
}

async function testCreateTables() {
  try {
    // Drop existing tables to test recreation
    await pool.query('DROP TABLE IF EXISTS responses CASCADE');
    await pool.query('DROP TABLE IF EXISTS practice_sessions CASCADE');
    await pool.query('DROP TABLE IF EXISTS questions CASCADE');
    
    // Create questions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('behavioral', 'technical', 'situational', 'coding', 'sql_query_writing', 'python_data_science')),
        category VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create practice_sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS practice_sessions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subject VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        total_questions INTEGER DEFAULT 0,
        completed_questions INTEGER DEFAULT 0,
        resume TEXT,
        job_description TEXT,
        candidate_analysis TEXT
      )
    `);
    
    // Create responses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES practice_sessions(id),
        question_id INTEGER REFERENCES questions(id),
        question_text TEXT NOT NULL,
        audio_url TEXT,
        video_url TEXT,
        text_response TEXT,
        transcription TEXT,
        evaluation JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    logTest('Create Tables', true);
    return true;
  } catch (error) {
    logTest('Create Tables', false, error);
    return false;
  }
}

async function testInsertQuestion() {
  try {
    const result = await pool.query(
      'INSERT INTO questions (question, type, category) VALUES ($1, $2, $3) RETURNING *',
      [testData.question.question, testData.question.type, testData.question.category]
    );
    
    const insertedQuestion = result.rows[0];
    testData.response.question_id = insertedQuestion.id;
    
    logTest('Insert Question', true);
    return insertedQuestion;
  } catch (error) {
    logTest('Insert Question', false, error);
    return null;
  }
}

async function testGetQuestionById(questionId) {
  try {
    const result = await pool.query('SELECT * FROM questions WHERE id = $1', [questionId]);
    const question = result.rows[0];
    
    if (question) {
      logTest('Get Question By ID', true);
      return question;
    } else {
      logTest('Get Question By ID', false, 'Question not found');
      return null;
    }
  } catch (error) {
    logTest('Get Question By ID', false, error);
    return null;
  }
}

async function testGetQuestions() {
  try {
    const result = await pool.query('SELECT * FROM questions ORDER BY created_at DESC LIMIT 10');
    logTest('Get Questions', true);
    return result.rows;
  } catch (error) {
    logTest('Get Questions', false, error);
    return [];
  }
}

async function testCreatePracticeSession() {
  try {
    const result = await pool.query(
      'INSERT INTO practice_sessions (title, subject, total_questions, resume, job_description, candidate_analysis) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        testData.session.title,
        testData.session.subject,
        testData.session.total_questions,
        testData.session.resume,
        testData.session.job_description,
        testData.session.candidate_analysis
      ]
    );
    
    const insertedSession = result.rows[0];
    testData.response.session_id = insertedSession.id;
    
    logTest('Create Practice Session', true);
    return insertedSession;
  } catch (error) {
    logTest('Create Practice Session', false, error);
    return null;
  }
}

async function testGetPracticeSessionById(sessionId) {
  try {
    const result = await pool.query('SELECT * FROM practice_sessions WHERE id = $1', [sessionId]);
    const session = result.rows[0];
    
    if (session) {
      logTest('Get Practice Session By ID', true);
      return session;
    } else {
      logTest('Get Practice Session By ID', false, 'Session not found');
      return null;
    }
  } catch (error) {
    logTest('Get Practice Session By ID', false, error);
    return null;
  }
}

async function testGetPracticeSessions() {
  try {
    const result = await pool.query('SELECT * FROM practice_sessions ORDER BY created_at DESC');
    logTest('Get Practice Sessions', true);
    return result.rows;
  } catch (error) {
    logTest('Get Practice Sessions', false, error);
    return [];
  }
}

async function testInsertResponse() {
  try {
    const result = await pool.query(
      'INSERT INTO responses (session_id, question_id, question_text, text_response, transcription, evaluation) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        testData.response.session_id,
        testData.response.question_id,
        testData.response.question_text,
        testData.response.text_response,
        testData.response.transcription,
        JSON.stringify(testData.response.evaluation)
      ]
    );
    
    logTest('Insert Response', true);
    return result.rows[0];
  } catch (error) {
    logTest('Insert Response', false, error);
    return null;
  }
}

async function testGetResponses(sessionId) {
  try {
    const result = await pool.query('SELECT * FROM responses WHERE session_id = $1 ORDER BY created_at', [sessionId]);
    logTest('Get Responses', true);
    return result.rows;
  } catch (error) {
    logTest('Get Responses', false, error);
    return [];
  }
}

async function testQuestionTypeValidation() {
  const invalidTypes = ['invalid_type', 'unknown', 'test'];
  let passed = 0;
  
  for (const invalidType of invalidTypes) {
    try {
      await pool.query(
        'INSERT INTO questions (question, type, category) VALUES ($1, $2, $3)',
        ['Test question', invalidType, 'Test Category']
      );
      logTest(`Question Type Validation (${invalidType})`, false, 'Should have failed with invalid type');
    } catch (error) {
      if (error.code === '23514') { // Check constraint violation
        logTest(`Question Type Validation (${invalidType})`, true);
        passed++;
      } else {
        logTest(`Question Type Validation (${invalidType})`, false, error);
      }
    }
  }
  
  return passed === invalidTypes.length;
}

async function testForeignKeyConstraints() {
  try {
    // Try to insert response with non-existent session_id and question_id
    await pool.query(
      'INSERT INTO responses (session_id, question_id, question_text) VALUES ($1, $2, $3)',
      [99999, 99999, 'Test question']
    );
    logTest('Foreign Key Constraints', false, 'Should have failed with non-existent IDs');
  } catch (error) {
    if (error.code === '23503') { // Foreign key violation
      logTest('Foreign Key Constraints', true);
      return true;
    } else {
      logTest('Foreign Key Constraints', false, error);
      return false;
    }
  }
}

async function testJSONBEvaluation() {
  try {
    const complexEvaluation = {
      score: 85,
      feedback: "Excellent response with good technical depth",
      strengths: ["Clear communication", "Good problem-solving approach"],
      improvements: ["Could provide more examples"],
      timeline_analysis: {
        clarity: 8,
        confidence: 7,
        technical_depth: 8,
        communication: 9,
        structure: 8,
        engagement: 7,
        completeness: 8
      },
      metadata: {
        processing_time: 1.2,
        model_version: "llama-3.1-8b-instant"
      }
    };
    
    const result = await pool.query(
      'INSERT INTO responses (session_id, question_id, question_text, evaluation) VALUES ($1, $2, $3, $4) RETURNING evaluation',
      [
        testData.response.session_id,
        testData.response.question_id,
        'Test question for JSONB',
        JSON.stringify(complexEvaluation)
      ]
    );
    
    const retrievedEvaluation = result.rows[0].evaluation;
    
    if (retrievedEvaluation && retrievedEvaluation.score === 85) {
      logTest('JSONB Evaluation Storage', true);
      return true;
    } else {
      logTest('JSONB Evaluation Storage', false, 'Retrieved evaluation does not match');
      return false;
    }
  } catch (error) {
    logTest('JSONB Evaluation Storage', false, error);
    return false;
  }
}

async function testConcurrentOperations() {
  try {
    const promises = [];
    
    // Simulate concurrent question insertions
    for (let i = 0; i < 5; i++) {
      promises.push(
        pool.query(
          'INSERT INTO questions (question, type, category) VALUES ($1, $2, $3)',
          [`Concurrent question ${i}`, 'behavioral', 'Concurrent Test']
        )
      );
    }
    
    await Promise.all(promises);
    logTest('Concurrent Operations', true);
    return true;
  } catch (error) {
    logTest('Concurrent Operations', false, error);
    return false;
  }
}

async function testDataRetrievalPerformance() {
  try {
    const startTime = Date.now();
    
    // Insert some test data
    for (let i = 0; i < 10; i++) {
      await pool.query(
        'INSERT INTO questions (question, type, category) VALUES ($1, $2, $3)',
        [`Performance test question ${i}`, 'technical', 'Performance Test']
      );
    }
    
    // Test retrieval performance
    const result = await pool.query('SELECT * FROM questions WHERE category = $1', ['Performance Test']);
    const endTime = Date.now();
    
    const duration = endTime - startTime;
    if (duration < 1000) { // Should complete within 1 second
      logTest('Data Retrieval Performance', true);
      return true;
    } else {
      logTest('Data Retrieval Performance', false, `Took ${duration}ms (too slow)`);
      return false;
    }
  } catch (error) {
    logTest('Data Retrieval Performance', false, error);
    return false;
  }
}

async function cleanupTestData() {
  try {
    await pool.query('DELETE FROM responses WHERE question_text LIKE $1', ['%Test%']);
    await pool.query('DELETE FROM practice_sessions WHERE title LIKE $1', ['%Test%']);
    await pool.query('DELETE FROM questions WHERE question LIKE $1', ['%Test%']);
    logTest('Cleanup Test Data', true);
  } catch (error) {
    logTest('Cleanup Test Data', false, error);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Database Health Check...\n');
  
  // Test database connection first
  const connectionOk = await testDatabaseConnection();
  if (!connectionOk) {
    console.log('\n❌ Database connection failed. Stopping tests.');
    process.exit(1);
  }
  
  // Run all tests
  await testCreateTables();
  await testInsertQuestion();
  await testGetQuestionById(testData.response.question_id);
  await testGetQuestions();
  await testCreatePracticeSession();
  await testGetPracticeSessionById(testData.response.session_id);
  await testGetPracticeSessions();
  await testInsertResponse();
  await testGetResponses(testData.response.session_id);
  await testQuestionTypeValidation();
  await testForeignKeyConstraints();
  await testJSONBEvaluation();
  await testConcurrentOperations();
  await testDataRetrievalPerformance();
  
  // Cleanup
  await cleanupTestData();
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🔍 Detailed Errors:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`);
    });
  }
  
  // Close database connection
  await pool.end();
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testResults
}; 