'use client';

import React, { useState } from 'react';
import VideoRecorder from './VideoRecorder';
import VideoPlayer from './VideoPlayer';

interface VideoIntegrationProps {
  sessionId: string;
  questionId: string;
  onVideoUploaded?: (videoUrl: string) => void;
}

export default function VideoIntegration({ 
  sessionId, 
  questionId, 
  onVideoUploaded 
}: VideoIntegrationProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVideoRecorded = async (videoBlob: Blob) => {
    setIsUploading(true);
    setError(null);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('questionId', questionId);
      formData.append('video', videoBlob, 'response.webm');

      // Upload video
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload video');
      }

      const data = await response.json();
      setVideoUrl(data.video.url);
      
      if (onVideoUploaded) {
        onVideoUploaded(data.video.url);
      }

    } catch (err) {
      console.error('Error uploading video:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleDownload = (videoId: string) => {
    // This will trigger the browser's download
    console.log('Downloading video:', videoId);
  };

  return (
    <div className="space-y-4">
      {/* Video Recording Section */}
      {!videoUrl && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Record Your Response</h3>
          <VideoRecorder
            onVideoRecorded={handleVideoRecorded}
            onError={handleVideoError}
            maxDuration={120} // 2 minutes
          />
          
          {isUploading && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg">
              Uploading video... Please wait.
            </div>
          )}
        </div>
      )}

      {/* Video Playback Section */}
      {videoUrl && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Your Recorded Response</h3>
          <VideoPlayer
            videoUrl={videoUrl}
            videoId={`${sessionId}-${questionId}`}
            onDownload={handleDownload}
          />
          
          <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
            <strong>Note:</strong> This video will be automatically deleted after 24 hours. 
            Use the download button above if you want to keep it permanently.
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Video Quality Info */}
      <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <h4 className="font-semibold mb-2">Video Quality Settings</h4>
        <ul className="space-y-1">
          <li>• Resolution: 480p (640x480)</li>
          <li>• Bitrate: 500 kbps</li>
          <li>• Format: WebM (VP8 + Opus)</li>
          <li>• Max duration: 2 minutes</li>
          <li>• Max file size: 10MB</li>
          <li>• Auto-delete: 24 hours</li>
        </ul>
      </div>
    </div>
  );
} 