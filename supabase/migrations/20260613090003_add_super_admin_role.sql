ALTER TABLE public.profiles
DROP CONSTRAINT role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT role_check CHECK ((role = ANY (ARRAY['admin'::text, 'student'::text, 'mentor'::text, 'super_admin'::text])));