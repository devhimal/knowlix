
CREATE POLICY "Allow system to update average_rating and total_ratings"
ON public.resources
FOR UPDATE
TO service_role
USING (true);
