const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined
  }
});

async function testCurrentState() {
  console.log('🔍 Testing current database state...\n');

  try {
    // Test 1: Check if tables exist
    console.log('1. Checking if tables exist...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('questions', 'practice_sessions', 'responses')
    `);
    console.log('Existing tables:', tablesResult.rows.map(row => row.table_name));

    // Test 2: Check questions table structure
    console.log('\n2. Checking questions table structure...');
    const questionsStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'questions' 
      ORDER BY ordinal_position
    `);
    console.log('Questions table structure:');
    questionsStructure.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    // Test 3: Check existing questions
    console.log('\n3. Checking existing questions...');
    const questionsResult = await pool.query('SELECT id, question, type, category FROM questions LIMIT 5');
    console.log('Existing questions:', questionsResult.rows);

    // Test 4: Check practice_sessions table
    console.log('\n4. Checking practice_sessions table...');
    const sessionsResult = await pool.query('SELECT id, title, subject FROM practice_sessions LIMIT 5');
    console.log('Existing sessions:', sessionsResult.rows);

    // Test 5: Test session creation
    console.log('\n5. Testing session creation...');
    const sessionInsertResult = await pool.query(`
      INSERT INTO practice_sessions (title, subject, total_questions) 
      VALUES ($1, $2, $3) 
      RETURNING id, title, subject
    `, ['Test Session', 'Test Subject', 5]);
    console.log('Created session:', sessionInsertResult.rows[0]);

    // Test 6: Test question insertion with proper type
    console.log('\n6. Testing question insertion...');
    const questionInsertResult = await pool.query(`
      INSERT INTO questions (question, type, category) 
      VALUES ($1, $2, $3) 
      RETURNING id, question, type, category
    `, ['Test question for evaluation', 'behavioral', 'Test Category']);
    console.log('Created question:', questionInsertResult.rows[0]);

    // Test 7: Test response insertion
    console.log('\n7. Testing response insertion...');
    const responseInsertResult = await pool.query(`
      INSERT INTO responses (session_id, question_id, question_text, text_response, evaluation) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, session_id, question_id
    `, [
      sessionInsertResult.rows[0].id,
      questionInsertResult.rows[0].id,
      'Test question text',
      'Test response text',
      JSON.stringify({
        score: 85,
        feedback: 'Test feedback',
        strengths: ['Good response'],
        improvements: ['Could be better'],
        timeline_analysis: {
          clarity: 8,
          confidence: 7,
          technical_depth: 6,
          communication: 8,
          structure: 7,
          engagement: 7,
          completeness: 8
        }
      })
    ]);
    console.log('Created response:', responseInsertResult.rows[0]);

    console.log('\n✅ All tests passed! Database is working correctly.');

  } catch (error) {
    console.error('❌ Error during testing:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint
    });
  } finally {
    await pool.end();
  }
}

testCurrentState(); 