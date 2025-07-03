'use client';

import React, { useState } from 'react';
import VideoRecorder from './VideoRecorder';
import VideoPlayer from './VideoPlayer';
import { isFeatureEnabled } from '../lib/feature-flags';

interface VideoIntegrationProps {
  sessionId: string;
  questionId: string;
  onVideoUploaded?: (videoId: string, url: string) => void;
  onError?: (error: string) => void;
}

export default function VideoIntegration({
  sessionId,
  questionId,
  onVideoUploaded,
  onError
}: VideoIntegrationProps) {
  const [recordedVideo, setRecordedVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedVideoId, setUploadedVideoId] = useState<string>('');

  // Check if video features are enabled
  const videoRecordingEnabled = isFeatureEnabled('VIDEO_RECORDING');
  const videoStorageEnabled = isFeatureEnabled('VIDEO_STORAGE');
  const videoPlaybackEnabled = isFeatureEnabled('VIDEO_PLAYBACK');

  const handleRecordingComplete = async (file: File) => {
    setRecordedVideo(file);
    
    // Create temporary URL for preview
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    // Auto-upload if storage is enabled
    if (videoStorageEnabled) {
      await uploadVideo(file);
    }
  };

  const uploadVideo = async (file: File) => {
    if (!videoStorageEnabled) {
      onError?.('Video storage is not enabled');
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('video', file);
      formData.append('sessionId', sessionId);
      formData.append('questionId', questionId);

      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload video');
      }

      const result = await response.json();
      setUploadedVideoId(result.video.id);
      onVideoUploaded?.(result.video.id, result.video.url);

    } catch (error) {
      console.error('Error uploading video:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (videoId: string) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/download`);
      if (!response.ok) throw new Error('Failed to download video');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `interview-response-${videoId}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading video:', error);
      onError?.('Failed to download video');
    }
  };

  // If no video features are enabled, show disabled state
  if (!videoRecordingEnabled && !videoStorageEnabled && !videoPlaybackEnabled) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-500">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">Video Features Disabled</p>
          <p className="text-sm">Enable video features in your environment variables to use video recording and playback.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Recording Section */}
      {videoRecordingEnabled && (
        <VideoRecorder
          onRecordingComplete={handleRecordingComplete}
          onError={onError || (() => {})}
          disabled={isUploading}
        />
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="card">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600">Uploading video...</span>
          </div>
        </div>
      )}

      {/* Video Playback Section */}
      {videoPlaybackEnabled && (videoUrl || uploadedVideoId) && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recorded Response</h3>
          <VideoPlayer
            videoUrl={videoUrl || `/api/videos/${uploadedVideoId}`}
            videoId={uploadedVideoId || 'temp'}
            onDownload={handleDownload}
          />
          
          {/* Manual Upload Button (if auto-upload failed) */}
          {recordedVideo && !uploadedVideoId && videoStorageEnabled && !isUploading && (
            <div className="mt-4">
              <button
                onClick={() => uploadVideo(recordedVideo)}
                className="btn-primary"
              >
                Upload Video
              </button>
            </div>
          )}
        </div>
      )}

      {/* Feature Status */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${videoRecordingEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span>Video Recording: {videoRecordingEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${videoStorageEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span>Video Storage: {videoStorageEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${videoPlaybackEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span>Video Playback: {videoPlaybackEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
    </div>
  );
} 