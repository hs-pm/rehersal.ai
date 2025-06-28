import { NextRequest, NextResponse } from 'next/server'
import { evaluateResponse, transcribeAudio } from '../../../../lib/groq'
import { insertResponse, getQuestionById, getPracticeSessionById } from '../../../../lib/db'

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

    if (!sessionId || !questionId || !questionText) {
      return NextResponse.json(
        { error: 'Session ID, question ID, and question text are required' },
        { status: 400 }
      )
    }

    let transcription = ''
    let finalResponse = textResponse || ''

    // If audio data is provided, transcribe it
    if (audioData) {
      transcription = await transcribeAudio(audioData)
      finalResponse = transcription
    } else {
      // If no audio, use textResponse as transcription
      transcription = textResponse || ''
    }

    // Get the question to determine its type for type-specific evaluation
    const question = await getQuestionById(questionId.toString())
    const questionType = question?.type || 'behavioral' // Default to behavioral if type not found

    // Get the session to retrieve context for personalized evaluation
    const session = await getPracticeSessionById(sessionId.toString())
    const context = session ? {
      resume: session.resume,
      jobDescription: session.job_description,
      candidateAnalysis: session.candidate_analysis
    } : undefined

    // Evaluate the response with type-specific evaluation and context
    const evaluation = await evaluateResponse(questionText, finalResponse, questionType, context)

    // Store the response
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

    return NextResponse.json({
      success: true,
      response,
      evaluation
    })

  } catch (error) {
    console.error('Error evaluating response:', error)
    return NextResponse.json(
      { error: 'Failed to evaluate response' },
      { status: 500 }
    )
  }
} 