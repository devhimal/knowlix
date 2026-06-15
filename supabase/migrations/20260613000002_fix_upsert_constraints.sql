
-- First, ensure we have a clean state for the unique constraints
ALTER TABLE public.resource_ratings DROP CONSTRAINT IF EXISTS unique_resource_user_rating;
DROP INDEX IF EXISTS unique_resource_user_rating;
DROP INDEX IF EXISTS unique_book_user_rating;

-- Create a full unique constraint for resource_id + user_id (ignoring the nulls for now as it's the standard for ON CONFLICT)
-- Actually, PostgreSQL allows multiple NULLs in UNIQUE constraints, but ON CONFLICT needs a match.
-- To support both resource and book reviews in one table with UPSERT, we need two separate constraints.

-- 1. Full Unique Constraint for Resources (required for ON CONFLICT to work in upsert)
ALTER TABLE public.resource_ratings ADD CONSTRAINT unique_resource_user_rating UNIQUE (resource_id, user_id);

-- 2. Full Unique Constraint for Books (required for ON CONFLICT to work in upsert)
ALTER TABLE public.resource_ratings ADD CONSTRAINT unique_book_user_rating UNIQUE (book_id, user_id);
