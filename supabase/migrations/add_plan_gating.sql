-- Add subscription plan fields
ALTER TABLE public.restaurant_profiles 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'basic' NOT NULL,
ADD COLUMN IF NOT EXISTS has_website_addon BOOLEAN DEFAULT false NOT NULL;

-- Create locked_feature_attempts table for upsell tracking
CREATE TABLE IF NOT EXISTS public.locked_feature_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurant_profiles(id) ON DELETE CASCADE NOT NULL,
    plan TEXT NOT NULL,
    feature TEXT NOT NULL,
    page TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.locked_feature_attempts ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- Policies for locked_feature_attempts
-- ----------------------------------------------------
CREATE POLICY "Public can track attempts" ON public.locked_feature_attempts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can view attempts" ON public.locked_feature_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.restaurant_profiles
            WHERE restaurant_profiles.id = locked_feature_attempts.restaurant_id
            AND restaurant_profiles.user_id = auth.uid()
        )
    );
