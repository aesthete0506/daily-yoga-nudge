import { useState, useEffect } from 'react';
import { VideoFile, getUserYogaPoses } from '@/lib/supabase';
import { useYoga } from '@/contexts/YogaContext';
import { toast } from '@/components/ui/sonner';

export const useYogaPoses = () => {
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
      const yogaPoses = await getUserYogaPoses(userEmail);
      
      // Filter out any missing image or video data
      const validPoses = yogaPoses.filter(pose => 
        pose.pose_name && (pose.pose_image || pose.pose_video)
      );
      
      // Set video fields to empty for dashboard display
      const dashboardSafePoses = validPoses.map(pose => ({
        ...pose,
        // Keep the video URL reference but don't render in dashboard
        pose_video: ''
      }));
      
      setPoses(dashboardSafePoses);
    } catch (err) {
      console.error('Error fetching yoga poses:', err);
      setError('Failed to load yoga poses');
      toast.error("Couldn't load your yoga poses. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch poses when component mounts or when user email/experience level changes
  useEffect(() => {
    if (userEmail && experienceLevel) {
      fetchPoses();
    }
  }, [userEmail, experienceLevel]);

  // Function to manually refresh poses
  const refreshPoses = () => {
    fetchPoses();
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
