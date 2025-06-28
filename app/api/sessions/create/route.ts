import { NextRequest, NextResponse } from 'next/server'
import { createPracticeSession } from '../../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      subject, 
      totalQuestions, 
      resume, 
      jobDescription, 
      candidateAnalysis 
    } = await request.json()

    if (!title || !subject) {
      return NextResponse.json(
        { error: 'Title and subject are required' },
        { status: 400 }
      )
    }

    const session = await createPracticeSession({
      title,
      subject,
      total_questions: totalQuestions || 0,
      completed_questions: 0,
      resume,
      job_description: jobDescription,
      candidate_analysis: candidateAnalysis
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