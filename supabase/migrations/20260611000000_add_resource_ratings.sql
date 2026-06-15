
CREATE TABLE public.resource_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    CONSTRAINT unique_resource_user_rating UNIQUE (resource_id, user_id)
);

ALTER TABLE public.resource_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view ratings"
ON public.resource_ratings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert their own ratings"
ON public.resource_ratings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to update their own ratings"
ON public.resource_ratings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to delete their own ratings"
ON public.resource_ratings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Optional: For public viewing of ratings
CREATE POLICY "Allow public read access for ratings"
ON public.resource_ratings
FOR SELECT
TO public
USING (true);

ALTER TABLE public.resources
ADD COLUMN average_rating NUMERIC(2, 1) DEFAULT 0.0,
ADD COLUMN total_ratings INTEGER DEFAULT 0;

-- Function to update average_rating and total_ratings in resources table
CREATE OR REPLACE FUNCTION public.update_resource_average_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.resources
    SET
        average_rating = (SELECT AVG(rating) FROM public.resource_ratings WHERE resource_id = NEW.resource_id),
        total_ratings = (SELECT COUNT(id) FROM public.resource_ratings WHERE resource_id = NEW.resource_id)
    WHERE id = NEW.resource_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for inserts and updates on resource_ratings
CREATE TRIGGER resource_ratings_after_insert_update
AFTER INSERT OR UPDATE ON public.resource_ratings
FOR EACH ROW EXECUTE FUNCTION public.update_resource_average_rating();

-- Function for deletes (if a rating is deleted, update average)
CREATE OR REPLACE FUNCTION public.update_resource_average_rating_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.resources
    SET
        average_rating = (SELECT AVG(rating) FROM public.resource_ratings WHERE resource_id = OLD.resource_id),
        total_ratings = (SELECT COUNT(id) FROM public.resource_ratings WHERE resource_id = OLD.resource_id)
    WHERE id = OLD.resource_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER resource_ratings_after_delete
AFTER DELETE ON public.resource_ratings
FOR EACH ROW EXECUTE FUNCTION public.update_resource_average_rating_on_delete();
