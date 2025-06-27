import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export default groq

export async function generateQuestions(subject: string, count: number = 5) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert interview coach. Generate ${count} relevant interview questions for the subject: "${subject}". 
          Make questions diverse - some behavioral, some technical, some situational. 
          Return only a JSON array of question objects with this structure:
          [{"id": "1", "question": "Question text", "type": "behavioral|technical|situational", "category": "subject area"}]`
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No response from Groq')
    
    return JSON.parse(response)
  } catch (error) {
    console.error('Error generating questions:', error)
    throw error
  }
}

export async function transcribeAudio(audioBase64: string) {
  try {
    // Note: Groq doesn't have direct speech-to-text yet, so we'll use a placeholder
    // In production, you'd integrate with Whisper API or similar
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a speech-to-text transcription service. Transcribe the provided audio content accurately."
        },
        {
          role: "user", 
          content: `Transcribe this audio: ${audioBase64.substring(0, 100)}...`
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.1,
    })

    return completion.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Error transcribing audio:', error)
    throw error
  }
}

export async function evaluateResponse(question: string, response: string) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert interview evaluator. Analyze the candidate's response to the question and provide detailed feedback.
          Return a JSON object with this structure:
          {
            "score": 85,
            "feedback": "Detailed feedback here",
            "strengths": ["strength1", "strength2"],
            "improvements": ["improvement1", "improvement2"],
            "timeline_analysis": {
              "clarity": 8,
              "confidence": 7,
              "technical_depth": 9,
              "communication": 8,
              "structure": 7,
              "engagement": 8,
              "completeness": 9
            }
          }`
        },
        {
          role: "user",
          content: `Question: "${question}"\n\nResponse: "${response}"\n\nEvaluate this response.`
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.3,
      max_tokens: 1000,
    })

    const response_text = completion.choices[0]?.message?.content
    if (!response_text) throw new Error('No evaluation response')
    
    return JSON.parse(response_text)
  } catch (error) {
    console.error('Error evaluating response:', error)
    throw error
  }
} 