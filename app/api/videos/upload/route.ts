import { NextRequest, NextResponse } from 'next/server';
import { videoStorage } from '../../../../lib/video-storage';
import { isFeatureEnabled } from '../../../../lib/feature-flags';

export async function POST(request: NextRequest) {
  // Check if video storage is enabled
  if (!isFeatureEnabled('VIDEO_STORAGE')) {
    return NextResponse.json(
      { error: 'Video storage is not enabled' },
      { status: 403 }
    );
  }

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

    // Validate file size (max 50MB for demo)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (videoFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    // Upload video using the new storage interface
    const video = await videoStorage.uploadVideo(videoFile, sessionId, questionId);

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
  // For now, we'll return a simple response since we don't have a database
  // to store video metadata. In a full implementation, you'd query the database.
  return NextResponse.json(
    { error: 'Video retrieval not implemented yet' },
    { status: 501 }
  );
} 