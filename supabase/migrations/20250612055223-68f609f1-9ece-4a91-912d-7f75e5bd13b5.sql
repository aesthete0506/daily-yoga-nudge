
-- Drop existing tables to start fresh with new structure
DROP TABLE IF EXISTS public.pose_completions CASCADE;
DROP TABLE IF EXISTS public.schedule CASCADE;
DROP TABLE IF EXISTS public.video_files CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.user_details CASCADE;

-- Create user_details table with new structure
CREATE TABLE public.user_details (
  email TEXT PRIMARY KEY,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
  session_duration INTEGER NOT NULL,
  practice_days TEXT[] NOT NULL,
  reminder_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content_library table
CREATE TABLE public.content_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day INTEGER NOT NULL,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
  asana_name TEXT NOT NULL,
  video_url TEXT NOT NULL,
  benefits TEXT,
  muscles_impacted TEXT,
  UNIQUE (day, experience_level, asana_name)
);

-- Create user_journey table
CREATE TABLE public.user_journey (
  email TEXT PRIMARY KEY REFERENCES user_details(email) ON DELETE CASCADE,
  completed_days INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  total_poses_practiced INTEGER DEFAULT 0,
  total_practice_time INTEGER DEFAULT 0,
  current_day INTEGER DEFAULT 1,
  journey_start_date DATE DEFAULT CURRENT_DATE,
  last_practice_date DATE
);

-- Create indexes for better performance
CREATE INDEX idx_content_library_day_level ON content_library(day, experience_level);
CREATE INDEX idx_user_journey_email ON user_journey(email);
CREATE INDEX idx_user_details_email ON user_details(email);

-- Enable Row Level Security
ALTER TABLE user_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journey ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (for development)
CREATE POLICY "Allow anonymous access to user_details" ON user_details FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to content_library" ON content_library FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to user_journey" ON user_journey FOR ALL USING (true);

-- Enable real-time for all tables
ALTER TABLE user_details REPLICA IDENTITY FULL;
ALTER TABLE content_library REPLICA IDENTITY FULL;
ALTER TABLE user_journey REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE user_details;
ALTER PUBLICATION supabase_realtime ADD TABLE content_library;
ALTER PUBLICATION supabase_realtime ADD TABLE user_journey;

-- Function to complete a day and update user journey
CREATE OR REPLACE FUNCTION complete_day(
  user_email TEXT,
  day_number INTEGER,
  poses_count INTEGER,
  practice_minutes INTEGER
) RETURNS VOID AS $$
BEGIN
  -- Check if user already practiced today
  IF EXISTS (
    SELECT 1 FROM user_journey 
    WHERE email = user_email 
    AND last_practice_date = CURRENT_DATE
  ) THEN
    RAISE EXCEPTION 'You have already completed your practice for today. Come back tomorrow!';
  END IF;
  
  -- Update user journey
  UPDATE user_journey SET
    completed_days = array_append(
      COALESCE(completed_days, ARRAY[]::INTEGER[]), 
      day_number
    ),
    total_poses_practiced = total_poses_practiced + poses_count,
    total_practice_time = total_practice_time + practice_minutes,
    current_day = CASE 
      WHEN day_number = current_day THEN current_day + 1 
      ELSE current_day 
    END,
    last_practice_date = CURRENT_DATE
  WHERE email = user_email;
  
  -- Create user journey record if it doesn't exist
  IF NOT FOUND THEN
    INSERT INTO user_journey (
      email, 
      completed_days, 
      total_poses_practiced, 
      total_practice_time, 
      current_day,
      last_practice_date
    ) VALUES (
      user_email, 
      ARRAY[day_number], 
      poses_count, 
      practice_minutes, 
      day_number + 1,
      CURRENT_DATE
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Sample data for content_library
INSERT INTO content_library (day, experience_level, asana_name, video_url, benefits, muscles_impacted) VALUES
-- Day 1 Beginner
(1, 'beginner', 'Mountain Pose', 'https://www.youtube.com/watch?v=5NxDs-ovJU8', 'Improves posture and balance', 'Core, Legs'),
(1, 'beginner', 'Child''s Pose', 'https://www.youtube.com/watch?v=2MZ_rOglHIc', 'Relieves stress and stretches back', 'Back, Hips'),
(1, 'beginner', 'Cat-Cow Stretch', 'https://www.youtube.com/watch?v=kqnua4rHVVA', 'Improves spine flexibility', 'Spine, Core'),

-- Day 2 Beginner  
(2, 'beginner', 'Downward Dog', 'https://www.youtube.com/watch?v=gLVbHrWsq3c', 'Strengthens arms and stretches hamstrings', 'Arms, Legs, Back'),
(2, 'beginner', 'Warrior I', 'https://www.youtube.com/watch?v=R5_Gqkm8oFE', 'Builds strength and stability', 'Legs, Core'),
(2, 'beginner', 'Tree Pose', 'https://www.youtube.com/watch?v=9DKV0zOhvLY', 'Improves balance and focus', 'Legs, Core'),

-- Day 1 Intermediate
(1, 'intermediate', 'Sun Salutation A', 'https://www.youtube.com/watch?v=3K2O_gPLCzI', 'Full body warm-up sequence', 'Full Body'),
(1, 'intermediate', 'Warrior II', 'https://www.youtube.com/watch?v=BVyAEfI5kPo', 'Hip opening and leg strengthening', 'Hips, Legs'),
(1, 'intermediate', 'Triangle Pose', 'https://www.youtube.com/watch?v=7FD9UpWzCZs', 'Side body stretch and core strengthening', 'Core, Legs'),

-- Day 1 Advanced
(1, 'advanced', 'Crow Pose', 'https://www.youtube.com/watch?v=kOePMSesRFg', 'Arm strength and balance', 'Arms, Core'),
(1, 'advanced', 'Headstand Prep', 'https://www.youtube.com/watch?v=BZzDfJpPDqA', 'Inversions and core strength', 'Arms, Core'),
(1, 'advanced', 'Side Plank', 'https://www.youtube.com/watch?v=3qLsQyR6wVg', 'Core and arm strengthening', 'Core, Arms');
