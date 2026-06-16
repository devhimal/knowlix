

DROP TRIGGER IF EXISTS resource_ratings_after_insert_update ON public.resource_ratings;
DROP TRIGGER IF EXISTS resource_ratings_after_delete ON public.resource_ratings;


CREATE OR REPLACE FUNCTION public.update_resource_average_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.resources
    SET
        average_rating = COALESCE((SELECT AVG(rating) FROM public.resource_ratings WHERE resource_id = NEW.resource_id), 0.0),
        total_ratings = COALESCE((SELECT COUNT(id) FROM public.resource_ratings WHERE resource_id = NEW.resource_id), 0)
    WHERE id = NEW.resource_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_resource_average_rating_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.resources
    SET
        average_rating = COALESCE((SELECT AVG(rating) FROM public.resource_ratings WHERE resource_id = OLD.resource_id), 0.0),
        total_ratings = COALESCE((SELECT COUNT(id) FROM public.resource_ratings WHERE resource_id = OLD.resource_id), 0)
    WHERE id = OLD.resource_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER resource_ratings_after_insert_update
AFTER INSERT OR UPDATE ON public.resource_ratings
FOR EACH ROW EXECUTE FUNCTION public.update_resource_average_rating();

CREATE TRIGGER resource_ratings_after_delete
AFTER DELETE ON public.resource_ratings
FOR EACH ROW EXECUTE FUNCTION public.update_resource_average_rating_on_delete();
