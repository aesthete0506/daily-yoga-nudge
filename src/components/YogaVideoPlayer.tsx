
import React, { useState, useRef, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { ContentLibrary } from '@/lib/supabase';

interface YogaVideoPlayerProps {
  content: ContentLibrary | null;
  autoPlay?: boolean;
  onVideoEnd?: () => void;
  onNext?: () => void;
  showNextButton?: boolean;
}

const YogaVideoPlayer: React.FC<YogaVideoPlayerProps> = ({ 
  content, 
  autoPlay = false,
  onVideoEnd,
  onNext,
  showNextButton = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(10);
  const [duration, setDuration] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const cooldownRef = useRef<NodeJS.Timeout>();
  const timerRef = useRef<NodeJS.Timeout>();

  // Reset state when video changes
  useEffect(() => {
    setIsPlaying(false);
    setCooldownActive(false);
    setCooldownTime(10);
    setDuration(content?.video_duration || 0);
    setTimeRemaining(content?.video_duration || 0);
  }, [content]);

  // Auto-start video when autoPlay is enabled
  useEffect(() => {
    if (autoPlay && content && !isPlaying) {
      setIsPlaying(true);
    }
  }, [autoPlay, content]);

  // Timer for tracking remaining time
  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            handleVideoEnded();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, timeRemaining]);

  const handlePlayPause = () => {
    if (cooldownActive) return;
    
    if (isPlaying) {
      setIsPlaying(false);
      // Clear timer when pausing
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    } else {
      setIsPlaying(true);
      // If video ended, restart
      if (timeRemaining === 0) {
        setTimeRemaining(content?.video_duration || 0);
      }
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    
    // Start cooldown and auto-advance
    setCooldownActive(true);
    setCooldownTime(10);
    
    cooldownRef.current = setInterval(() => {
      setCooldownTime(prev => {
        if (prev <= 1) {
          setCooldownActive(false);
          clearInterval(cooldownRef.current);
          if (onVideoEnd) onVideoEnd();
          // Auto-advance to next pose
          if (onNext) {
            setTimeout(() => onNext(), 100);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleNext = () => {
    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
    }
    setCooldownActive(false);
    if (onNext) onNext();
  };

  const handleRepeat = () => {
    setTimeRemaining(content?.video_duration || 0);
    setIsPlaying(false);
    setCooldownActive(false);
    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&rel=0&controls=0&showinfo=0&modestbranding=1` : null;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!content) {
    return (
      <Card className="overflow-hidden bg-white shadow-sm border-0 rounded-xl">
        <AspectRatio ratio={16 / 9}>
          <div className="flex items-center justify-center h-full bg-gray-100">
            <p className="text-normal">No video available</p>
          </div>
        </AspectRatio>
      </Card>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(content.video_url);

  return (
    <Card className="overflow-hidden bg-white shadow-sm border-0 rounded-xl">
      <div className="relative">
        <AspectRatio ratio={16 / 9}>
          {embedUrl ? (
            <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
              <iframe
                key={`${content.id}-${isPlaying}`}
                src={`${embedUrl}&autoplay=${isPlaying ? 1 : 0}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              
              {/* Custom controls overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handlePlayPause}
                      className="bg-orange-600 hover:bg-orange-700 text-white transition-colors rounded-lg"
                      disabled={cooldownActive}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleRepeat}
                      className="bg-orange-600 hover:bg-orange-700 text-white transition-colors rounded-lg"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm font-medium">
                    {formatTime(timeRemaining)} / {formatTime(duration)}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-white/30 rounded-full h-1 mt-2">
                  <div 
                    className="bg-white h-1 rounded-full transition-all duration-300" 
                    style={{ width: `${duration > 0 ? ((duration - timeRemaining) / duration) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100 rounded-xl">
              <p className="text-normal">Video not available</p>
            </div>
          )}
        </AspectRatio>

        {/* Cooldown overlay */}
        {cooldownActive && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center text-white rounded-xl">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Great work!</h3>
              <p className="text-lg">Next pose starting in {cooldownTime} seconds</p>
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              {showNextButton && (
                <Button
                  onClick={handleNext}
                  className="bg-orange-600 hover:bg-orange-700 text-white mt-4 transition-colors rounded-lg"
                >
                  Skip to Next
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default YogaVideoPlayer;
