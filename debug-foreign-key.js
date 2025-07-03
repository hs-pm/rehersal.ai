const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined
  }
});

async function debugForeignKey() {
  console.log('🔍 Debugging foreign key constraint issue...\n');
  
  try {
    // Check the actual data types in the database
    const schemaResult = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'responses' 
      AND column_name IN ('session_id', 'question_id')
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Responses table schema:');
    schemaResult.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check the sessions table schema
    const sessionsSchemaResult = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'practice_sessions' 
      AND column_name = 'id'
    `);
    
    console.log('\n📋 Practice_sessions table schema:');
    sessionsSchemaResult.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check the questions table schema
    const questionsSchemaResult = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'questions' 
      AND column_name = 'id'
    `);
    
    console.log('\n📋 Questions table schema:');
    questionsSchemaResult.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check actual values in the tables
    const sessionsResult = await pool.query('SELECT id, title FROM practice_sessions');
    console.log('\n📊 Actual session IDs:');
    sessionsResult.rows.forEach(session => {
      console.log(`   ID: ${session.id} (type: ${typeof session.id}), Title: "${session.title}"`);
    });
    
    const questionsResult = await pool.query('SELECT id, question FROM questions LIMIT 3');
    console.log('\n❓ Actual question IDs:');
    questionsResult.rows.forEach(question => {
      console.log(`   ID: ${question.id} (type: ${typeof question.id}), Question: "${question.question.substring(0, 50)}..."`);
    });
    
    // Test what happens when we try to insert with string vs integer
    console.log('\n🧪 Testing data type conversion...');
    
    // Test with string IDs
    try {
      const testResult1 = await pool.query(`
        INSERT INTO responses (session_id, question_id, question_text, text_response) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id
      `, ['1', '1', 'Test question', 'Test response']);
      console.log('✅ String IDs worked, created response ID:', testResult1.rows[0].id);
      
      // Clean up
      await pool.query('DELETE FROM responses WHERE id = $1', [testResult1.rows[0].id]);
      console.log('   Cleaned up test response');
      
    } catch (error) {
      console.log('❌ String IDs failed:', error.message);
    }
    
    // Test with integer IDs
    try {
      const testResult2 = await pool.query(`
        INSERT INTO responses (session_id, question_id, question_text, text_response) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id
      `, [1, 1, 'Test question', 'Test response']);
      console.log('✅ Integer IDs worked, created response ID:', testResult2.rows[0].id);
      
      // Clean up
      await pool.query('DELETE FROM responses WHERE id = $1', [testResult2.rows[0].id]);
      console.log('   Cleaned up test response');
      
    } catch (error) {
      console.log('❌ Integer IDs failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error debugging foreign key:', error);
  } finally {
    await pool.end();
  }
}

debugForeignKey(); 