'use client';

import React, { useState, useRef } from 'react';
import { Download, Play, Pause, RotateCcw } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  videoId: string;
  onDownload?: (videoId: string) => void;
  className?: string;
}

export default function VideoPlayer({ 
  videoUrl, 
  videoId, 
  onDownload,
  className = '' 
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(videoId);
    } else {
      // Fallback download
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `interview-response-${videoId}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Video Element */}
      <div className="relative">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-auto max-h-96"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <div className="text-white">Loading video...</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-800">
        {/* Progress Bar */}
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePlayPause}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            
            <button
              onClick={handleRestart}
              className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            <span className="text-sm">Download</span>
          </button>
        </div>

        {/* Video Info */}
        <div className="mt-3 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Quality: Low (480p)</span>
            <span>Format: WebM</span>
          </div>
          <div className="text-yellow-400 mt-1">
            ⚠️ This video will be automatically deleted after 24 hours
          </div>
        </div>
      </div>
    </div>
  );
} 