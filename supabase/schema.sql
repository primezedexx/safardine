-- Drop old tables if they exist to start fresh
DROP TABLE IF EXISTS public.analytics CASCADE;
DROP TABLE IF EXISTS public.menu_items CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.restaurants CASCADE;

DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.qr_scans CASCADE;
DROP TABLE IF EXISTS public.restaurant_visits CASCADE;
DROP TABLE IF EXISTS public.restaurant_profiles CASCADE;

-- Create restaurant_profiles table
CREATE TABLE public.restaurant_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    restaurant_name TEXT,
    restaurant_slug TEXT UNIQUE,
    restaurant_description TEXT,
    restaurant_address TEXT,
    restaurant_phone TEXT,
    restaurant_email TEXT,
    restaurant_logo TEXT,
    restaurant_cover TEXT,
    restaurant_category TEXT,
    currency TEXT DEFAULT 'INR' NOT NULL,
    setup_completed BOOLEAN DEFAULT false NOT NULL,
    subscription_active BOOLEAN DEFAULT false NOT NULL,
    subscription_plan TEXT DEFAULT 'basic' NOT NULL,
    has_website_addon BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create menu items table
CREATE TABLE public.menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurant_profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    ingredients TEXT[],
    category TEXT NOT NULL,
    calories INTEGER,
    tags TEXT[],
    available BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create restaurant_visits table
CREATE TABLE public.restaurant_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurant_profiles(id) ON DELETE CASCADE NOT NULL,
    visitor_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create qr_scans table
CREATE TABLE public.qr_scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurant_profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurant_profiles(id) ON DELETE CASCADE NOT NULL,
    order_total NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create locked_feature_attempts table for upsell tracking
CREATE TABLE public.locked_feature_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurant_profiles(id) ON DELETE CASCADE NOT NULL,
    plan TEXT NOT NULL,
    feature TEXT NOT NULL,
    page TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.restaurant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locked_feature_attempts ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- Policies for restaurant_profiles
-- ----------------------------------------------------
CREATE POLICY "Users can read only their own restaurant" ON public.restaurant_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can view completed restaurant profiles" ON public.restaurant_profiles
    FOR SELECT USING (setup_completed = true);

CREATE POLICY "Users can insert only their own restaurant" ON public.restaurant_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update only their own restaurant" ON public.restaurant_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- ----------------------------------------------------
-- Policies for menu_items
-- ----------------------------------------------------
CREATE POLICY "Public can view menu items" ON public.menu_items
    FOR SELECT USING (true);

CREATE POLICY "Owners can manage menu items" ON public.menu_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.restaurant_profiles
            WHERE restaurant_profiles.id = menu_items.restaurant_id
            AND restaurant_profiles.user_id = auth.uid()
        )
    );

-- ----------------------------------------------------
-- Policies for restaurant_visits
-- ----------------------------------------------------
CREATE POLICY "Public can track visits" ON public.restaurant_visits
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can view visits" ON public.restaurant_visits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.restaurant_profiles
            WHERE restaurant_profiles.id = restaurant_visits.restaurant_id
            AND restaurant_profiles.user_id = auth.uid()
        )
    );

-- ----------------------------------------------------
-- Policies for qr_scans
-- ----------------------------------------------------
CREATE POLICY "Public can track scans" ON public.qr_scans
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can view scans" ON public.qr_scans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.restaurant_profiles
            WHERE restaurant_profiles.id = qr_scans.restaurant_id
            AND restaurant_profiles.user_id = auth.uid()
        )
    );

-- ----------------------------------------------------
-- Policies for orders
-- ----------------------------------------------------
CREATE POLICY "Public can track orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can view orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.restaurant_profiles
            WHERE restaurant_profiles.id = orders.restaurant_id
            AND restaurant_profiles.user_id = auth.uid()
        )
    );

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

-- ----------------------------------------------------
-- Storage Buckets Configuration
-- ----------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES ('menu-images', 'menu-images', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public can view images" ON storage.objects
    FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');
    
CREATE POLICY "Authenticated users can update images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete images" ON storage.objects
    FOR DELETE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

-- ----------------------------------------------------
-- Supabase Realtime Subscriptions Configuration
-- ----------------------------------------------------
alter publication supabase_realtime add table public.restaurant_visits;
alter publication supabase_realtime add table public.qr_scans;
alter publication supabase_realtime add table public.orders;
