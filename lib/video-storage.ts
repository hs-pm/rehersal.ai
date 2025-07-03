import { put, del } from '@vercel/blob';
import { isFeatureEnabled } from './feature-flags';

export interface VideoMetadata {
  id: string;
  sessionId: string;
  questionId: string;
  url: string;
  size: number;
  duration?: number;
  createdAt: Date;
  expiresAt: Date;
}

export class VideoStorage {
  private static instance: VideoStorage;
  
  private constructor() {}
  
  static getInstance(): VideoStorage {
    if (!VideoStorage.instance) {
      VideoStorage.instance = new VideoStorage();
    }
    return VideoStorage.instance;
  }

  async uploadVideo(
    file: File,
    sessionId: string,
    questionId: string
  ): Promise<VideoMetadata> {
    if (!isFeatureEnabled('VIDEO_STORAGE')) {
      throw new Error('Video storage is not enabled');
    }

    try {
      // Generate unique video ID
      const videoId = `video_${sessionId}_${questionId}_${Date.now()}`;
      
      // Upload to Vercel Blob
      const blob = await put(videoId, file, {
        access: 'public',
        addRandomSuffix: false,
      });

      // Calculate expiration (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const metadata: VideoMetadata = {
        id: videoId,
        sessionId,
        questionId,
        url: blob.url,
        size: file.size,
        createdAt: new Date(),
        expiresAt,
      };

      return metadata;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw new Error('Failed to upload video');
    }
  }

  async deleteVideo(videoId: string): Promise<void> {
    if (!isFeatureEnabled('VIDEO_STORAGE')) {
      return;
    }

    try {
      await del(videoId);
    } catch (error) {
      console.error('Error deleting video:', error);
      // Don't throw error for cleanup failures
    }
  }

  async cleanupExpiredVideos(): Promise<void> {
    if (!isFeatureEnabled('VIDEO_STORAGE')) {
      return;
    }

    // This would typically query a database for expired videos
    // For now, we'll implement this in the cleanup API route
    console.log('Video cleanup triggered');
  }

  getVideoUrl(videoId: string): string {
    // For Vercel Blob, the URL is constructed as:
    // https://{blob-store}.public.blob.vercel-storage.com/{videoId}
    return `https://${process.env.BLOB_READ_WRITE_TOKEN?.split('_')[0]}.public.blob.vercel-storage.com/${videoId}`;
  }
}

export const videoStorage = VideoStorage.getInstance(); 