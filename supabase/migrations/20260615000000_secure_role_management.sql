-- Create a function to check if the current user is a super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a restrictive policy for role updates
-- This ensures only super_admins can perform UPDATE operations on the profiles table
DROP POLICY IF EXISTS "Only super_admins can update user roles" ON public.profiles;

CREATE POLICY "Only super_admins can update user roles"
ON public.profiles
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Optional: Update existing "Users can update own profile" policy 
-- if you need to prevent users from updating their own roles while 
-- still allowing them to update other profile fields (like name/course).
-- This requires deleting the old policy first if it's too permissive.
-- DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
-- CREATE POLICY "Users can update own profile." ON public.profiles
-- AS PERMISSIVE FOR UPDATE TO authenticated
-- USING (auth.uid() = id)
-- WITH CHECK (auth.uid() = id AND (old.role IS NOT DISTINCT FROM new.role));
