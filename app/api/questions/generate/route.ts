import { NextRequest, NextResponse } from 'next/server'
import { generateQuestions } from '../../../../lib/groq'
import { insertQuestion } from '../../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const { subject, count = 5 } = await request.json()

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

    console.log('Generating questions for subject:', subject, 'count:', count)

    // Generate questions using Groq
    const questions = await generateQuestions(subject, count)

    console.log('Generated questions:', questions)

    // Store questions in database
    const storedQuestions = []
    for (const question of questions) {
      const stored = await insertQuestion({
        question: question.question,
        type: question.type,
        category: question.category
      })
      storedQuestions.push(stored)
    }

    return NextResponse.json({
      success: true,
      questions: storedQuestions
    })

  } catch (error) {
    console.error('Error generating questions:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 