-- Create resource_reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.resource_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, resolved, ignored
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.resource_reports ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist before creating them to avoid errors
DROP POLICY IF EXISTS "Users can insert their own reports" ON public.resource_reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.resource_reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.resource_reports;

-- Policy: Users can report resources
CREATE POLICY "Users can insert their own reports" ON public.resource_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Policy: Admins can view all reports
CREATE POLICY "Admins can view all reports" ON public.resource_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
        )
    );

-- Policy: Admins can update reports (resolve/ignore)
CREATE POLICY "Admins can update reports" ON public.resource_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
        )
    );
