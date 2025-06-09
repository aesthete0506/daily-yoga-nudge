
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { VideoFile, getUserYogaPoses, supabase } from '@/lib/supabase';
import { useYoga } from '@/contexts/YogaContext';
import { toast } from '@/components/ui/sonner';

const UserYogaPoses = () => {
  const [poses, setPoses] = useState<VideoFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userEmail, experienceLevel } = useYoga();

  const fetchPoses = async () => {
    if (!userEmail) {
      toast.error("You need to be logged in to view your poses");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching poses for user:", userEmail, "level:", experienceLevel);
      const yogaPoses = await getUserYogaPoses(userEmail);
      
      console.log("Raw yoga poses:", yogaPoses);
      
      // Filter out any missing image or video data
      const validPoses = yogaPoses.filter(pose => 
        pose.pose_name && (pose.pose_image || pose.pose_video)
      );
      
      console.log("Valid poses:", validPoses);
      
      setPoses(validPoses);
      
      if (validPoses.length === 0) {
        console.log("No valid poses found");
      }
    } catch (err) {
      console.error('Error fetching yoga poses:', err);
      setError('Failed to load yoga poses');
      toast.error("Couldn't load your yoga poses. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription for video_files table
  useEffect(() => {
    if (userEmail && experienceLevel) {
      fetchPoses();
      
      // Subscribe to real-time changes
      const channel = supabase
        .channel('video_files_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'video_files'
          },
          (payload) => {
            console.log('Video files table changed:', payload);
            // Refetch poses when data changes
            fetchPoses();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userEmail, experienceLevel]);

  return (
    <Card className="w-full bg-white border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between bg-white">
        <CardTitle className="text-text-primary text-xl font-semibold">Your Yoga Poses</CardTitle>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={fetchPoses}
          disabled={isLoading}
          className="border-primary text-primary hover:bg-primary hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="bg-white">
        {isLoading && (
          <div className="flex justify-center p-4">
            <span className="text-text-primary">Loading poses...</span>
          </div>
        )}
        
        {error && (
          <div className="text-center text-red-500 p-4">
            {error}
          </div>
        )}
        
        {!isLoading && !error && poses.length === 0 && (
          <div className="text-center text-muted-foreground p-4">
            No yoga poses found. Database might be empty or check your experience level settings.
          </div>
        )}
        
        {poses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {poses.map((pose) => (
              <Card key={pose.id} className="overflow-hidden bg-white border border-gray-200 hover:shadow-md transition-shadow">
                <div className="aspect-video relative bg-gray-100">
                  {pose.pose_image && (
                    <img 
                      src={pose.pose_image} 
                      alt={pose.pose_name} 
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        console.log("Image failed to load:", pose.pose_image);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  {!pose.pose_image && (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <CardContent className="p-3 bg-white">
                  <h3 className="font-medium text-text-primary">{pose.pose_name}</h3>
                  {pose.day_number && (
                    <p className="text-xs text-primary mb-1">Day {pose.day_number}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {pose.pose_description?.substring(0, 60)}
                    {pose.pose_description && pose.pose_description.length > 60 ? '...' : ''}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserYogaPoses;
