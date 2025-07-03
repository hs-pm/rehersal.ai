// Simple in-memory storage with localStorage fallback
// This demonstrates how we can eliminate external databases for text-only data

interface Question {
  id: string;
  question: string;
  type: string;
  category: string;
  created_at: string;
}

interface PracticeSession {
  id: string;
  title: string;
  subject: string;
  created_at: string;
  completed_at?: string;
  total_questions: number;
  completed_questions: number;
  resume?: string;
  job_description?: string;
}

interface Response {
  id: string;
  session_id: string;
  question_id: string;
  question_text: string;
  text_response: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  timeline_analysis: {
    clarity: number;
    confidence: number;
    technical_depth: number;
    communication: number;
    structure: number;
    engagement: number;
    completeness: number;
  };
  created_at: string;
}

class SimpleStorage {
  private sessions: Map<string, PracticeSession> = new Map();
  private questions: Map<string, Question> = new Map();
  private responses: Map<string, Response> = new Map();
  private sessionResponses: Map<string, string[]> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const sessionsData = localStorage.getItem('sessions');
        const questionsData = localStorage.getItem('questions');
        const responsesData = localStorage.getItem('responses');
        const sessionResponsesData = localStorage.getItem('sessionResponses');

        if (sessionsData) {
          const sessions = JSON.parse(sessionsData);
          this.sessions = new Map(Object.entries(sessions));
        }
        if (questionsData) {
          const questions = JSON.parse(questionsData);
          this.questions = new Map(Object.entries(questions));
        }
        if (responsesData) {
          const responses = JSON.parse(responsesData);
          this.responses = new Map(Object.entries(responses));
        }
        if (sessionResponsesData) {
          const sessionResponses = JSON.parse(sessionResponsesData);
          this.sessionResponses = new Map(Object.entries(sessionResponses));
        }
      } catch (error) {
        console.warn('Failed to load from localStorage:', error);
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sessions', JSON.stringify(Object.fromEntries(this.sessions)));
        localStorage.setItem('questions', JSON.stringify(Object.fromEntries(this.questions)));
        localStorage.setItem('responses', JSON.stringify(Object.fromEntries(this.responses)));
        localStorage.setItem('sessionResponses', JSON.stringify(Object.fromEntries(this.sessionResponses)));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }
  }

  // Session Management
  async createSession(session: Omit<PracticeSession, 'id' | 'created_at'>): Promise<PracticeSession> {
    const id = Date.now().toString();
    const newSession: PracticeSession = {
      ...session,
      id,
      created_at: new Date().toISOString()
    };
    
    this.sessions.set(id, newSession);
    this.saveToStorage();
    
    return newSession;
  }

  async getSession(id: string): Promise<PracticeSession | null> {
    return this.sessions.get(id) || null;
  }

  async updateSession(id: string, updates: Partial<PracticeSession>): Promise<void> {
    const session = this.sessions.get(id);
    if (session) {
      const updated = { ...session, ...updates };
      this.sessions.set(id, updated);
      this.saveToStorage();
    }
  }

  async listSessions(limit = 50): Promise<PracticeSession[]> {
    return Array.from(this.sessions.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  // Question Management
  async storeQuestion(question: Omit<Question, 'id' | 'created_at'>): Promise<Question> {
    const id = Date.now().toString();
    const newQuestion: Question = {
      ...question,
      id,
      created_at: new Date().toISOString()
    };
    
    this.questions.set(id, newQuestion);
    this.saveToStorage();
    
    return newQuestion;
  }

  async getQuestion(id: string): Promise<Question | null> {
    return this.questions.get(id) || null;
  }

  async getQuestionsByCategory(category: string, limit = 10): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter(q => q.category.toLowerCase().includes(category.toLowerCase()))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  // Response Management
  async storeResponse(response: Omit<Response, 'id' | 'created_at'>): Promise<Response> {
    const id = Date.now().toString();
    const newResponse: Response = {
      ...response,
      id,
      created_at: new Date().toISOString()
    };
    
    this.responses.set(id, newResponse);
    
    // Add to session responses
    const sessionResponses = this.sessionResponses.get(response.session_id) || [];
    sessionResponses.push(id);
    this.sessionResponses.set(response.session_id, sessionResponses);
    
    this.saveToStorage();
    
    return newResponse;
  }

  async getResponse(id: string): Promise<Response | null> {
    return this.responses.get(id) || null;
  }

  async getSessionResponses(sessionId: string): Promise<Response[]> {
    const responseIds = this.sessionResponses.get(sessionId) || [];
    return responseIds
      .map(id => this.responses.get(id))
      .filter(Boolean) as Response[];
  }

  // Analytics
  async getSessionStats(sessionId: string): Promise<{
    total_questions: number;
    completed_questions: number;
    average_score: number;
    total_time: number;
  }> {
    const responses = await this.getSessionResponses(sessionId);
    const session = await this.getSession(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    const scores = responses.map(r => r.score);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return {
      total_questions: session.total_questions,
      completed_questions: responses.length,
      average_score: averageScore,
      total_time: responses.length * 2 // Rough estimate: 2 minutes per response
    };
  }

  // Cleanup
  async deleteSession(id: string): Promise<void> {
    const responses = await this.getSessionResponses(id);
    
    // Delete all responses
    responses.forEach(r => this.responses.delete(r.id));
    this.sessionResponses.delete(id);
    
    // Delete session
    this.sessions.delete(id);
    this.saveToStorage();
  }

  // Get storage stats
  getStorageStats(): {
    sessions: number;
    questions: number;
    responses: number;
    estimatedSize: string;
  } {
    const sessionsSize = JSON.stringify(Object.fromEntries(this.sessions)).length;
    const questionsSize = JSON.stringify(Object.fromEntries(this.questions)).length;
    const responsesSize = JSON.stringify(Object.fromEntries(this.responses)).length;
    const totalSize = sessionsSize + questionsSize + responsesSize;
    
    return {
      sessions: this.sessions.size,
      questions: this.questions.size,
      responses: this.responses.size,
      estimatedSize: `${(totalSize / 1024).toFixed(2)} KB`
    };
  }
}

export const simpleStorage = new SimpleStorage(); 