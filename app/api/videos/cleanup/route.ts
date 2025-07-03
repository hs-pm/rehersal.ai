import { NextRequest, NextResponse } from 'next/server';
import { videoStorage } from '../../../../lib/video-storage';

export async function POST(request: NextRequest) {
  try {
    // Clean up expired videos
    await videoStorage.cleanupExpiredVideos();

    return NextResponse.json({
      success: true,
      message: 'Expired videos cleaned up successfully'
    });

  } catch (error) {
    console.error('Error cleaning up videos:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup videos' },
      { status: 500 }
    );
  }
}

// Optional: Get storage usage statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Get usage for specific session
      const usage = videoStorage.getSessionUsage(sessionId);
      return NextResponse.json({
        success: true,
        sessionId,
        usage
      });
    } else {
      // Get overall usage (you could extend this)
      return NextResponse.json({
        success: true,
        message: 'Storage usage statistics available for specific sessions'
      });
    }

  } catch (error) {
    console.error('Error getting storage usage:', error);
    return NextResponse.json(
      { error: 'Failed to get storage usage' },
      { status: 500 }
    );
  }
} 