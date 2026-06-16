CREATE TABLE public.resource_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.resource_purchases ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Enable read access for buyers" ON public.resource_purchases
FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Enable insert for authenticated users" ON public.resource_purchases
FOR INSERT WITH CHECK (auth.uid() = buyer_id);