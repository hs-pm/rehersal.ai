import { sql } from '@vercel/postgres'

export interface Question {
  id: string
  question: string
  type: 'behavioral' | 'technical' | 'situational'
  category: string
  created_at: Date
}

export interface PracticeSession {
  id: string
  title: string
  subject: string
  created_at: Date
  completed_at?: Date
  total_questions: number
  completed_questions: number
}

export interface Response {
  id: string
  session_id: string
  question_id: string
  question_text: string
  audio_url?: string
  video_url?: string
  text_response?: string
  transcription?: string
  evaluation?: any
  created_at: Date
}

export async function createTables() {
  try {
    // Create questions table
    await sql`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('behavioral', 'technical', 'situational')),
        category VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create practice_sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS practice_sessions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        subject VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        total_questions INTEGER DEFAULT 0,
        completed_questions INTEGER DEFAULT 0
      )
    `

    // Create responses table
    await sql`
      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES practice_sessions(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        audio_url TEXT,
        video_url TEXT,
        text_response TEXT,
        transcription TEXT,
        evaluation JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log('Database tables created successfully')
  } catch (error) {
    console.error('Error creating tables:', error)
    throw error
  }
}

export async function insertQuestion(question: Omit<Question, 'id' | 'created_at'>) {
  const result = await sql`
    INSERT INTO questions (question, type, category)
    VALUES (${question.question}, ${question.type}, ${question.category})
    RETURNING *
  `
  return result.rows[0]
}

export async function insertPracticeSession(session: Omit<PracticeSession, 'id' | 'created_at'>) {
  const result = await sql`
    INSERT INTO practice_sessions (title, subject, total_questions, completed_questions)
    VALUES (${session.title}, ${session.subject}, ${session.total_questions}, ${session.completed_questions || 0})
    RETURNING *
  `
  return result.rows[0]
}

export async function insertResponse(response: Omit<Response, 'id' | 'created_at'>) {
  const result = await sql`
    INSERT INTO responses (session_id, question_id, question_text, audio_url, video_url, text_response, transcription, evaluation)
    VALUES (${response.session_id}, ${response.question_id}, ${response.question_text}, ${response.audio_url}, ${response.video_url}, ${response.text_response}, ${response.transcription}, ${response.evaluation})
    RETURNING *
  `
  return result.rows[0]
}

export async function getPracticeSessions() {
  const result = await sql`
    SELECT * FROM practice_sessions 
    ORDER BY created_at DESC
  `
  return result.rows
}

export async function getSessionResponses(sessionId: string) {
  const result = await sql`
    SELECT r.*, q.question as original_question, q.type, q.category
    FROM responses r
    JOIN questions q ON r.question_id = q.id
    WHERE r.session_id = ${sessionId}
    ORDER BY r.created_at
  `
  return result.rows
}

export async function updateSessionProgress(sessionId: string, completedQuestions: number) {
  await sql`
    UPDATE practice_sessions 
    SET completed_questions = ${completedQuestions}
    WHERE id = ${sessionId}
  `
} 