'use client';

import React, { useState, useRef, useCallback } from 'react';
import { VIDEO_CONFIG } from '../lib/video-storage';

interface VideoRecorderProps {
  onVideoRecorded: (blob: Blob) => void;
  onError: (error: string) => void;
  maxDuration?: number;
}

export default function VideoRecorder({ 
  onVideoRecorded, 
  onError, 
  maxDuration = VIDEO_CONFIG.maxDuration 
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser support
  useState(() => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setIsSupported(false);
      onError('Video recording is not supported in this browser');
    }
  });

  const startRecording = useCallback(async () => {
    try {
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
      chunksRef.current = [];

      // Create MediaRecorder with low quality settings
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 500000, // 500 kbps for low quality
        audioBitsPerSecond: 64000   // 64 kbps for audio
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        
        // Check file size
        if (blob.size > VIDEO_CONFIG.maxSize * 1024 * 1024) {
          onError(`Video too large (${(blob.size / 1024 / 1024).toFixed(1)}MB). Max size: ${VIDEO_CONFIG.maxSize}MB`);
          return;
        }

        onVideoRecorded(blob);
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        chunksRef.current = [];
        setRecordingTime(0);
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      onError('Failed to start video recording. Please check camera permissions.');
    }
  }, [maxDuration, onVideoRecorded, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
  }, [isRecording, isPaused, maxDuration, stopRecording]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">
        Video recording is not supported in this browser
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Start Recording
            </button>
          ) : (
            <div className="flex space-x-2">
              {!isPaused ? (
                <button
                  onClick={pauseRecording}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Pause
                </button>
              ) : (
                <button
                  onClick={resumeRecording}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Resume
                </button>
              )}
              <button
                onClick={stopRecording}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Stop
              </button>
            </div>
          )}
        </div>
        
        {isRecording && (
          <div className="text-sm text-gray-600">
            <div className="font-mono text-lg">{formatTime(recordingTime)}</div>
            <div className="text-xs">
              Max: {formatTime(maxDuration)} | Quality: Low (480p)
            </div>
          </div>
        )}
      </div>

      {isRecording && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Recording in progress...</strong>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Quality: Low (480p, 500 kbps)</li>
              <li>• Format: WebM (smaller file size)</li>
              <li>• Max size: {VIDEO_CONFIG.maxSize}MB</li>
              <li>• Auto-deletes after 24 hours</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 