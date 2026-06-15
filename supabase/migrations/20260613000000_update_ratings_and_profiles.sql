
-- Add is_premium to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- Update resource_ratings to support both resources and books
ALTER TABLE public.resource_ratings ALTER COLUMN resource_id DROP NOT NULL;
ALTER TABLE public.resource_ratings ADD COLUMN IF NOT EXISTS book_id UUID REFERENCES public.books(id) ON DELETE CASCADE;

-- Ensure either resource_id or book_id is set, but not both? 
-- Actually, it can be both if it's the same table, but let's add a check constraint.
ALTER TABLE public.resource_ratings ADD CONSTRAINT check_rating_target CHECK (
    (resource_id IS NOT NULL AND book_id IS NULL) OR
    (resource_id IS NULL AND book_id IS NOT NULL)
);

-- Remove old unique constraint and add new ones
ALTER TABLE public.resource_ratings DROP CONSTRAINT IF EXISTS unique_resource_user_rating;
CREATE UNIQUE INDEX IF NOT EXISTS unique_resource_user_rating ON public.resource_ratings (resource_id, user_id) WHERE resource_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS unique_book_user_rating ON public.resource_ratings (book_id, user_id) WHERE book_id IS NOT NULL;

-- Add rating columns to books
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS average_rating NUMERIC(2, 1) DEFAULT 0.0;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;

-- Update rating functions to handle both resources and books
CREATE OR REPLACE FUNCTION public.update_average_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.resource_id IS NOT NULL THEN
        UPDATE public.resources
        SET
            average_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.resource_ratings WHERE resource_id = NEW.resource_id),
            total_ratings = (SELECT COUNT(id) FROM public.resource_ratings WHERE resource_id = NEW.resource_id)
        WHERE id = NEW.resource_id;
    ELSIF NEW.book_id IS NOT NULL THEN
        UPDATE public.books
        SET
            average_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.resource_ratings WHERE book_id = NEW.book_id),
            total_ratings = (SELECT COUNT(id) FROM public.resource_ratings WHERE book_id = NEW.book_id)
        WHERE id = NEW.book_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger for inserts and updates
DROP TRIGGER IF EXISTS resource_ratings_after_insert_update ON public.resource_ratings;
CREATE TRIGGER ratings_after_insert_update
AFTER INSERT OR UPDATE ON public.resource_ratings
FOR EACH ROW EXECUTE FUNCTION public.update_average_rating();

-- Function for deletes
CREATE OR REPLACE FUNCTION public.update_average_rating_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.resource_id IS NOT NULL THEN
        UPDATE public.resources
        SET
            average_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.resource_ratings WHERE resource_id = OLD.resource_id),
            total_ratings = (SELECT COUNT(id) FROM public.resource_ratings WHERE resource_id = OLD.resource_id)
        WHERE id = OLD.resource_id;
    ELSIF OLD.book_id IS NOT NULL THEN
        UPDATE public.books
        SET
            average_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.resource_ratings WHERE book_id = OLD.book_id),
            total_ratings = (SELECT COUNT(id) FROM public.resource_ratings WHERE book_id = OLD.book_id)
        WHERE id = OLD.book_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS resource_ratings_after_delete ON public.resource_ratings;
CREATE TRIGGER ratings_after_delete
AFTER DELETE ON public.resource_ratings
FOR EACH ROW EXECUTE FUNCTION public.update_average_rating_on_delete();
