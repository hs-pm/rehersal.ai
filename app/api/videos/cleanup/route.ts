import { NextRequest, NextResponse } from 'next/server';
import { isFeatureEnabled } from '../../../../lib/feature-flags';
import { videoStorage } from '../../../../lib/video-storage';

export async function POST(request: NextRequest) {
  // Check if video storage is enabled
  if (!isFeatureEnabled('VIDEO_STORAGE')) {
    return NextResponse.json(
      { error: 'Video storage is not enabled' },
      { status: 403 }
    );
  }

  try {
    const { videoIds } = await request.json();

    if (!Array.isArray(videoIds)) {
      return NextResponse.json(
        { error: 'videoIds must be an array' },
        { status: 400 }
      );
    }

    const results = await Promise.allSettled(
      videoIds.map(videoId => videoStorage.deleteVideo(videoId))
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${successful} videos${failed > 0 ? `, ${failed} failed` : ''}`,
      results: {
        successful,
        failed,
        total: videoIds.length
      }
    });

  } catch (error) {
    console.error('Error during video cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup videos' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Check if video storage is enabled
  if (!isFeatureEnabled('VIDEO_STORAGE')) {
    return NextResponse.json(
      { error: 'Video storage is not enabled' },
      { status: 403 }
    );
  }

  try {
    // Trigger cleanup of expired videos
    await videoStorage.cleanupExpiredVideos();

    return NextResponse.json({
      success: true,
      message: 'Video cleanup completed'
    });

  } catch (error) {
    console.error('Error during video cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup videos' },
      { status: 500 }
    );
  }
}

 