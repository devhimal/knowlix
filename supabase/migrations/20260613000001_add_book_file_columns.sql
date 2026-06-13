
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS cover_image_path TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_review';
