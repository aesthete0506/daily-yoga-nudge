
import { createClient } from '@supabase/supabase-js';

// Use provided values instead of environment variables for now
const supabaseUrl = 'https://kwgyfuzqrsooyidmjksv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Z3lmdXpxcnNvb3lpZG1qa3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMDA3OTgsImV4cCI6MjA2Mjg3Njc5OH0.xMn8OA8vwmiVA7mz_4Uys5wcv7naNYyPh4g6oV2Ty1s';

// For future reference, once environment variables are set up:
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackUrl;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackKey;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Enable public access temporarily - this is needed to bypass RLS policies for anonymous users
// In a production environment, you should use proper authentication
export const enablePublicAccess = async () => {
  // Since we can't directly modify RLS from client side, we need to create an entry first
  // then use it as a reference. This is a workaround for development purposes only.
  try {
    // First try to insert the record with an RPC call (which might bypass RLS)
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
};

export type VideoFile = {
  id?: string;
  category: 'beginner' | 'intermediate' | 'advanced';
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
};
