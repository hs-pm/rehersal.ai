import { NextRequest, NextResponse } from 'next/server'
import { Groq } from 'groq-sdk'

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const { clarifyingQuestion, interviewQuestion } = await request.json()

    if (!clarifyingQuestion || !interviewQuestion) {
      return NextResponse.json(
        { error: 'Both clarifying question and interview question are required' },
        { status: 400 }
      )
    }

    const prompt = `You are an expert interview coach helping a candidate who is struggling with an interview question.

INTERVIEW QUESTION: "${interviewQuestion}"

CANDIDATE'S CLARIFYING QUESTION: "${clarifyingQuestion}"

Your role is to guide the candidate to think critically and figure out the answer themselves. DO NOT provide direct answers. Instead:

1. Acknowledge their clarifying question
2. Help them identify what assumptions they might be making
3. Guide them to think through the problem step by step
4. Suggest what information they might need to consider
5. Encourage them to structure their thinking

Provide guidance that will help them develop their own reasoning and arrive at their own answer.

Keep your response concise (2-3 paragraphs maximum) and encouraging.`

    const completion = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a supportive interview coach who guides candidates to think critically without giving direct answers.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 500,
    })

    const guidance = completion.choices[0]?.message?.content || 'Unable to generate guidance at this time.'

    return NextResponse.json({
      success: true,
      guidance
    })

  } catch (error) {
    console.error('Error generating clarification guidance:', error)
    return NextResponse.json(
      { error: 'Failed to generate guidance' },
      { status: 500 }
    )
  }
} 