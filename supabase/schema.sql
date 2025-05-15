
-- Create the user_details table
CREATE TABLE user_details (
  email TEXT PRIMARY KEY,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  session_duration TEXT CHECK (session_duration IN ('short', 'medium', 'long')),
  practice_days TEXT[],
  reminder_time TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create the user_progress table
CREATE TABLE user_progress (
  email TEXT PRIMARY KEY REFERENCES user_details(email),
  completed_days INTEGER[],
  total_poses_practiced INTEGER DEFAULT 0,
  total_practice_time FLOAT DEFAULT 0
);

-- Create the video_files table
CREATE TABLE video_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT CHECK (category IN ('beginner', 'intermediate', 'advanced')),
  pose_name TEXT NOT NULL,
  pose_image TEXT,
  pose_video TEXT,
  pose_description TEXT,
  pose_benefits TEXT[],
  pose_steps TEXT[],
  UNIQUE (category, pose_name)
);

-- Create the schedule table
CREATE TABLE schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT CHECK (category IN ('beginner', 'intermediate', 'advanced')),
  day_number INTEGER NOT NULL,
  pose_names TEXT[],
  UNIQUE (category, day_number)
);

-- Create indexes for better query performance
CREATE INDEX idx_user_details_email ON user_details(email);
CREATE INDEX idx_video_files_category ON video_files(category);
CREATE INDEX idx_schedule_category ON schedule(category);
CREATE INDEX idx_video_files_pose_name ON video_files(pose_name);

-- Create a stored procedure to create or update user details
CREATE OR REPLACE FUNCTION create_or_update_user_details(
  p_email TEXT,
  p_experience_level TEXT,
  p_session_duration TEXT,
  p_practice_days TEXT[],
  p_reminder_time TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO user_details (email, experience_level, session_duration, practice_days, reminder_time)
  VALUES (p_email, p_experience_level, p_session_duration, p_practice_days, p_reminder_time)
  ON CONFLICT (email) 
  DO UPDATE SET 
    experience_level = p_experience_level,
    session_duration = p_session_duration,
    practice_days = p_practice_days,
    reminder_time = p_reminder_time;
END;
$$ LANGUAGE plpgsql;

-- Create a stored procedure to create a user if not exists
CREATE OR REPLACE FUNCTION create_user_if_not_exists(
  user_email TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO user_details (email, experience_level, session_duration, practice_days, reminder_time)
  VALUES (user_email, NULL, NULL, ARRAY[]::TEXT[], NULL)
  ON CONFLICT (email) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE user_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (for development purposes only)
-- In a production environment, you should use proper authentication
CREATE POLICY "Allow anonymous read access to user_details" 
  ON user_details FOR SELECT 
  USING (true);

CREATE POLICY "Allow anonymous insert access to user_details" 
  ON user_details FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to user_details" 
  ON user_details FOR UPDATE 
  USING (true);

CREATE POLICY "Allow anonymous read access to user_progress" 
  ON user_progress FOR SELECT 
  USING (true);

CREATE POLICY "Allow anonymous insert access to user_progress" 
  ON user_progress FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to user_progress" 
  ON user_progress FOR UPDATE 
  USING (true);

CREATE POLICY "Allow anonymous read access to video_files" 
  ON video_files FOR SELECT 
  USING (true);

CREATE POLICY "Allow anonymous read access to schedule" 
  ON schedule FOR SELECT 
  USING (true);

-- Sample data for video_files (optional, you can uncomment and modify as needed)
-- INSERT INTO video_files (category, pose_name, pose_image, pose_video, pose_description, pose_benefits, pose_steps)
-- VALUES 
--   ('beginner', 'Mountain Pose', 'https://example.com/mountain.jpg', 'https://example.com/mountain.mp4', 
--    'A foundational standing pose', ARRAY['Improves posture', 'Strengthens thighs'], 
--    ARRAY['Stand with feet together', 'Root down through all four corners of the feet']),
--   ('beginner', 'Child''s Pose', 'https://example.com/child.jpg', 'https://example.com/child.mp4', 
--    'A restful pose that gently stretches the back', ARRAY['Relieves stress', 'Stretches hips and thighs'], 
--    ARRAY['Kneel on the floor', 'Touch big toes together and sit on heels', 'Separate knees about as wide as your hips']);

-- Sample schedule data (optional, you can uncomment and modify as needed)
-- INSERT INTO schedule (category, day_number, pose_names)
-- VALUES
--   ('beginner', 1, ARRAY['Mountain Pose', 'Child''s Pose']),
--   ('beginner', 2, ARRAY['Downward Facing Dog', 'Cobra Pose']);
