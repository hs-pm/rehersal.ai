import { NextRequest, NextResponse } from 'next/server'
import { createPracticeSession, createTables } from '../../../../lib/db'

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

    console.log('Session creation request:', { title, subject, totalQuestions, resume, jobDescription, candidateAnalysis })

    if (!title || !subject) {
      return NextResponse.json(
        { error: 'Title and subject are required' },
        { status: 400 }
      )
    }

    // Ensure database tables exist
    console.log('Creating/verifying database tables...')
    await createTables()
    console.log('Database tables created/verified successfully')

    console.log('Creating practice session...')
    const session = await createPracticeSession({
      title,
      subject,
      total_questions: totalQuestions || 0,
      completed_questions: 0,
      resume,
      job_description: jobDescription,
      candidate_analysis: candidateAnalysis
    })
    console.log('Practice session created successfully:', session)

    return NextResponse.json({
      success: true,
      session
    })

  } catch (error) {
    console.error('Error creating session:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    })
    return NextResponse.json(
      { error: 'Failed to create session', details: error.message },
      { status: 500 }
    )
  }
} 