import { Redis } from '@upstash/redis'
import { put, del } from '@vercel/blob'

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Types
export interface Question {
  id: string
  question: string
  type: 'behavioral' | 'technical' | 'situational' | 'coding' | 'sql_query_writing' | 'python_data_science'
  category: string
  created_at: string
}

export interface PracticeSession {
  id: string
  title: string
  subject: string
  created_at: string
  completed_at?: string
  total_questions: number
  completed_questions: number
  resume?: string
  job_description?: string
  candidate_analysis?: string
  question_ids: string[]
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
  created_at: string
}

// Storage Keys
const STORAGE_KEYS = {
  QUESTIONS: 'questions',
  SESSIONS: 'sessions',
  RESPONSES: 'responses',
  QUESTION_COUNTER: 'question_counter',
  SESSION_COUNTER: 'session_counter',
  RESPONSE_COUNTER: 'response_counter'
} as const

// Utility functions
function generateId(counterKey: string): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Questions
export async function insertQuestion(question: Omit<Question, 'id' | 'created_at'>): Promise<Question> {
  try {
    const id = generateId(STORAGE_KEYS.QUESTION_COUNTER)
    const newQuestion: Question = {
      ...question,
      id,
      created_at: new Date().toISOString()
    }

    // Store in Redis
    await redis.hset(STORAGE_KEYS.QUESTIONS, { [id]: JSON.stringify(newQuestion) })
    
    console.log('Question stored in Vercel KV:', id)
    return newQuestion
  } catch (error) {
    console.error('Error inserting question:', error)
    throw error
  }
}

export async function getQuestions(subject?: string, limit: number = 10): Promise<Question[]> {
  try {
    const questionsData = await redis.hgetall(STORAGE_KEYS.QUESTIONS)
    if (!questionsData) return []

    const questions: Question[] = Object.values(questionsData)
      .map(q => typeof q === 'string' ? JSON.parse(q) : q)
      .filter(q => q && q.question)

    // Filter by subject if provided
    let filtered = questions
    if (subject) {
      filtered = questions.filter(q => 
        q.category.toLowerCase().includes(subject.toLowerCase())
      )
    }

    // Sort by created_at and limit (ascending order to maintain generation sequence)
    return filtered
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(0, limit)
  } catch (error) {
    console.error('Error getting questions:', error)
    return []
  }
}

export async function getQuestionById(id: string): Promise<Question | null> {
  try {
    const questionData = await redis.hget(STORAGE_KEYS.QUESTIONS, id)
    if (!questionData) return null
    
    const parsed = typeof questionData === 'string' ? JSON.parse(questionData) : questionData
    return parsed as Question
  } catch (error) {
    console.error('Error getting question by ID:', error)
    return null
  }
}

// Sessions
export async function createPracticeSession(session: Omit<PracticeSession, 'id' | 'created_at'>): Promise<PracticeSession> {
  try {
    const id = generateId(STORAGE_KEYS.SESSION_COUNTER)
    const newSession: PracticeSession = {
      ...session,
      id,
      created_at: new Date().toISOString()
    }

    await redis.hset(STORAGE_KEYS.SESSIONS, { [id]: JSON.stringify(newSession) })
    
    console.log('Session stored in Vercel KV:', id)
    return newSession
  } catch (error) {
    console.error('Error creating practice session:', error)
    throw error
  }
}

export async function getPracticeSessions(): Promise<PracticeSession[]> {
  try {
    const sessionsData = await redis.hgetall(STORAGE_KEYS.SESSIONS)
    if (!sessionsData) return []

    const sessions: PracticeSession[] = Object.values(sessionsData)
      .map(s => typeof s === 'string' ? JSON.parse(s) : s)
      .filter(s => s && s.title)

    return sessions.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  } catch (error) {
    console.error('Error getting practice sessions:', error)
    return []
  }
}

export async function getPracticeSessionById(id: string): Promise<PracticeSession | null> {
  try {
    const sessionData = await redis.hget(STORAGE_KEYS.SESSIONS, id)
    if (!sessionData) return null
    
    const parsed = typeof sessionData === 'string' ? JSON.parse(sessionData) : sessionData
    return parsed as PracticeSession
  } catch (error) {
    console.error('Error getting session by ID:', error)
    return null
  }
}

// Responses
export async function insertResponse(response: Omit<Response, 'id' | 'created_at'>): Promise<Response> {
  try {
    const id = generateId(STORAGE_KEYS.RESPONSE_COUNTER)
    const newResponse: Response = {
      ...response,
      id,
      created_at: new Date().toISOString()
    }

    await redis.hset(STORAGE_KEYS.RESPONSES, { [id]: JSON.stringify(newResponse) })
    
    console.log('Response stored in Vercel KV:', id)
    return newResponse
  } catch (error) {
    console.error('Error inserting response:', error)
    throw error
  }
}

export async function getResponses(sessionId: string): Promise<Response[]> {
  try {
    const responsesData = await redis.hgetall(STORAGE_KEYS.RESPONSES)
    if (!responsesData) return []

    const responses: Response[] = Object.values(responsesData)
      .map(r => typeof r === 'string' ? JSON.parse(r) : r)
      .filter(r => r && r.session_id === sessionId)

    return responses.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  } catch (error) {
    console.error('Error getting responses:', error)
    return []
  }
}

// Video Storage
export async function uploadVideo(file: File, sessionId: string, questionId: string): Promise<{ url: string; id: string }> {
  try {
    const videoId = `video-${sessionId}-${questionId}-${Date.now()}`
    const blob = await put(videoId, file, { access: 'public' })
    
    return {
      url: blob.url,
      id: videoId
    }
  } catch (error) {
    console.error('Error uploading video:', error)
    throw error
  }
}

export async function deleteVideo(videoId: string): Promise<void> {
  try {
    await del(videoId)
  } catch (error) {
    console.error('Error deleting video:', error)
  }
}

// Cleanup function for expired data (optional)
export async function cleanupExpiredData(): Promise<void> {
  try {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    
    // Clean up old sessions
    const sessions = await getPracticeSessions()
    for (const session of sessions) {
      if (new Date(session.created_at) < cutoffDate) {
        await redis.hdel(STORAGE_KEYS.SESSIONS, session.id)
      }
    }
    
    // Clean up old questions
    const questions = await getQuestions()
    for (const question of questions) {
      if (new Date(question.created_at) < cutoffDate) {
        await redis.hdel(STORAGE_KEYS.QUESTIONS, question.id)
      }
    }
    
    console.log('Cleanup completed')
  } catch (error) {
    console.error('Error during cleanup:', error)
  }
}

// Backward compatibility aliases
export const insertPracticeSession = createPracticeSession 