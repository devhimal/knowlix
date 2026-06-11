
CREATE OR REPLACE FUNCTION public.update_resource_average_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_val NUMERIC;
    count_val INTEGER;
BEGIN
    SELECT AVG(rating), COUNT(id)
    INTO avg_val, count_val
    FROM public.resource_ratings
    WHERE resource_id = NEW.resource_id;

    UPDATE public.resources
    SET
        average_rating = COALESCE(avg_val, 0.0),
        total_ratings = COALESCE(count_val, 0)
    WHERE id = NEW.resource_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_resource_average_rating_on_delete()
RETURNS TRIGGER AS $$
DECLARE
    avg_val NUMERIC;
    count_val INTEGER;
BEGIN
    SELECT AVG(rating), COUNT(id)
    INTO avg_val, count_val
    FROM public.resource_ratings
    WHERE resource_id = OLD.resource_id;

    UPDATE public.resources
    SET
        average_rating = COALESCE(avg_val, 0.0),
        total_ratings = COALESCE(count_val, 0)
    WHERE id = OLD.resource_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
