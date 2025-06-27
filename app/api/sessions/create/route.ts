import { NextRequest, NextResponse } from 'next/server'
import { insertPracticeSession } from '../../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const { title, subject, totalQuestions } = await request.json()

    if (!title || !subject) {
      return NextResponse.json(
        { error: 'Title and subject are required' },
        { status: 400 }
      )
    }

    const session = await insertPracticeSession({
      title,
      subject,
      total_questions: totalQuestions || 0,
      completed_questions: 0
    })

    return NextResponse.json({
      success: true,
      session
    })

  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
} 