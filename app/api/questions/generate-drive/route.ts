import { NextRequest, NextResponse } from 'next/server';
import { googleDriveStorage } from '../../../../lib/google-drive';
import { generateQuestions } from '../../../../lib/groq';

export async function POST(request: NextRequest) {
  try {
    const { subject, count = 3, types } = await request.json();

    console.log(`Generating questions for subject: ${subject} count: ${count} types: ${types ? JSON.stringify(types) : 'all'}`);

    // Generate questions using Groq
    const questions = await generateQuestions(subject, count, types);

    console.log('Generated questions:', questions);

    // Store questions in Google Drive instead of database
    const storedQuestions = [];
    for (const question of questions) {
      try {
        const storedQuestion = await googleDriveStorage.insertQuestion({
          question: question.question,
          type: question.type,
          category: question.category
        } as any);
        storedQuestions.push(storedQuestion);
        console.log(`Stored question in Google Drive: ${storedQuestion.id}`);
      } catch (error) {
        console.error('Error storing question in Google Drive:', error);
        // Continue with other questions even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      questions: storedQuestions,
      message: `Generated and stored ${storedQuestions.length} questions in Google Drive`
    });

  } catch (error) {
    console.error('Error generating questions with Google Drive storage:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate questions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 