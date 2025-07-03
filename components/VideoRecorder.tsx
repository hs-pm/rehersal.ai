'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Square, Video, Loader2 } from 'lucide-react';
import { isFeatureEnabled } from '../lib/feature-flags';

interface VideoRecorderProps {
  onRecordingComplete: (file: File) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export default function VideoRecorder({ 
  onRecordingComplete, 
  onError, 
  disabled = false 
}: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  // Check if video recording is enabled
  const videoEnabled = isFeatureEnabled('VIDEO_RECORDING') && !disabled;

  const startRecording = useCallback(async () => {
    if (!videoEnabled) {
      onError('Video recording is not enabled');
      return;
    }

    try {
      setIsStarting(true);
      
      // Request low-quality video stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 15, max: 30 }
        },
        audio: {
          sampleRate: 22050,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Create MediaRecorder with low-quality settings
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 500000, // 500 kbps for low quality
        audioBitsPerSecond: 64000   // 64 kbps for audio
      });

      mediaRecorderRef.current = mediaRecorder;
      setRecordedChunks([]);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        // Convert blob to file
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: 'video/webm'
        });
        onRecordingComplete(file);
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      onError('Failed to start recording. Please check camera permissions.');
    } finally {
      setIsStarting(false);
    }
  }, [videoEnabled, onRecordingComplete, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  if (!videoEnabled) {
    return (
      <div className="card w-full">
        <div className="flex items-center gap-2 mb-4">
          <Video className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Video Recording</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Video recording is currently disabled</p>
          <p className="text-sm">Enable ENABLE_VIDEO_RECORDING=true to use this feature</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card w-full">
      <div className="flex items-center gap-2 mb-4">
        <Video className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Video Recording</h3>
      </div>
      <div className="space-y-4">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-64 bg-black rounded-lg object-cover"
          />
          {isRecording && (
            <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Recording
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isStarting}
              className="btn-primary bg-red-500 hover:bg-red-600"
            >
              {isStarting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <div className="w-4 h-4 bg-white rounded-full mr-2" />
              )}
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="btn-secondary border-red-500 text-red-500 hover:bg-red-50"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Recording
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>Recording in low quality to minimize storage usage</p>
          <p>Max duration: 5 minutes | Auto-cleanup: 24 hours</p>
        </div>
      </div>
    </div>
  );
} 