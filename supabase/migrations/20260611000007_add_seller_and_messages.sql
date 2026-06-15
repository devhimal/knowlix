-- Add seller_id to books table
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update the insert policy for books to ensure seller_id is set
-- We'll assume the client sends the seller_id for now, or we can use a trigger
-- But in Supabase, we can just use auth.uid() in the insert check or default value.

-- Re-create policies with seller_id in mind
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.books;
CREATE POLICY "Enable update for users to their own books" ON public.books FOR UPDATE USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.books;
CREATE POLICY "Enable delete for users to their own books" ON public.books FOR DELETE USING (auth.uid() = seller_id);

-- Create messages table for real-time chat
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see messages where they are either sender or receiver
CREATE POLICY "Users can view their own messages" 
ON public.messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy: Users can only insert messages as themselves
CREATE POLICY "Users can insert messages as themselves" 
ON public.messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can update is_read status for messages they received
CREATE POLICY "Users can update is_read for received messages" 
ON public.messages FOR UPDATE 
USING (auth.uid() = receiver_id);
