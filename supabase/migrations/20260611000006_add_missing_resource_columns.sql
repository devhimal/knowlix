-- Add missing columns to resources table to support reviews, AI analysis, and plagiarism checks
ALTER TABLE public.resources
ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_analysis JSONB,
ADD COLUMN IF NOT EXISTS plagiarism_result JSONB;

-- Update existing policies if necessary (usually they cover all columns)
