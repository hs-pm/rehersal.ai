import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

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
  audio_url?: string;
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

class GoogleDriveStorage {
  private drive: any;
  private folderId: string;

  constructor() {
    const auth = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    this.drive = google.drive({ version: 'v3', auth });
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
  }

  // Create a new file in Google Drive
  private async createFile(filename: string, content: any): Promise<string> {
    const fileMetadata = {
      name: filename,
      parents: [this.folderId]
    };

    const media = {
      mimeType: 'application/json',
      body: JSON.stringify(content, null, 2)
    };

    const file = await this.drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id'
    });

    return file.data.id;
  }

  // Read a file from Google Drive
  private async readFile(fileId: string): Promise<any> {
    const response = await this.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });

    return JSON.parse(response.data);
  }

  // List files in the folder
  private async listFiles(query?: string): Promise<any[]> {
    const response = await this.drive.files.list({
      q: `'${this.folderId}' in parents${query ? ` and ${query}` : ''}`,
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc'
    });

    return response.data.files || [];
  }

  // Questions Storage
  async insertQuestion(question: Omit<Question, 'id' | 'created_at'>): Promise<Question> {
    const id = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullQuestion: Question = {
      ...question,
      id,
      created_at: new Date().toISOString()
    };

    const filename = `questions/${id}.json`;
    await this.createFile(filename, fullQuestion);
    
    return fullQuestion;
  }

  async getQuestions(limit: number = 10): Promise<Question[]> {
    const files = await this.listFiles("name contains 'questions/'");
    const questions: Question[] = [];

    for (let i = 0; i < Math.min(limit, files.length); i++) {
      try {
        const question = await this.readFile(files[i].id);
        questions.push(question);
      } catch (error) {
        console.error(`Error reading question file ${files[i].id}:`, error);
      }
    }

    return questions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Sessions Storage
  async insertPracticeSession(session: Omit<PracticeSession, 'id' | 'created_at'>): Promise<PracticeSession> {
    const id = `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullSession: PracticeSession = {
      ...session,
      id,
      created_at: new Date().toISOString()
    };

    const filename = `sessions/${id}.json`;
    await this.createFile(filename, fullSession);
    
    return fullSession;
  }

  async getSession(sessionId: string): Promise<PracticeSession | null> {
    try {
      const files = await this.listFiles(`name = 'sessions/${sessionId}.json'`);
      if (files.length === 0) return null;
      
      return await this.readFile(files[0].id);
    } catch (error) {
      console.error(`Error reading session ${sessionId}:`, error);
      return null;
    }
  }

  async updateSession(sessionId: string, updates: Partial<PracticeSession>): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const updatedSession = { ...session, ...updates };
    const filename = `sessions/${sessionId}.json`;
    
    // Delete old file and create new one
    const files = await this.listFiles(`name = '${filename}'`);
    if (files.length > 0) {
      await this.drive.files.delete({ fileId: files[0].id });
    }
    
    await this.createFile(filename, updatedSession);
  }

  // Responses Storage
  async insertResponse(response: Omit<Response, 'id' | 'created_at'>): Promise<Response> {
    const id = `r_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullResponse: Response = {
      ...response,
      id,
      created_at: new Date().toISOString()
    };

    const filename = `responses/${id}.json`;
    await this.createFile(filename, fullResponse);
    
    return fullResponse;
  }

  async getSessionResponses(sessionId: string): Promise<Response[]> {
    const files = await this.listFiles("name contains 'responses/'");
    const responses: Response[] = [];

    for (const file of files) {
      try {
        const response = await this.readFile(file.id);
        if (response.session_id === sessionId) {
          responses.push(response);
        }
      } catch (error) {
        console.error(`Error reading response file ${file.id}:`, error);
      }
    }

    return responses.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  // Demo-specific methods
  async getDemoData(): Promise<{
    questions: Question[];
    sessions: PracticeSession[];
    responses: Response[];
  }> {
    const [questions, sessionFiles, responseFiles] = await Promise.all([
      this.getQuestions(50),
      this.listFiles("name contains 'sessions/'"),
      this.listFiles("name contains 'responses/'")
    ]);

    const sessions: PracticeSession[] = [];
    const responses: Response[] = [];

    // Get recent sessions
    for (let i = 0; i < Math.min(10, sessionFiles.length); i++) {
      try {
        const session = await this.readFile(sessionFiles[i].id);
        sessions.push(session);
      } catch (error) {
        console.error(`Error reading session file ${sessionFiles[i].id}:`, error);
      }
    }

    // Get recent responses
    for (let i = 0; i < Math.min(50, responseFiles.length); i++) {
      try {
        const response = await this.readFile(responseFiles[i].id);
        responses.push(response);
      } catch (error) {
        console.error(`Error reading response file ${responseFiles[i].id}:`, error);
      }
    }

    return { questions, sessions, responses };
  }

  // Cleanup old demo data
  async cleanupOldData(daysOld: number = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const allFiles = await this.listFiles();
    
    for (const file of allFiles) {
      const fileDate = new Date(file.createdTime);
      if (fileDate < cutoffDate) {
        try {
          await this.drive.files.delete({ fileId: file.id });
          console.log(`Deleted old file: ${file.name}`);
        } catch (error) {
          console.error(`Error deleting file ${file.id}:`, error);
        }
      }
    }
  }
}

// Export singleton instance
export const googleDriveStorage = new GoogleDriveStorage();

// Export types for use in other files
export type { Question, PracticeSession, Response }; 