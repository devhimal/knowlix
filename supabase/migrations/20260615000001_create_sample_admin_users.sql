-- ==============================================================================
-- NOTE: Before running this script, you MUST replace the placeholders 
-- ('INSERT_SUPER_ADMIN_USER_UUID_HERE' and 'INSERT_ADMIN_USER_UUID_HERE') 
-- with the actual UUIDs of the users from your 'auth.users' table.
-- ==============================================================================

-- 1. Promote a user to Super Admin
-- This grants full administrative control over user roles.
UPDATE public.profiles
SET role = 'super_admin'
WHERE id = 'b46f242e-ba58-4bc3-bdc6-6244429730cd';

-- 2. Promote a user to Admin
-- This grants limited administrative access (as defined by your application logic).
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'd820e8e2-2c73-4cd4-b9c4-54e9492e6924';

-- ==============================================================================
-- Verification
-- ==============================================================================
-- Run this to verify the changes:
-- SELECT id, role FROM public.profiles WHERE role IN ('super_admin', 'admin');
