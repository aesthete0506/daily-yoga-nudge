
import React, { useState, useRef, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { VideoFile } from '@/lib/supabase';

interface YogaVideoPlayerProps {
  video: VideoFile | null;
  autoPlay?: boolean;
}

const YogaVideoPlayer: React.FC<YogaVideoPlayerProps> = ({ 
  video, 
  autoPlay = false 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset state when video changes
  useEffect(() => {
    setIsPlaying(false);
    setIsLoaded(false);
  }, [video]);

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

  // Only render placeholder if no video
  if (!video) {
    return (
      <Card className="overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          <div className="flex items-center justify-center h-full bg-muted">
            <p className="text-muted-foreground">No video available</p>
          </div>
        </AspectRatio>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <AspectRatio ratio={16 / 9}>
          {/* Only render the video element when we have a valid video URL */}
          {video.pose_video ? (
            <video
              ref={videoRef}
              src={video.pose_video}
              className="w-full h-full object-cover"
              controls={false}
              playsInline
              onLoadedMetadata={handleVideoLoaded}
              onEnded={() => setIsPlaying(false)}
            />
          ) : (
            // Fallback to image if no video
            video.pose_image ? (
              <img
                src={video.pose_image}
                alt={video.pose_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted">
                <p className="text-muted-foreground">No media available</p>
              </div>
            )
          )}
        </AspectRatio>

        {/* Play/pause button overlay - only show if we have a video */}
        {video.pose_video && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="secondary"
              size="icon"
              className="h-12 w-12 rounded-full opacity-80 hover:opacity-100"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default YogaVideoPlayer;
