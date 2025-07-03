const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined
  }
});

async function checkSessions() {
  console.log('🔍 Checking database for sessions...\n');
  
  try {
    // Check if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('practice_sessions', 'questions', 'responses')
    `);
    
    console.log('📋 Existing tables:', tablesResult.rows.map(row => row.table_name));
    
    // Check practice_sessions table
    const sessionsResult = await pool.query('SELECT * FROM practice_sessions ORDER BY id');
    console.log('\n📊 Practice Sessions:');
    if (sessionsResult.rows.length === 0) {
      console.log('   No sessions found');
    } else {
      sessionsResult.rows.forEach(session => {
        console.log(`   ID: ${session.id}, Title: "${session.title}", Subject: "${session.subject}", Created: ${session.created_at}`);
      });
    }
    
    // Check questions table
    const questionsResult = await pool.query('SELECT * FROM questions ORDER BY id');
    console.log('\n❓ Questions:');
    if (questionsResult.rows.length === 0) {
      console.log('   No questions found');
    } else {
      questionsResult.rows.forEach(question => {
        console.log(`   ID: ${question.id}, Type: "${question.type}", Category: "${question.category}"`);
      });
    }
    
    // Check responses table
    const responsesResult = await pool.query('SELECT * FROM responses ORDER BY id');
    console.log('\n💬 Responses:');
    if (responsesResult.rows.length === 0) {
      console.log('   No responses found');
    } else {
      responsesResult.rows.forEach(response => {
        console.log(`   ID: ${response.id}, Session ID: ${response.session_id}, Question ID: ${response.question_id}`);
      });
    }
    
    // Check foreign key relationships
    console.log('\n🔗 Foreign Key Analysis:');
    const sessionIds = sessionsResult.rows.map(s => s.id);
    const questionIds = questionsResult.rows.map(q => q.id);
    
    console.log(`   Available Session IDs: [${sessionIds.join(', ')}]`);
    console.log(`   Available Question IDs: [${questionIds.join(', ')}]`);
    
    if (responsesResult.rows.length > 0) {
      const invalidSessionRefs = responsesResult.rows.filter(r => !sessionIds.includes(r.session_id));
      const invalidQuestionRefs = responsesResult.rows.filter(r => !questionIds.includes(r.question_id));
      
      if (invalidSessionRefs.length > 0) {
        console.log(`   ⚠️  Invalid session references: ${invalidSessionRefs.map(r => r.session_id).join(', ')}`);
      }
      if (invalidQuestionRefs.length > 0) {
        console.log(`   ⚠️  Invalid question references: ${invalidQuestionRefs.map(r => r.question_id).join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await pool.end();
  }
}

checkSessions(); 