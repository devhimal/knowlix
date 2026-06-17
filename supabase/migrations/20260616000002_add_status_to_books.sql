-- Add status column to books table and set default to pending_review
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_review';

-- Update existing books to 'approved' (assuming pre-existing ones are approved)
UPDATE public.books SET status = 'approved' WHERE status IS NULL;
