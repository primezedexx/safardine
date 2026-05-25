CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurant_profiles(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    plan VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(20) NOT NULL,
    payment_method VARCHAR(50),
    razorpay_payment_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    billing_period_start TIMESTAMPTZ,
    billing_period_end TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for owners
CREATE POLICY "Users can view their own invoices" ON public.invoices
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM public.restaurant_profiles WHERE user_id = auth.uid()
    )
  );

-- Only service role can insert/update invoices (which happens in the backend API)
-- We don't need a public insert policy because the server uses service_role key or acts on behalf of user if we allow it.
-- Let's add an insert policy just in case the server uses the anon key (though verify route usually uses service role).
-- Actually, /api/checkout/verify uses createClient() which uses the auth cookie if it's available. It's better to allow inserts for the authenticated user for their own restaurant.
CREATE POLICY "Users can insert their own invoices" ON public.invoices
  FOR INSERT WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurant_profiles WHERE user_id = auth.uid()
    )
  );
