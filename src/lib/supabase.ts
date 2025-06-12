
import { createClient } from '@supabase/supabase-js';

// Use provided values instead of environment variables for now
const supabaseUrl = 'https://kwgyfuzqrsooyidmjksv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Z3lmdXpxcnNvb3lpZG1qa3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMDA3OTgsImV4cCI6MjA2Mjg3Njc5OH0.xMn8OA8vwmiVA7mz_4Uys5wcv7naNYyPh4g6oV2Ty1s';

// Create the Supabase client with real-time updates
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
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Database types for new schema
export type UserDetails = {
  email: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  session_duration: number; // in minutes
  practice_days: string[];
  reminder_time: string; // HH:MM format
  created_at?: string;
};

// Legacy type alias for backward compatibility
export type UserDetail = UserDetails;

export type ContentLibrary = {
  id?: string;
  day: number;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  asana_name: string;
  video_url: string;
  benefits?: string;
  muscles_impacted?: string;
};

// Updated VideoFile type with all necessary properties
export type VideoFile = ContentLibrary & {
  pose_name: string;
  pose_image?: string;
  pose_video?: string;
  day_number?: number;
  pose_description?: string;
};

export type UserJourney = {
  email: string;
  completed_days: number[];
  total_poses_practiced: number;
  total_practice_time: number; // in minutes
  current_day: number;
  journey_start_date?: string;
  last_practice_date?: string;
};

// Get content for a specific day and experience level
export const getDayContent = async (day: number, experienceLevel: 'beginner' | 'intermediate' | 'advanced'): Promise<ContentLibrary[]> => {
  try {
    const { data, error } = await supabase
      .from('content_library')
      .select('*')
      .eq('day', day)
      .eq('experience_level', experienceLevel)
      .order('asana_name');
    
    if (error) {
      console.error('Error fetching day content:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getDayContent:', error);
    return [];
  }
};

// Legacy function for backward compatibility
export const getVideoFiles = async (experienceLevel: 'beginner' | 'intermediate' | 'advanced'): Promise<VideoFile[]> => {
  try {
    const { data, error } = await supabase
      .from('content_library')
      .select('*')
      .eq('experience_level', experienceLevel)
      .order('day');
    
    if (error) {
      console.error('Error fetching video files:', error);
      return [];
    }
    
    // Convert ContentLibrary to VideoFile format
    return (data || []).map(item => ({
      ...item,
      pose_name: item.asana_name,
      pose_video: item.video_url,
      day_number: item.day,
      pose_description: item.benefits
    }));
  } catch (error) {
    console.error('Error in getVideoFiles:', error);
    return [];
  }
};

// Legacy function for backward compatibility
export const getUserYogaPoses = async (userEmail: string): Promise<VideoFile[]> => {
  try {
    // Get user details first to determine experience level
    const userDetails = await getUserDetails(userEmail);
    if (!userDetails) return [];
    
    return await getVideoFiles(userDetails.experience_level);
  } catch (error) {
    console.error('Error in getUserYogaPoses:', error);
    return [];
  }
};

// Get user details
export const getUserDetails = async (email: string): Promise<UserDetails | null> => {
  try {
    const { data, error } = await supabase
      .from('user_details')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user details:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserDetails:', error);
    return null;
  }
};

// Get user journey
export const getUserJourney = async (email: string): Promise<UserJourney | null> => {
  try {
    const { data, error } = await supabase
      .from('user_journey')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user journey:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserJourney:', error);
    return null;
  }
};

// Save user details
export const saveUserDetails = async (userDetails: UserDetails): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_details')
      .upsert(userDetails);
    
    if (error) {
      console.error('Error saving user details:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveUserDetails:', error);
    return false;
  }
};

// Complete a day (calls the database function)
export const completeDay = async (
  userEmail: string, 
  dayNumber: number, 
  posesCount: number, 
  practiceMinutes: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.rpc('complete_day', {
      user_email: userEmail,
      day_number: dayNumber,
      poses_count: posesCount,
      practice_minutes: practiceMinutes
    });
    
    if (error) {
      console.error('Error completing day:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in completeDay:', error);
    return { success: false, error: 'Failed to complete day' };
  }
};
