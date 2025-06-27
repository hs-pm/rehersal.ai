import { Groq } from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

export default groq

export async function generateQuestions(subject: string, count: number = 5, types: string[] = ['behavioral', 'technical', 'situational']) {
  try {
    const typesText = types.join(', ')
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert interview coach. Generate ${count} relevant interview questions for the subject: "${subject}".
          
          IMPORTANT: Return ONLY a valid JSON array with no additional text, formatting, or explanations.
          
          Requirements:
          - Only generate questions of the following types: ${typesText}
          - Do NOT include any questions of other types.
          - Use this EXACT JSON structure for each question:
            {"id": "1", "question": "Question text", "type": "${typesText}", "category": "subject area"}
          - Return ONLY the JSON array: [{"id": "1", ...}, {"id": "2", ...}]
          - No text before or after the JSON
          - No markdown formatting
          - No explanations or comments
          - Ensure all quotes are properly escaped
          - Ensure the JSON is properly formatted with no trailing commas`
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No response from Groq')
    
    console.log('Raw Groq response:', response)
    
    // Try to parse as JSON
    try {
      return JSON.parse(response)
    } catch (parseError) {
      console.error('Failed to parse JSON, trying to extract JSON from response:', parseError)
      
      // Try multiple strategies to extract valid JSON
      let cleanedResponse = response.trim()
      
      // Strategy 1: Remove any text before the first [
      const firstBracketIndex = cleanedResponse.indexOf('[')
      if (firstBracketIndex > 0) {
        cleanedResponse = cleanedResponse.substring(firstBracketIndex)
      }
      
      // Strategy 2: Remove any text after the last ]
      const lastBracketIndex = cleanedResponse.lastIndexOf(']')
      if (lastBracketIndex > 0 && lastBracketIndex < cleanedResponse.length - 1) {
        cleanedResponse = cleanedResponse.substring(0, lastBracketIndex + 1)
      }
      
      // Strategy 3: Try to fix common JSON formatting issues
      cleanedResponse = cleanedResponse
        .replace(/\n/g, ' ') // Replace newlines with spaces
        .replace(/\r/g, '') // Remove carriage returns
        .replace(/\t/g, ' ') // Replace tabs with spaces
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/,\s*]/g, ']') // Remove trailing commas before closing brackets
        .replace(/,\s*}/g, '}') // Remove trailing commas before closing braces
      
      try {
        return JSON.parse(cleanedResponse)
      } catch (secondParseError) {
        console.error('Failed to parse cleaned JSON:', secondParseError)
        
        // Strategy 4: Try to extract JSON using regex
        const jsonMatch = response.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          try {
            const extractedJson = jsonMatch[0]
              .replace(/,\s*]/g, ']') // Remove trailing commas
              .replace(/,\s*}/g, '}') // Remove trailing commas
            return JSON.parse(extractedJson)
          } catch (thirdParseError) {
            console.error('Failed to parse regex-extracted JSON:', thirdParseError)
          }
        }
        
        // Strategy 5: Try to manually construct JSON from the response
        try {
          const lines = response.split('\n').filter(line => line.trim())
          const questions: Array<{ id: string; question: string; type: string; category: string }> = []
          let currentQuestion: { id?: string; question?: string; type?: string; category?: string } = {}
          
          for (const line of lines) {
            if (line.includes('"id"') || line.includes('"question"') || line.includes('"type"') || line.includes('"category"')) {
              // Extract key-value pairs
              const keyMatch = line.match(/"([^"]+)":\s*"([^"]+)"/)
              if (keyMatch) {
                currentQuestion[keyMatch[1] as keyof typeof currentQuestion] = keyMatch[2]
              }
              
              // If we have all required fields, add to questions
              if (currentQuestion.id && currentQuestion.question && currentQuestion.type && currentQuestion.category) {
                questions.push({ 
                  id: currentQuestion.id, 
                  question: currentQuestion.question, 
                  type: currentQuestion.type, 
                  category: currentQuestion.category 
                })
                currentQuestion = {}
              }
            }
          }
          
          if (questions.length > 0) {
            return questions
          }
        } catch (manualParseError) {
          console.error('Failed to manually parse JSON:', manualParseError)
        }
      }
      
      // If all else fails, create a fallback response
      console.log('Creating fallback questions due to parsing failure')
      return Array.from({ length: count }, (_, i) => ({
        id: (i + 1).toString(),
        question: `Sample ${subject} question ${i + 1}`,
        type: types[i % types.length] || 'behavioral',
        category: subject
      }))
    }
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
          Return ONLY a valid JSON object with this exact structure:
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
          }
          
          Do not include any text before or after the JSON object. Only return the JSON.`
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
    
    console.log('Raw evaluation response:', response_text)
    
    // Try to parse as JSON
    try {
      return JSON.parse(response_text)
    } catch (parseError) {
      console.error('Failed to parse evaluation JSON, trying to extract JSON from response:', parseError)
      
      // Try to extract JSON from the response if it contains extra text
      const jsonMatch = response_text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0])
        } catch (secondParseError) {
          console.error('Failed to parse extracted evaluation JSON:', secondParseError)
        }
      }
      
      // If all else fails, create a fallback response
      console.log('Creating fallback evaluation due to parsing failure')
      return {
        score: 75,
        feedback: "Unable to parse AI evaluation. Please try again.",
        strengths: ["Response provided"],
        improvements: ["Try providing more detailed answers"],
        timeline_analysis: {
          clarity: 7,
          confidence: 7,
          technical_depth: 7,
          communication: 7,
          structure: 7,
          engagement: 7,
          completeness: 7
        }
      }
    }
  } catch (error) {
    console.error('Error evaluating response:', error)
    throw error
  }
} 