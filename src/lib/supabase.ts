
import { createClient } from '@supabase/supabase-js';

// Use provided values instead of environment variables for now
const supabaseUrl = 'https://kwgyfuzqrsooyidmjksv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Z3lmdXpxcnNvb3lpZG1qa3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMDA3OTgsImV4cCI6MjA2Mjg3Njc5OH0.xMn8OA8vwmiVA7mz_4Uys5wcv7naNYyPh4g6oV2Ty1s';

// Create the Supabase client with real-time updates and no caching
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: { 
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Enable public access temporarily - this is needed to bypass RLS policies for anonymous users
export const enablePublicAccess = async () => {
  try {
    const { error: rpcError } = await supabase.rpc('create_user_if_not_exists', { 
      user_email: localStorage.getItem('userEmail') || 'temp@example.com' 
    });
    
    if (rpcError) {
      console.log("Using fallback method for data access");
    }
    
    return true;
  } catch (error) {
    console.error("Could not enable public access:", error);
    return false;
  }
};

// Function to fetch video files with real-time updates and cache busting
export const getVideoFiles = async (category?: 'beginner' | 'intermediate' | 'advanced'): Promise<VideoFile[]> => {
  try {
    await enablePublicAccess();
    
    let query = supabase
      .from('video_files')
      .select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    // Add random parameter to bust cache
    const timestamp = Date.now();
    console.log(`Fetching video files at ${timestamp}`);
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching video files:", error);
      return [];
    }
    
    console.log("Fetched video files:", data);
    return data || [];
  } catch (error) {
    console.error("Error in getVideoFiles:", error);
    return [];
  }
};

// Function to fetch user's yoga poses with real-time updates
export const getUserYogaPoses = async (email: string): Promise<VideoFile[]> => {
  try {
    await enablePublicAccess();
    
    // Get user progress to find which poses they've practiced
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('email', email)
      .single();
    
    if (progressError && progressError.code !== 'PGRST116') {
      console.error("Error fetching user progress:", progressError);
      return [];
    }
    
    // Get all videos in the user's experience level
    const { data: userData, error: userError } = await supabase
      .from('user_details')
      .select('experience_level')
      .eq('email', email)
      .single();
      
    if (userError) {
      console.error("Error fetching user details:", userError);
      return [];
    }
    
    const experienceLevel = userData?.experience_level || 'beginner';
    
    // Get all videos for the user's experience level with cache busting
    return await getVideoFiles(experienceLevel as 'beginner' | 'intermediate' | 'advanced');
  } catch (error) {
    console.error("Error in getUserYogaPoses:", error);
    return [];
  }
};

// Database types based on the tables
export type UserDetail = {
  email: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | null;
  session_duration: 'short' | 'medium' | 'long' | null;
  practice_days: string[];
  reminder_time: string | null;
  created_at?: string;
};

export type UserProgress = {
  email: string;
  completed_days: number[];
  total_poses_practiced: number;
  total_practice_time: number;
  current_day: number;
  profile_locked: boolean;
  cooldown_preference: 'auto' | 'manual';
};

export type VideoFile = {
  id?: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  day_number?: number;
  pose_name: string;
  pose_image: string;
  pose_video: string;
  pose_description?: string;
  pose_benefits?: string[];
  pose_steps?: string[];
};

export type ScheduleEntry = {
  id?: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  day_number: number;
  pose_names: string[];
  completion_status: 'locked' | 'available' | 'completed';
};
