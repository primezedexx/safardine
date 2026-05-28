-- ========================================================================================
-- ENABLE RLS ON NOTIFICATIONS TABLE
-- Run this in your Supabase Dashboard -> SQL Editor
-- This resolves the "Table publicly accessible" (rls_disabled_in_public) critical issue.
-- ========================================================================================

-- Enable and force RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications FORCE ROW LEVEL SECURITY;

-- 1. Allow anyone (including anonymous guests making orders) to insert notifications
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Public can insert notifications') THEN
    CREATE POLICY "Public can insert notifications" ON public.notifications
        FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 2. Allow owners to view their own notifications
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Owners can view notifications') THEN
    CREATE POLICY "Owners can view notifications" ON public.notifications
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.restaurant_profiles
                WHERE restaurant_profiles.id = notifications.restaurant_id
                AND restaurant_profiles.user_id = auth.uid()
            )
        );
  END IF;
END $$;

-- 3. Allow owners to update (e.g. mark as read) their own notifications
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Owners can update notifications') THEN
    CREATE POLICY "Owners can update notifications" ON public.notifications
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM public.restaurant_profiles
                WHERE restaurant_profiles.id = notifications.restaurant_id
                AND restaurant_profiles.user_id = auth.uid()
            )
        );
  END IF;
END $$;

-- 4. Allow owners to delete their own notifications (e.g. clearing non-order notifications)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Owners can delete notifications') THEN
    CREATE POLICY "Owners can delete notifications" ON public.notifications
        FOR DELETE USING (
            EXISTS (
                SELECT 1 FROM public.restaurant_profiles
                WHERE restaurant_profiles.id = notifications.restaurant_id
                AND restaurant_profiles.user_id = auth.uid()
            )
        );
  END IF;
END $$;
-- ========================================================================================
-- CATCH-ALL: ENFORCE RLS ON ANY REMAINING PUBLIC TABLES
-- This ensures that NO table in the public schema is left publicly accessible by default.
-- Note: This defaults to DENY ALL until specific policies are added for those tables.
-- ========================================================================================
DO $$
DECLARE
    t_name text;
BEGIN
    FOR t_name IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false) LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t_name);
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY;', t_name);
    END LOOP;
END $$;
