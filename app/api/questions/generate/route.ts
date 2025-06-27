import { NextRequest, NextResponse } from 'next/server'
import { generateQuestions } from '../../../../lib/groq'
import { insertQuestion, Question, createTables } from '../../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const { subject, count = 5, types = ['behavioral', 'technical', 'situational'] } = await request.json()

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

    console.log('Generating questions for subject:', subject, 'count:', count, 'types:', types)

    // Ensure database tables exist
    try {
      await createTables()
      console.log('Database tables created/verified successfully')
    } catch (dbError) {
      console.error('Failed to create database tables:', dbError)
      // Continue without database storage
    }

    // Generate questions using Groq
    const questions = await generateQuestions(subject, count, types)
    console.log('Generated questions:', questions)

    // Store questions in database
    const storedQuestions: Question[] = []
    for (const question of questions) {
      try {
        const storedQuestion = await insertQuestion(question)
        storedQuestions.push(storedQuestion)
      } catch (dbError) {
        console.error('Failed to store question in database:', dbError)
        // Continue with other questions even if one fails
      }
    }

    return NextResponse.json({
      questions: questions,
      storedCount: storedQuestions.length,
      totalGenerated: questions.length
    })

  } catch (error) {
    console.error('Error generating questions:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
} 