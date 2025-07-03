import { NextRequest, NextResponse } from 'next/server';
import { videoStorage } from '../../../../lib/video-storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const sessionId = formData.get('sessionId') as string;
    const questionId = formData.get('questionId') as string;
    const videoFile = formData.get('video') as File;

    if (!sessionId || !questionId || !videoFile) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, questionId, or video' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!videoFile.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only video files are allowed.' },
        { status: 400 }
      );
    }

    // Convert File to Blob
    const videoBlob = new Blob([videoFile], { type: videoFile.type });

    // Store video for session
    const video = await videoStorage.storeSessionVideo(sessionId, questionId, videoBlob);

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        url: video.url,
        size: video.size,
        duration: video.duration,
        expiresAt: video.expiresAt
      }
    });

  } catch (error) {
    console.error('Error uploading video:', error);
    
    if (error instanceof Error && error.message.includes('too large')) {
      return NextResponse.json(
        { error: error.message },
        { status: 413 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const questionId = searchParams.get('questionId');

    if (!sessionId || !questionId) {
      return NextResponse.json(
        { error: 'Missing sessionId or questionId' },
        { status: 400 }
      );
    }

    const video = videoStorage.getSessionVideo(sessionId, questionId);
    
    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        url: video.url,
        size: video.size,
        duration: video.duration,
        expiresAt: video.expiresAt
      }
    });

  } catch (error) {
    console.error('Error retrieving video:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve video' },
      { status: 500 }
    );
  }
} 