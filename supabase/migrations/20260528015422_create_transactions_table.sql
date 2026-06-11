CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    resource_id UUID REFERENCES resources(id),
    resource_name TEXT,
    subscription_plan TEXT,
    buyer_id UUID REFERENCES auth.users(id),
    buyer_email TEXT NOT NULL,
    seller_id UUID REFERENCES auth.users(id),
    seller_email TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL,
    transaction_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Optional: Add RLS policies for security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own transactions
CREATE POLICY "Users can view their own transactions" ON transactions
FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Allow authenticated users to insert new transactions
CREATE POLICY "Users can insert their own transactions" ON transactions
FOR INSERT WITH CHECK (auth.uid() = buyer_id);
