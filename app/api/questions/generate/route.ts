import { NextRequest, NextResponse } from 'next/server'
import { generateQuestions } from '../../../../lib/groq'
import { insertQuestion, createTables } from '../../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const { 
      subject, 
      count = 5, 
      types = ['behavioral', 'technical', 'situational'],
      resume,
      jobDescription,
      candidateAnalysis
    } = await request.json()

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      )
    }

    // Check if GROQ_API_KEY is available
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not configured')
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    console.log(`Generating questions for subject: ${subject} count: ${count} types:`, types)

    // Ensure database tables exist
    await createTables()

    // Generate questions using Groq with advanced context
    const questions = await generateQuestions(subject, count, types, {
      resume,
      jobDescription,
      candidateAnalysis
    })
    console.log('Generated questions:', questions)

    // Store questions in database
    const storedQuestions: any[] = []
    for (const question of questions) {
      try {
        const storedQuestion = await insertQuestion(question)
        storedQuestions.push(storedQuestion)
      } catch (error) {
        console.error('Error inserting question:', error)
        // Continue with other questions even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      questions: storedQuestions
    })

  } catch (error) {
    console.error('Error generating questions:', error)
    
    // Provide more detailed error information
    let errorMessage = 'Failed to generate questions'
    let errorDetails: any = null
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }
    
    // Check for specific error types
    if (errorMessage.includes('GROQ_API_KEY')) {
      errorMessage = 'API key configuration error. Please check your GROQ API key.'
    } else if (errorMessage.includes('database') || errorMessage.includes('connection')) {
      errorMessage = 'Database connection error. Please check your database configuration.'
    } else if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
      errorMessage = 'Response parsing error. The AI response was malformed.'
    } else if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
      errorMessage = 'Network timeout error. Please check your internet connection and try again.'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 