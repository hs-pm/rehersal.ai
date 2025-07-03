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

// Helper: Robust JSON parsing that handles common formatting issues
function parseJSONSafely(jsonString: string): any {
  // First attempt: direct parsing
  try {
    return JSON.parse(jsonString);
  } catch (firstError) {
    console.log('Failed to parse JSON, trying to extract JSON from response:', firstError);
    
    // Second attempt: clean up common issues
    try {
      let cleaned = jsonString
        .replace(/,\s*}/g, '}')  // Remove trailing commas before closing braces
        .replace(/,\s*]/g, ']')  // Remove trailing commas before closing brackets
        .replace(/,\s*$/g, '')   // Remove trailing commas at end
        .replace(/^\s*\[/, '[')  // Ensure starts with [
        .replace(/\]\s*$/, ']'); // Ensure ends with ]
      
      return JSON.parse(cleaned);
    } catch (secondError) {
      console.log('Failed to parse cleaned JSON:', secondError);
      
      // Third attempt: try to extract array from the response
      try {
        const arrayMatch = jsonString.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          let extracted = arrayMatch[0]
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']')
            .replace(/,\s*$/g, '');
          return JSON.parse(extracted);
        }
      } catch (thirdError) {
        console.log('Failed to extract and parse array:', thirdError);
      }
      
      // Fourth attempt: try to fix common JSON issues more aggressively
      try {
        let fixed = jsonString
          .replace(/,\s*([}\]])/g, '$1')  // Remove trailing commas
          .replace(/,\s*$/gm, '')         // Remove trailing commas at line ends
          .replace(/,\s*([}\]])/g, '$1')  // Remove any remaining trailing commas
          .replace(/([^"])\s*:\s*([^"{\[\d])/g, '$1: "$2')  // Quote unquoted values
          .replace(/([^"])\s*:\s*$/gm, '$1: ""')  // Handle empty values
          .replace(/,\s*([}\]])/g, '$1');  // Final trailing comma cleanup
        
        return JSON.parse(fixed);
      } catch (fourthError) {
        console.log('Object extraction parsing failed:', fourthError);
      }
      
      throw new Error('All JSON parsing attempts failed');
    }
  }
}

// Enhanced type validation and normalization
const VALID_TYPES = ['behavioral', 'technical', 'situational', 'coding', 'sql_query_writing', 'python_data_science'] as const;
type ValidType = typeof VALID_TYPES[number];

function normalizeType(type: any, fallback: ValidType = 'behavioral'): ValidType {
  // Handle null, undefined, or empty values
  if (!type || type === '' || type === null || type === undefined) {
    return fallback;
  }
  
  // Handle numeric values (convert to string)
  if (typeof type === 'number') {
    console.warn(`Received numeric type: ${type}, converting to fallback: ${fallback}`);
    return fallback;
  }
  
  // Handle string values
  if (typeof type === 'string') {
    const normalized = type.trim().toLowerCase();
    if (VALID_TYPES.includes(normalized as ValidType)) {
      return normalized as ValidType;
    }
    console.warn(`Invalid type string: "${type}", using fallback: ${fallback}`);
    return fallback;
  }
  
  // Handle any other type
  console.warn(`Unexpected type value: ${type} (${typeof type}), using fallback: ${fallback}`);
  return fallback;
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
      
      // Validate and fix question types with enhanced validation
      questions = parsedQuestions.map((q: any, index: number) => {
        // Ensure all required fields exist
        const question: Question = {
          id: (q.id || (index + 1)).toString(),
          question: q.question || `Sample ${subject} question ${index + 1}`,
          type: normalizeType(q.type, questionType),
          category: q.category || subject
        }
        
        // Log any type normalization for debugging
        if (q.type !== question.type) {
          console.log(`Type normalized from "${q.type}" to "${question.type}" for question ${index + 1}`);
        }
        
        return question;
      })
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