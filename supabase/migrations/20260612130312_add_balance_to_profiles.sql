ALTER TABLE public.profiles
ADD COLUMN balance NUMERIC(10, 2) DEFAULT 0.00;


ALTER TABLE public.profiles
ADD CONSTRAINT balance_non_negative CHECK (balance >= 0.00);