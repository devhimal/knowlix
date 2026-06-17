-- Migration: Fix foreign key constraints on transactions table to allow cascading deletes when a user is deleted

BEGIN;

-- Drop existing constraints
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_buyer_id_fkey;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_seller_id_fkey;

-- Re-add constraints with ON DELETE CASCADE
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_buyer_id_fkey 
FOREIGN KEY (buyer_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES auth.users(id) ON DELETE CASCADE;

COMMIT;
