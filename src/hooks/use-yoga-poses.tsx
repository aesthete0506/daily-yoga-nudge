
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
      setPoses(yogaPoses);
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

  return {
    poses,
    isLoading,
    error,
    refreshPoses
  };
};
