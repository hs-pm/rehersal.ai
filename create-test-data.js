const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined
  }
});

async function createTestData() {
  console.log('🧪 Creating test data...\n');
  
  try {
    // Create a test session
    const sessionResult = await pool.query(`
      INSERT INTO practice_sessions (title, subject, total_questions) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `, ['Test Session', 'JavaScript', 3]);
    
    const session = sessionResult.rows[0];
    console.log('✅ Created session:', {
      id: session.id,
      title: session.title,
      subject: session.subject
    });
    
    // Create a test question
    const questionResult = await pool.query(`
      INSERT INTO questions (question, type, category) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `, ['Tell me about a time when you had to debug a complex JavaScript issue. How did you approach it?', 'behavioral', 'JavaScript']);
    
    const question = questionResult.rows[0];
    console.log('✅ Created question:', {
      id: question.id,
      type: question.type,
      category: question.category
    });
    
    // Now test the evaluate endpoint with valid IDs
    console.log('\n🎯 Testing evaluate endpoint with valid IDs...');
    console.log(`   Session ID: ${session.id}`);
    console.log(`   Question ID: ${question.id}`);
    
    // Test the curl command
    const curlCommand = `curl -X POST http://localhost:3000/api/responses/evaluate \\
  -H "Content-Type: application/json" \\
  -d '{
    "sessionId": "${session.id}",
    "questionId": "${question.id}",
    "questionText": "${question.question}",
    "textResponse": "I encountered a memory leak in a React application. I used Chrome DevTools to profile the memory usage and identified that event listeners were not being properly cleaned up. I implemented proper cleanup in useEffect hooks and the issue was resolved."
  }'`;
    
    console.log('\n📋 Use this curl command to test:');
    console.log(curlCommand);
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await pool.end();
  }
}

createTestData(); 