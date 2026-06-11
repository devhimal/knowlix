drop extension if exists "pg_net";

drop function if exists "public"."increment_resource_downloads"(resource_id uuid);


  create table "public"."profiles" (
    "id" uuid not null,
    "role" text not null default 'student'::text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."profiles" enable row level security;


  create table "public"."resources" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "title" text not null,
    "description" text,
    "category_id" text not null,
    "sub_category_id" text not null,
    "subject" text not null,
    "semester" text not null,
    "is_free" boolean not null default true,
    "price" numeric(10,2),
    "file_path" text not null,
    "file_name" text not null,
    "file_type" text not null,
    "file_size_mb" numeric(10,2),
    "uploader_id" uuid not null,
    "uploader_name" text,
    "uploader_email" text,
    "status" text not null default 'pending_review'::text,
    "downloads_count" bigint
      );


alter table "public"."resources" enable row level security;

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX resources_pkey ON public.resources USING btree (id);

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."resources" add constraint "resources_pkey" PRIMARY KEY using index "resources_pkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'student'::text, 'mentor'::text]))) not valid;

alter table "public"."profiles" validate constraint "role_check";

alter table "public"."resources" add constraint "resources_uploader_id_fkey" FOREIGN KEY (uploader_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."resources" validate constraint "resources_uploader_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id, role)
  values (new.id, new.raw_user_meta_data->>'role');
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."resources" to "anon";

grant insert on table "public"."resources" to "anon";

grant references on table "public"."resources" to "anon";

grant select on table "public"."resources" to "anon";

grant trigger on table "public"."resources" to "anon";

grant truncate on table "public"."resources" to "anon";

grant update on table "public"."resources" to "anon";

grant delete on table "public"."resources" to "authenticated";

grant insert on table "public"."resources" to "authenticated";

grant references on table "public"."resources" to "authenticated";

grant select on table "public"."resources" to "authenticated";

grant trigger on table "public"."resources" to "authenticated";

grant truncate on table "public"."resources" to "authenticated";

grant update on table "public"."resources" to "authenticated";

grant delete on table "public"."resources" to "service_role";

grant insert on table "public"."resources" to "service_role";

grant references on table "public"."resources" to "service_role";

grant select on table "public"."resources" to "service_role";

grant trigger on table "public"."resources" to "service_role";

grant truncate on table "public"."resources" to "service_role";

grant update on table "public"."resources" to "service_role";


  create policy "Public profiles are viewable by everyone."
  on "public"."profiles"
  as permissive
  for select
  to public
using (true);



  create policy "Users can insert their own profile."
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Users can update own profile."
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Allow authenticated users to insert their own resources"
  on "public"."resources"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = uploader_id));



  create policy "Select"
  on "public"."resources"
  as permissive
  for select
  to public
using (true);



  create policy "Upload Policy"
  on "public"."resources"
  as permissive
  for insert
  to public
with check ((auth.uid() = uploader_id));


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Select 4sqm86_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'resource_files'::text));



  create policy "insert 4sqm86_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'resource_files'::text));



