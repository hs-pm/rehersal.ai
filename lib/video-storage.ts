import { put, del } from '@vercel/blob';

interface VideoConfig {
  quality: 'low' | 'medium' | 'high';
  maxDuration: number; // in seconds
  maxSize: number; // in MB
  format: 'webm' | 'mp4';
}

// Cost-efficient video configuration for Vercel Hobby
const VIDEO_CONFIG: VideoConfig = {
  quality: 'low', // 480p or lower
  maxDuration: 120, // 2 minutes max
  maxSize: 10, // 10MB max per video
  format: 'webm' // Smaller file size than MP4
};

interface SessionVideo {
  id: string;
  sessionId: string;
  questionId: string;
  url: string;
  size: number;
  duration: number;
  createdAt: Date;
  expiresAt: Date; // Auto-delete after session ends
}

class VideoStorage {
  private sessionVideos = new Map<string, SessionVideo>();

  // Store video for current session only
  async storeSessionVideo(
    sessionId: string,
    questionId: string,
    videoBlob: Blob
  ): Promise<SessionVideo> {
    // Validate video size and duration
    if (videoBlob.size > VIDEO_CONFIG.maxSize * 1024 * 1024) {
      throw new Error(`Video too large. Max size: ${VIDEO_CONFIG.maxSize}MB`);
    }

    const videoId = `${sessionId}-${questionId}-${Date.now()}`;
    const fileName = `${videoId}.${VIDEO_CONFIG.format}`;

    // Upload to Vercel Blob with low quality
    const { url } = await put(fileName, videoBlob, {
      access: 'public',
      addRandomSuffix: false
    });

    const video: SessionVideo = {
      id: videoId,
      sessionId,
      questionId,
      url,
      size: videoBlob.size,
      duration: 0, // Would need to extract from video metadata
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    this.sessionVideos.set(videoId, video);
    return video;
  }

  // Get video for current session
  getSessionVideo(sessionId: string, questionId: string): SessionVideo | undefined {
    const videoId = `${sessionId}-${questionId}`;
    return Array.from(this.sessionVideos.values()).find(
      v => v.sessionId === sessionId && v.questionId === questionId
    );
  }

  // Clean up expired videos
  async cleanupExpiredVideos(): Promise<void> {
    const now = new Date();
    const expiredVideos = Array.from(this.sessionVideos.values()).filter(
      v => v.expiresAt < now
    );

    for (const video of expiredVideos) {
      try {
        await del(video.url);
        this.sessionVideos.delete(video.id);
      } catch (error) {
        console.error(`Failed to delete expired video ${video.id}:`, error);
      }
    }
  }

  // Get download URL for user
  getDownloadUrl(videoId: string): string | null {
    const video = this.sessionVideos.get(videoId);
    return video ? video.url : null;
  }

  // Get session storage usage
  getSessionUsage(sessionId: string): { totalSize: number; videoCount: number } {
    const sessionVideos = Array.from(this.sessionVideos.values()).filter(
      v => v.sessionId === sessionId
    );

    return {
      totalSize: sessionVideos.reduce((sum, v) => sum + v.size, 0),
      videoCount: sessionVideos.length
    };
  }
}

export const videoStorage = new VideoStorage();
export { VIDEO_CONFIG }; 