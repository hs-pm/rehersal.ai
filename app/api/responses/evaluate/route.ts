import { NextRequest, NextResponse } from 'next/server'
import { evaluateResponse, transcribeAudio } from '../../../../lib/groq'
import { insertResponse, getQuestionById, getPracticeSessionById, createTables } from '../../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const { 
      sessionId, 
      questionId, 
      questionText, 
      audioData, 
      videoUrl, 
      textResponse 
    } = await request.json()

    console.log('Evaluate request received:', { sessionId, questionId, questionText, hasAudio: !!audioData, hasVideo: !!videoUrl, hasText: !!textResponse })

    if (!sessionId || !questionId || !questionText) {
      console.log('Missing required fields:', { sessionId, questionId, questionText })
      return NextResponse.json(
        { error: 'Session ID, question ID, and question text are required' },
        { status: 400 }
      )
    }

    // Ensure database tables exist
    console.log('Creating/verifying database tables...')
    await createTables()
    console.log('Database tables created/verified successfully')

    let transcription = ''
    let finalResponse = textResponse || ''

    // If audio data is provided, transcribe it
    if (audioData) {
      console.log('Transcribing audio...')
      transcription = await transcribeAudio(audioData)
      finalResponse = transcription
      console.log('Audio transcription completed')
    } else {
      // If no audio, use textResponse as transcription
      transcription = textResponse || ''
      console.log('Using text response as transcription')
    }

    // Get the question to determine its type for type-specific evaluation
    console.log('Fetching question details...')
    const question = await getQuestionById(questionId.toString())
    console.log('Question details:', question)
    const questionType = question?.type || 'behavioral' // Default to behavioral if type not found

    // Get the session to retrieve context for personalized evaluation
    console.log('Fetching session details...')
    const session = await getPracticeSessionById(sessionId.toString())
    console.log('Session details:', session)
    const context = session ? {
      resume: session.resume,
      jobDescription: session.job_description,
      candidateAnalysis: session.candidate_analysis
    } : undefined

    // Evaluate the response with type-specific evaluation and context
    console.log('Evaluating response...')
    const evaluation = await evaluateResponse(questionText, finalResponse, questionType, context)
    console.log('Evaluation completed:', evaluation)

    // Store the response
    console.log('Storing response in database...')
    const response = await insertResponse({
      session_id: sessionId,
      question_id: questionId,
      question_text: questionText,
      audio_url: audioData ? 'audio_url_placeholder' : undefined,
      video_url: videoUrl,
      text_response: textResponse,
      transcription,
      evaluation
    })
    console.log('Response stored successfully:', response)

    return NextResponse.json({
      success: true,
      response,
      evaluation
    })

  } catch (error) {
    console.error('Error evaluating response:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Provide more detailed error information
    let errorMessage = 'Failed to evaluate response'
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