
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please connect your Lovable project to Supabase through the Supabase button in the top right corner.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

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
