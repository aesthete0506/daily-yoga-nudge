
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

// IST timezone helper
const IST_OFFSET = '+05:30';

export const getISTTime = () => {
  return new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
};

export const getISTDate = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

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
  video_duration?: number; // in seconds
  benefits?: string;
  muscles_impacted?: string;
  pose_steps?: string[];
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
  streak_count?: number;
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
      .upsert({
        ...userDetails,
        created_at: getISTTime()
      });
    
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

// Calculate streak based on IST timezone
const calculateStreak = (lastPracticeDate: string | null, currentDate: string): number => {
  if (!lastPracticeDate) return 1;
  
  const last = new Date(lastPracticeDate + 'T00:00:00+05:30');
  const current = new Date(currentDate + 'T00:00:00+05:30');
  const diffTime = Math.abs(current.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return 1; // Will be incremented in completeDay function
  } else if (diffDays > 1) {
    return 1; // Reset streak
  }
  
  return 1; // Same day practice
};

// Complete a day with streak tracking using IST
export const completeDay = async (
  userEmail: string, 
  dayNumber: number, 
  posesCount: number, 
  practiceMinutes: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const currentDate = getISTDate();
    
    // Get current journey to calculate streak
    const currentJourney = await getUserJourney(userEmail);
    let newStreak = 1;
    
    if (currentJourney) {
      const daysSinceLastPractice = currentJourney.last_practice_date 
        ? Math.abs(new Date(currentDate).getTime() - new Date(currentJourney.last_practice_date).getTime()) / (1000 * 60 * 60 * 24)
        : 0;
        
      if (daysSinceLastPractice <= 1 && currentJourney.last_practice_date !== currentDate) {
        newStreak = (currentJourney.streak_count || 0) + 1;
      } else if (daysSinceLastPractice > 1) {
        newStreak = 1;
      } else {
        newStreak = currentJourney.streak_count || 1;
      }
    }

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
    
    // Update streak separately
    await supabase
      .from('user_journey')
      .update({ 
        streak_count: newStreak,
        last_practice_date: currentDate
      })
      .eq('email', userEmail);
    
    return { success: true };
  } catch (error) {
    console.error('Error in completeDay:', error);
    return { success: false, error: 'Failed to complete day' };
  }
};
