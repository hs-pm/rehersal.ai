import { NextRequest, NextResponse } from 'next/server'
import { createPracticeSession } from '../../../../lib/vercel-storage'

export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      subject, 
      totalQuestions, 
      resume, 
      jobDescription, 
      candidateAnalysis, 
      questionIds
    } = await request.json()

    console.log('Session creation request:', { title, subject, totalQuestions, resume, jobDescription, candidateAnalysis, questionIds })

    if (!title || !subject) {
      return NextResponse.json(
        { error: 'Title and subject are required' },
        { status: 400 }
      )
    }

    // No need to create tables with Vercel KV storage
    console.log('Using Vercel KV storage...')

    console.log('Creating practice session...')
    const session = await createPracticeSession({
      title,
      subject,
      total_questions: totalQuestions || 0,
      completed_questions: 0,
      resume,
      job_description: jobDescription,
      candidate_analysis: candidateAnalysis,
      question_ids: questionIds || []
    })
    console.log('Practice session created successfully:', session)

    return NextResponse.json({
      success: true,
      session
    })

  } catch (error) {
    console.error('Error creating session:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      detail: (error as any)?.detail
    })
    return NextResponse.json(
      { error: 'Failed to create session', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 