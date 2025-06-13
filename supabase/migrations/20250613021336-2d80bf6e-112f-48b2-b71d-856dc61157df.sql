
-- Add pose_steps column to content_library table
ALTER TABLE content_library 
ADD COLUMN pose_steps text[];

-- Add streak_count column to user_journey table
ALTER TABLE user_journey 
ADD COLUMN streak_count integer DEFAULT 0;

-- Update some sample data with pose steps
UPDATE content_library 
SET pose_steps = CASE 
    WHEN asana_name ILIKE '%mountain%' THEN ARRAY[
        'Stand with feet together',
        'Distribute weight evenly',
        'Arms at sides, palms forward',
        'Engage leg muscles',
        'Lengthen spine, relax shoulders'
    ]
    WHEN asana_name ILIKE '%downward%' THEN ARRAY[
        'Begin on hands and knees',
        'Lift hips up and back',
        'Straighten legs without locking knees',
        'Press chest toward thighs',
        'Relax head, gaze at navel'
    ]
    WHEN asana_name ILIKE '%child%' THEN ARRAY[
        'Kneel on the floor, big toes touching',
        'Sit back on heels',
        'Extend arms forward',
        'Rest forehead on mat',
        'Breathe deeply and relax'
    ]
    ELSE ARRAY[
        'Follow the video instructions',
        'Maintain steady breathing',
        'Hold the pose as demonstrated',
        'Focus on proper alignment'
    ]
END;
