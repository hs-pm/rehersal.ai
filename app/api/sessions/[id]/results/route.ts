import { NextRequest, NextResponse } from 'next/server'
import { getPracticeSessionById, getResponses } from '../../../../../lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id

    // Get the specific session
    const session = await getPracticeSessionById(sessionId)

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get responses for this session
    const responses = await getResponses(sessionId)

    // Combine session data with responses
    const sessionData = {
      ...session,
      responses: responses.map(response => ({
        id: response.id,
        question_text: response.question_text,
        transcription: response.transcription || '',
        audio_url: response.audio_url,
        video_url: response.video_url,
        text_response: response.text_response,
        evaluation: response.evaluation || {
          score: 0,
          feedback: 'No evaluation available',
          strengths: [],
          improvements: [],
          timeline_analysis: {
            clarity: 0,
            confidence: 0,
            technical_depth: 0,
            communication: 0,
            structure: 0,
            engagement: 0,
            completeness: 0
          }
        }
      }))
    }

    return NextResponse.json({
      success: true,
      session: sessionData
    })

  } catch (error) {
    console.error('Error fetching session results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session results' },
      { status: 500 }
    )
  }
} 