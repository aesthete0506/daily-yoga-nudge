
import React, { useState, useRef, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward } from 'lucide-react';
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(10);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cooldownRef = useRef<NodeJS.Timeout>();

  // Reset state when video changes
  useEffect(() => {
    setIsPlaying(false);
    setIsLoaded(false);
    setCooldownActive(false);
    setCooldownTime(10);
  }, [content]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleVideoLoaded = () => {
    setIsLoaded(true);
    if (autoPlay && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    
    // Start cooldown
    setCooldownActive(true);
    setCooldownTime(10);
    
    cooldownRef.current = setInterval(() => {
      setCooldownTime(prev => {
        if (prev <= 1) {
          setCooldownActive(false);
          clearInterval(cooldownRef.current);
          if (onVideoEnd) onVideoEnd();
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

  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
      }
    };
  }, []);

  // Extract YouTube video ID and create embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&rel=0` : null;
  };

  if (!content) {
    return (
      <Card className="overflow-hidden card">
        <AspectRatio ratio={16 / 9}>
          <div className="flex items-center justify-center h-full bg-muted">
            <p className="text-normal">No video available</p>
          </div>
        </AspectRatio>
      </Card>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(content.video_url);

  return (
    <Card className="overflow-hidden card">
      <div className="relative">
        <AspectRatio ratio={16 / 9}>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={handleVideoLoaded}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <p className="text-normal">Video not available</p>
            </div>
          )}
        </AspectRatio>

        {/* Cooldown overlay */}
        {cooldownActive && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center text-white">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Great work!</h3>
              <p className="text-lg">Next pose in {cooldownTime} seconds</p>
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              {showNextButton && (
                <Button
                  onClick={handleNext}
                  className="btn-primary mt-4"
                >
                  <SkipForward className="h-4 w-4 mr-2" />
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
