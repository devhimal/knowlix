ALTER TABLE public.resources
ADD COLUMN price NUMERIC(10, 2) DEFAULT 0.00;


ALTER TABLE public.resources
ADD CONSTRAINT price_non_negative CHECK (price >= 0.00);




