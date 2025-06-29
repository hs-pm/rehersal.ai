import { Groq } from 'groq-sdk'
import { getQuestionPrompt, getEvaluationPrompt } from './prompts'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

export interface Question {
  id: string
  question: string
  type: 'behavioral' | 'technical' | 'situational' | 'coding' | 'sql_query_writing' | 'python_data_science'
  category: string
}

export interface Evaluation {
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
  timeline_analysis: {
    clarity: number
    confidence: number
    technical_depth: number
    communication: number
    structure: number
    engagement: number
    completeness: number
  }
}

// Helper: Normalize and validate question type
const VALID_TYPES = ['behavioral', 'technical', 'situational', 'coding', 'sql_query_writing', 'python_data_science'] as const;
type ValidType = typeof VALID_TYPES[number];
function normalizeType(type: any, fallback: ValidType): ValidType {
  if (typeof type !== 'string') return fallback;
  const normalized = type.trim().toLowerCase();
  if (VALID_TYPES.includes(normalized as ValidType)) {
    return normalized as ValidType;
  }
  return fallback;
}

// Helper: Robust JSON parsing that handles common formatting issues
function parseJSONSafely(jsonString: string): any {
  try {
    // First try direct parsing
    return JSON.parse(jsonString);
  } catch (error) {
    console.log('Direct JSON parsing failed, attempting cleanup...');
    
    // Clean up common JSON issues
    let cleaned = jsonString
      // Remove trailing commas before closing brackets/braces
      .replace(/,(\s*[}\]])/g, '$1')
      // Remove trailing commas in objects
      .replace(/,(\s*})/g, '$1')
      // Remove trailing commas in arrays
      .replace(/,(\s*\])/g, '$1')
      // Fix common quote issues
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      // Remove any non-printable characters
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      // Trim whitespace
      .trim();
    
    try {
      return JSON.parse(cleaned);
    } catch (secondError) {
      console.log('Cleaned JSON parsing also failed:', secondError);
      
      // Try to extract just the array part
      const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        try {
          return JSON.parse(arrayMatch[0]);
        } catch (thirdError) {
          console.log('Array extraction parsing failed:', thirdError);
        }
      }
      
      throw new Error('All JSON parsing attempts failed');
    }
  }
}

export async function generateQuestions(
  subject: string,
  count: number,
  selectedTypes: string[] = ['behavioral', 'technical', 'situational', 'coding'],
  context?: {
    resume?: string
    jobDescription?: string
    candidateAnalysis?: string
  }
): Promise<Question[]> {
  try {
    console.log(`Generating questions for subject: ${subject} count: ${count} types:`, selectedTypes)
    
    const questionType = normalizeType(selectedTypes[0], 'behavioral');
    const prompt = getQuestionPrompt(questionType, count, subject, context)
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: prompt
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    })

    const response = completion.choices[0]?.message?.content || ''
    console.log('Raw Groq response:', response)

    // Try to parse the JSON response
    let questions: Question[] = []
    try {
      const parsedResponse = parseJSONSafely(response)
      
      // Extract questions from the JSON object response
      const parsedQuestions = parsedResponse.questions || parsedResponse
      
      // Validate and fix question types
      questions = parsedQuestions.map((q: any) => ({
        ...q,
        type: normalizeType(q.type, questionType),
      }))
    } catch (error) {
      console.log('Failed to parse JSON with robust parser:', error)
      
      // If still no success, create fallback questions
      if (!questions || questions.length === 0) {
        console.log('Creating fallback questions due to parsing failure')
        questions = Array.from({ length: count }, (_, i) => ({
          id: (i + 1).toString(),
          question: `Sample ${subject} question ${i + 1}`,
          type: questionType,
          category: subject
        }))
      }
    }

    console.log('Generated questions:', questions)
    return questions
  } catch (error) {
    console.error('Error generating questions:', error)
    
    // Return fallback questions
    const questionType = normalizeType(selectedTypes[0], 'behavioral');
    return Array.from({ length: count }, (_, i) => ({
      id: (i + 1).toString(),
      question: `Sample ${subject} question ${i + 1}`,
      type: questionType,
      category: subject
    }))
  }
}

export async function evaluateResponse(
  question: string,
  response: string,
  questionType: string = 'behavioral',
  context?: {
    resume?: string
    jobDescription?: string
    candidateAnalysis?: string
  }
): Promise<Evaluation> {
  try {
    const prompt = getEvaluationPrompt(questionType, context)
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: prompt
        },
        {
          role: 'user',
          content: `Question: ${question}\n\nResponse: ${response}\n\nPlease evaluate this response.`
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    })

    const responseText = completion.choices[0]?.message?.content || ''
    console.log('Raw evaluation response:', responseText)

    // Try to parse the JSON response
    try {
      const evaluation = parseJSONSafely(responseText)
      return evaluation
    } catch (error) {
      console.error('Failed to parse evaluation response:', error)
      
      // Return a default evaluation
      return {
        score: 50,
        feedback: 'Unable to parse evaluation response',
        strengths: [],
        improvements: ['Provide a more detailed response'],
        timeline_analysis: {
          clarity: 5,
          confidence: 5,
          technical_depth: 5,
          communication: 5,
          structure: 5,
          engagement: 5,
          completeness: 5
        }
      }
    }
  } catch (error) {
    console.error('Error evaluating response:', error)
    
    // Return a default evaluation
    return {
      score: 50,
      feedback: 'Error occurred during evaluation',
      strengths: [],
      improvements: ['Try again with a more detailed response'],
      timeline_analysis: {
        clarity: 5,
        confidence: 5,
        technical_depth: 5,
        communication: 5,
        structure: 5,
        engagement: 5,
        completeness: 5
      }
    }
  }
}

export async function transcribeAudio(audioBase64: string) {
  try {
    // Note: Groq doesn't have direct speech-to-text yet, so we'll use a placeholder
    // In production, you'd integrate with Whisper API or similar
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a speech-to-text transcription service. Transcribe the provided audio content accurately."
        },
        {
          role: "user", 
          content: `Transcribe this audio: ${audioBase64.substring(0, 100)}...`
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.1,
    })

    return completion.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Error transcribing audio:', error)
    throw error
  }
} 