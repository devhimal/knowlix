CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.payment_method_type AS ENUM ('bank', 'esewa', 'khalti');

CREATE TABLE public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status public.withdrawal_status DEFAULT 'pending' NOT NULL,
    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    processed_date TIMESTAMP WITH TIME ZONE,
    payment_method public.payment_method_type NOT NULL,
    account_details_snapshot JSONB NOT NULL, -- Stores bank details, Esewa/Khalti ID, etc.
    admin_notes TEXT
);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Policies for withdrawal_requests (basic example, will need refinement based on RLS task)
CREATE POLICY "Enable read access for requestor" ON public.withdrawal_requests
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users" ON public.withdrawal_requests
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policy (will need to be more specific with RLS task later)
CREATE POLICY "Enable full access for admin" ON public.withdrawal_requests
FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE auth.uid() = id AND role = 'admin' OR role = 'super_admin'));