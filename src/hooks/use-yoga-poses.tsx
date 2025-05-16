
import { useState, useEffect } from 'react';
import { VideoFile, getUserYogaPoses } from '@/lib/supabase';
import { useYoga } from '@/contexts/YogaContext';

export const useYogaPoses = () => {
  const [poses, setPoses] = useState<VideoFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userEmail, experienceLevel } = useYoga();

  const fetchPoses = async () => {
    if (!userEmail) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const yogaPoses = await getUserYogaPoses(userEmail);
      setPoses(yogaPoses);
    } catch (err) {
      console.error('Error fetching yoga poses:', err);
      setError('Failed to load yoga poses');
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
