-- ========================================================================================
-- PHASE 2 SECURITY HARDENING SCRIPT
-- Run this in your Supabase Dashboard -> SQL Editor
-- ========================================================================================

-- 1. Restrict default access to the public schema
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- 2. Restrict access to Postgres system tables
-- This prevents attackers from enumerating database schema internals via the API.
REVOKE ALL ON ALL TABLES IN SCHEMA pg_catalog FROM PUBLIC;

-- 3. Ensure RLS is strictly enforced
ALTER TABLE public.restaurant_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_visits FORCE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans FORCE ROW LEVEL SECURITY;
ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;
ALTER TABLE public.locked_feature_attempts FORCE ROW LEVEL SECURITY;

-- 4. Secure the Storage schema
ALTER TABLE storage.objects FORCE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets FORCE ROW LEVEL SECURITY;

-- 5. Disable executing custom functions from public by default
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
