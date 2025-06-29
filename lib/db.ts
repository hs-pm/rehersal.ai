import { Pool } from 'pg'

// Hardcoded database configuration for Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export interface Question {
  id: string
  question: string
  type: 'behavioral' | 'technical' | 'situational' | 'coding' | 'sql_query_writing' | 'python_data_science'
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
  resume?: string
  job_description?: string
  candidate_analysis?: string
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
    // Drop existing questions table to recreate with new constraint
    try {
      await pool.query('DROP TABLE IF EXISTS questions CASCADE')
      console.log('Dropped existing questions table')
    } catch (error) {
      console.log('No existing questions table to drop')
    }

    // Create questions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('behavioral', 'technical', 'situational', 'coding', 'sql_query_writing', 'python_data_science')),
        category VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

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
    `)

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
    `)

    console.log('Database tables created successfully')
  } catch (error) {
    console.error('Error creating tables:', error)
    throw error
  }
}

export async function insertQuestion(question: Omit<Question, 'id' | 'created_at'>): Promise<Question> {
  try {
    const result = await pool.query(
      'INSERT INTO questions (question, type, category) VALUES ($1, $2, $3) RETURNING *',
      [question.question, question.type, question.category]
    )
    return result.rows[0]
  } catch (error) {
    console.error('Error inserting question:', error)
    throw error
  }
}

export async function getQuestions(subject?: string, limit: number = 10): Promise<Question[]> {
  try {
    let query = 'SELECT * FROM questions'
    let params: any[] = []

    if (subject) {
      query += ' WHERE LOWER(category) LIKE LOWER($1)'
      params.push(`%${subject}%`)
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1)
    params.push(limit)

    const result = await pool.query(query, params)
    return result.rows
  } catch (error) {
    console.error('Error getting questions:', error)
    throw error
  }
}

export async function createPracticeSession(session: Omit<PracticeSession, 'id' | 'created_at'>): Promise<PracticeSession> {
  try {
    const result = await pool.query(
      'INSERT INTO practice_sessions (title, subject, total_questions, resume, job_description, candidate_analysis) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [session.title, session.subject, session.total_questions, session.resume, session.job_description, session.candidate_analysis]
    )
    return result.rows[0]
  } catch (error) {
    console.error('Error creating practice session:', error)
    throw error
  }
}

// Alias for backward compatibility
export const insertPracticeSession = createPracticeSession

export async function getPracticeSessions(): Promise<PracticeSession[]> {
  try {
    const result = await pool.query('SELECT * FROM practice_sessions ORDER BY created_at DESC')
    return result.rows
  } catch (error) {
    console.error('Error getting practice sessions:', error)
    throw error
  }
}

export async function getPracticeSessionById(id: string): Promise<PracticeSession | null> {
  try {
    const result = await pool.query('SELECT * FROM practice_sessions WHERE id = $1', [id])
    return result.rows[0] || null
  } catch (error) {
    console.error('Error getting practice session by ID:', error)
    throw error
  }
}

export async function insertResponse(response: Omit<Response, 'id' | 'created_at'>): Promise<Response> {
  try {
    const result = await pool.query(
      'INSERT INTO responses (session_id, question_id, question_text, audio_url, video_url, text_response, transcription, evaluation) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [response.session_id, response.question_id, response.question_text, response.audio_url, response.video_url, response.text_response, response.transcription, response.evaluation]
    )
    return result.rows[0]
  } catch (error) {
    console.error('Error inserting response:', error)
    throw error
  }
}

export async function getResponses(sessionId: string): Promise<Response[]> {
  try {
    const result = await pool.query('SELECT * FROM responses WHERE session_id = $1 ORDER BY created_at', [sessionId])
    return result.rows
  } catch (error) {
    console.error('Error getting responses:', error)
    throw error
  }
}

export async function getQuestionById(id: string): Promise<Question | null> {
  try {
    const result = await pool.query('SELECT * FROM questions WHERE id = $1', [id])
    return result.rows[0] || null
  } catch (error) {
    console.error('Error getting question by ID:', error)
    throw error
  }
} 