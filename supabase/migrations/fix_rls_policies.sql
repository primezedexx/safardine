-- ========================================================================================
-- RLS SECURITY FIXES
-- ========================================================================================

-- 🔒 FIX 1 — restaurant_profiles: Add DELETE policy
CREATE POLICY "Owner can delete own profile"
ON public.restaurant_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- 🔒 FIX 2 — orders INSERT: Restrict fake orders
DROP POLICY IF EXISTS "Public can track orders" ON public.orders;

CREATE POLICY "Anyone can place order for valid restaurant"
ON public.orders
FOR INSERT
WITH CHECK (
  restaurant_id IN (
    SELECT id FROM public.restaurant_profiles WHERE setup_completed = true
  )
);

-- 🔒 FIX 3 — orders UPDATE/DELETE: Add owner policies
CREATE POLICY "Owner can update own orders"
ON public.orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_profiles
    WHERE restaurant_profiles.id = orders.restaurant_id
    AND restaurant_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Owner can delete own orders"
ON public.orders
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_profiles
    WHERE restaurant_profiles.id = orders.restaurant_id
    AND restaurant_profiles.user_id = auth.uid()
  )
);

-- 🔒 FIX 4 — restaurant_visits INSERT: Restrict spoofing
DROP POLICY IF EXISTS "Public can track visits" ON public.restaurant_visits;

CREATE POLICY "Anyone can insert visit for valid restaurant"
ON public.restaurant_visits
FOR INSERT
WITH CHECK (
  restaurant_id IN (
    SELECT id FROM public.restaurant_profiles WHERE setup_completed = true
  )
);

-- 🔒 FIX 5 — reviews INSERT: Restrict fake reviews
DROP POLICY IF EXISTS "reviews_insert" ON public.reviews;

CREATE POLICY "Anyone can insert review for valid restaurant"
ON public.reviews
FOR INSERT
WITH CHECK (
  restaurant_id IN (
    SELECT id FROM public.restaurant_profiles WHERE setup_completed = true
  )
);

-- 🔒 FIX 6 — invoices UPDATE/DELETE: Add owner policies
CREATE POLICY "Owner can update own invoices"
ON public.invoices
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_profiles
    WHERE restaurant_profiles.id = invoices.restaurant_id
    AND restaurant_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Owner can delete own invoices"
ON public.invoices
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_profiles
    WHERE restaurant_profiles.id = invoices.restaurant_id
    AND restaurant_profiles.user_id = auth.uid()
  )
);
