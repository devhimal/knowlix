
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
