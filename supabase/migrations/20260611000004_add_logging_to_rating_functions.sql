
CREATE OR REPLACE FUNCTION public.update_resource_average_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_val NUMERIC;
    count_val INTEGER;
BEGIN
    RAISE LOG 'Trigger update_resource_average_rating fired for resource_id: %', NEW.resource_id;

    SELECT AVG(rating), COUNT(id)
    INTO avg_val, count_val
    FROM public.resource_ratings
    WHERE resource_id = NEW.resource_id;

    RAISE LOG 'Calculated avg_val: %, count_val: % for resource_id: %', COALESCE(avg_val, 0.0), COALESCE(count_val, 0), NEW.resource_id;

    UPDATE public.resources
    SET
        average_rating = COALESCE(avg_val, 0.0),
        total_ratings = COALESCE(count_val, 0)
    WHERE id = NEW.resource_id;

    IF NOT FOUND THEN
        RAISE LOG 'UPDATE on public.resources did not find row for resource_id: %', NEW.resource_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_resource_average_rating_on_delete()
RETURNS TRIGGER AS $$
DECLARE
    avg_val NUMERIC;
    count_val INTEGER;
BEGIN
    RAISE LOG 'Trigger update_resource_average_rating_on_delete fired for resource_id: %', OLD.resource_id;

    SELECT AVG(rating), COUNT(id)
    INTO avg_val, count_val
    FROM public.resource_ratings
    WHERE resource_id = OLD.resource_id;

    RAISE LOG 'Calculated avg_val: %, count_val: % for resource_id: %', COALESCE(avg_val, 0.0), COALESCE(count_val, 0), OLD.resource_id;

    UPDATE public.resources
    SET
        average_rating = COALESCE(avg_val, 0.0),
        total_ratings = COALESCE(count_val, 0)
    WHERE id = OLD.resource_id;

    IF NOT FOUND THEN
        RAISE LOG 'UPDATE on public.resources did not find row for resource_id: %', OLD.resource_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
