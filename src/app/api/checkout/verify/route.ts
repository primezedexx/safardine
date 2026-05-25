import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, restaurant_id, plan_name, plan_amount, plan_duration_days } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Razorpay secret key is not configured' }, { status: 500 });
    }

    // Creating our own signature to verify with the one sent by Razorpay
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Payment is verified. Now explicitly capture it!
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: secret,
    });
    
    try {
      const order = await razorpay.orders.fetch(razorpay_order_id);
      await razorpay.payments.capture(razorpay_payment_id, order.amount, order.currency);
      console.log('Payment explicitly captured successfully.');
    } catch (captureError) {
      console.error('Error auto-capturing payment (it may be already captured):', captureError);
    }

    // Update the subscription status in Supabase.
    const supabase = await createClient();
    const { error } = await supabase
      .from('restaurant_profiles')
      .update({ subscription_active: true, subscription_plan: plan_name?.toLowerCase().includes('growth') ? 'growth' : plan_name?.toLowerCase().includes('pro') ? 'business_pro' : plan_name?.toLowerCase().includes('starter') ? 'starter' : 'basic' })
      .eq('id', restaurant_id);

    if (error) {
      console.error('Failed to update subscription status in DB:', error);
      return NextResponse.json({ error: 'Payment successful but failed to update subscription status' }, { status: 500 });
    }

    // Generate Invoice
    try {
      const currentYear = new Date().getFullYear();
      
      const { count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurant_id)
        .gte('created_at', `${currentYear}-01-01T00:00:00Z`);
        
      const sequence = (count || 0) + 1;
      const invoice_number = `INV-${currentYear}-${String(sequence).padStart(3, '0')}`;
      
      const duration = Number(plan_duration_days) || 30;
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);

      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          restaurant_id,
          invoice_number,
          plan: plan_name || 'Subscription Plan',
          amount: Number(plan_amount) || 0,
          currency: 'INR',
          status: 'paid',
          payment_method: 'Razorpay',
          razorpay_payment_id: razorpay_payment_id,
          billing_period_start: startDate.toISOString(),
          billing_period_end: endDate.toISOString()
        });

      if (invoiceError) {
        console.error('Failed to create invoice record:', invoiceError);
      }
    } catch (invErr) {
      console.error('Failed to process invoice:', invErr);
    }

    return NextResponse.json({ success: true, message: 'Payment verified successfully' });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
