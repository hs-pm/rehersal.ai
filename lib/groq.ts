import { Groq } from 'groq-sdk'
import { getQuestionPrompt, getEvaluationPrompt } from './prompts'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

export interface Question {
  id: string
  question: string
  type: string
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

export async function generateQuestions(
  subject: string,
  count: number,
  selectedTypes: string[] = ['behavioral', 'technical', 'situational', 'coding']
): Promise<Question[]> {
  try {
    console.log(`Generating questions for subject: ${subject} count: ${count} types:`, selectedTypes)
    
    // Use the first selected type for now (can be enhanced to generate mixed types)
    const questionType = selectedTypes[0] || 'behavioral'
    const prompt = getQuestionPrompt(questionType, count, subject)
    
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
    })

    const response = completion.choices[0]?.message?.content || ''
    console.log('Raw Groq response:', response)

    // Try to parse the JSON response
    let questions: Question[] = []
    try {
      questions = JSON.parse(response)
    } catch (error) {
      console.log('Failed to parse JSON, trying to extract JSON from response:', error)
      
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        try {
          questions = JSON.parse(jsonMatch[0])
        } catch (secondError) {
          console.log('Failed to parse cleaned JSON:', secondError)
        }
      }
      
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
    return Array.from({ length: count }, (_, i) => ({
      id: (i + 1).toString(),
      question: `Sample ${subject} question ${i + 1}`,
      type: selectedTypes[0] || 'behavioral',
      category: subject
    }))
  }
}

export async function evaluateResponse(
  question: string,
  response: string,
  questionType: string = 'behavioral'
): Promise<Evaluation> {
  try {
    const prompt = getEvaluationPrompt(questionType)
    
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
    })

    const responseText = completion.choices[0]?.message?.content || ''
    console.log('Raw evaluation response:', responseText)

    // Try to parse the JSON response
    try {
      const evaluation = JSON.parse(responseText)
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