
import { useState, useEffect } from 'react';
import { VideoFile, getUserYogaPoses, supabase } from '@/lib/supabase';
import { useYoga } from '@/contexts/YogaContext';
import { toast } from '@/components/ui/sonner';

export const useYogaPoses = () => {
  const [poses, setPoses] = useState<VideoFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userEmail, experienceLevel } = useYoga();

  const fetchPoses = async (forceRefresh = false) => {
    if (!userEmail) {
      if (!forceRefresh) {
        toast.error("You need to be logged in to view your poses");
      }
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching poses for user: ${userEmail}, level: ${experienceLevel}, forceRefresh: ${forceRefresh}`);
      
      // Add timestamp to force cache invalidation
      const timestamp = Date.now();
      console.log(`Fetch attempt at: ${timestamp}`);
      
      const yogaPoses = await getUserYogaPoses(userEmail);
      
      console.log("Retrieved yoga poses:", yogaPoses);
      
      // Filter out any missing required data
      const validPoses = yogaPoses.filter(pose => 
        pose.pose_name && (pose.pose_image || pose.pose_video)
      );
      
      console.log("Valid filtered poses:", validPoses);
      
      setPoses(validPoses);
      
      if (forceRefresh) {
        toast.success("Poses refreshed successfully!");
      }
    } catch (err) {
      console.error('Error fetching yoga poses:', err);
      setError('Failed to load yoga poses');
      if (forceRefresh) {
        toast.error("Couldn't refresh your yoga poses. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription and initial fetch
  useEffect(() => {
    if (userEmail && experienceLevel) {
      console.log("Setting up poses fetch for:", userEmail, experienceLevel);
      fetchPoses();

      // Subscribe to real-time changes on video_files table
      const videoChannel = supabase
        .channel('video_files_realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'video_files'
          },
          (payload) => {
            console.log('Video files table changed:', payload);
            fetchPoses(false); // Refresh without showing toast
          }
        )
        .subscribe();

      // Also subscribe to user_details changes
      const userChannel = supabase
        .channel('user_details_realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_details',
            filter: `email=eq.${userEmail}`
          },
          (payload) => {
            console.log('User details changed:', payload);
            fetchPoses(false);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(videoChannel);
        supabase.removeChannel(userChannel);
      };
    }
  }, [userEmail, experienceLevel]);

  // Function to manually refresh poses
  const refreshPoses = () => {
    fetchPoses(true);
  };

  // Function to get a full pose with video data (for practice mode only)
  const getFullPoseData = async (poseName: string): Promise<VideoFile | null> => {
    if (!userEmail || !experienceLevel) return null;
    
    try {
      const yogaPoses = await getUserYogaPoses(userEmail);
      return yogaPoses.find(pose => pose.pose_name === poseName) || null;
    } catch (err) {
      console.error('Error fetching pose data:', err);
      return null;
    }
  };

  return {
    poses,
    isLoading,
    error,
    refreshPoses,
    getFullPoseData
  };
};
