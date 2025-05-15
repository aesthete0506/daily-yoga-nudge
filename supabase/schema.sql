
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
