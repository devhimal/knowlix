-- Allow service_role to insert into subscriptions table, bypassing RLS for server-side operations
CREATE POLICY "Allow service_role to insert subscriptions"
ON public.subscriptions
FOR INSERT
TO service_role
WITH CHECK (true);