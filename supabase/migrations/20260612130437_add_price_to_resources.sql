ALTER TABLE public.resources
ADD COLUMN price NUMERIC(10, 2) DEFAULT 0.00;

-- Optional: Add a check constraint to ensure price is non-negative
ALTER TABLE public.resources
ADD CONSTRAINT price_non_negative CHECK (price >= 0.00);

-- Optional: Add a default value for existing rows if needed, or handle in application logic.
-- For simplicity, new resources will have a default price of 0.00.
-- Existing resources will get a price of 0.00.
