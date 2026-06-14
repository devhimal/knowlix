ALTER TABLE public.profiles
ADD COLUMN balance NUMERIC(10, 2) DEFAULT 0.00;

-- Optional: Add a check constraint to ensure balance is not negative
ALTER TABLE public.profiles
ADD CONSTRAINT balance_non_negative CHECK (balance >= 0.00);