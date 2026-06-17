-- Add name and email to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update the handle_new_user function to sync name and email from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id, role, name, email)
  values (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    COALESCE(new.raw_user_meta_data->>'name', 'Unknown'),
    new.email
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    email = EXCLUDED.email;
  return new;
end;
$function$;

-- One-time sync for existing users (this might fail in some environments if not admin, 
-- but in Supabase migrations it usually runs with high enough privileges if it's the right place)
-- Note: We can't easily list auth.users from a migration unless we have access.
-- But we can at least ensure future users are synced.
