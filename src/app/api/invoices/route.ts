import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the restaurant ID for the user
    const { data: restaurant } = await supabase
      .from('restaurant_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!restaurant) {
      return NextResponse.json({ invoices: [] });
    }

    // Fetch invoices
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Format for frontend
    const formattedInvoices = invoices.map(inv => {
      const dateStr = new Date(inv.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      return {
        id: inv.id,
        invoice_number: inv.invoice_number,
        date: dateStr,
        plan: inv.plan,
        amount: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(inv.amount),
        status: inv.status,
        download_url: `/api/invoices/${inv.invoice_number}/pdf`
      };
    });

    return NextResponse.json({ invoices: formattedInvoices });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch invoices' }, { status: 500 });
  }
}
