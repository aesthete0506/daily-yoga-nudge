
-- Add video_duration column to content_library table
ALTER TABLE content_library 
ADD COLUMN video_duration integer DEFAULT 180;

-- Update some sample data with realistic video durations (in seconds)
UPDATE content_library 
SET video_duration = CASE 
    WHEN asana_name ILIKE '%mountain%' THEN 120
    WHEN asana_name ILIKE '%downward%' THEN 180
    WHEN asana_name ILIKE '%child%' THEN 150
    WHEN asana_name ILIKE '%warrior%' THEN 200
    WHEN asana_name ILIKE '%tree%' THEN 160
    ELSE 180
END;
