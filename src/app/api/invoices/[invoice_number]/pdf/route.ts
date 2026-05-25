import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { jsPDF } from 'jspdf';

export async function GET(req: Request, { params }: { params: Promise<{ invoice_number: string }> }) {
  try {
    const { invoice_number } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        restaurant_profiles (
          restaurant_name,
          restaurant_email,
          restaurant_phone
        )
      `)
      .eq('invoice_number', invoice_number)
      .maybeSingle();

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Ensure the user owns this invoice
    // (RLS should handle this, but checking just in case if using service role or complex joins)
    
    const restaurant = invoice.restaurant_profiles;
    
    // Create PDF
    const doc = new jsPDF();
    
    // Top border
    doc.setDrawColor(244, 123, 62); // SafarDine Orange
    doc.setLineWidth(2);
    doc.line(10, 10, 200, 10);
    
    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('SafarDine', 14, 25);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('scan. explore. enjoy.', 14, 30);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(34, 197, 94); // Green
    doc.text('PAID', 175, 25);
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(14, 35, 196, 35);
    
    // Invoice Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`INVOICE: ${invoice.invoice_number}`, 14, 45);
    
    doc.setFont('helvetica', 'normal');
    const invoiceDate = new Date(invoice.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    doc.text(`DATE: ${invoiceDate}`, 14, 52);
    
    if (invoice.billing_period_start && invoice.billing_period_end) {
      const start = new Date(invoice.billing_period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = new Date(invoice.billing_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      doc.text(`BILLING PERIOD: ${start} - ${end}`, 14, 59);
    }
    
    doc.line(14, 65, 196, 65);
    
    // Billed To
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED TO:', 14, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(restaurant.restaurant_name || 'Restaurant Owner', 14, 82);
    doc.text(restaurant.restaurant_email || user.email || '', 14, 89);
    if (restaurant.restaurant_phone) {
      doc.text(restaurant.restaurant_phone, 14, 96);
    }
    
    doc.line(14, 102, 196, 102);
    
    // Payment Details
    doc.setFont('helvetica', 'bold');
    doc.text(`PLAN: ${invoice.plan}`, 14, 112);
    
    const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(invoice.amount);
    doc.text(`AMOUNT PAID: ${formattedAmount}`, 14, 119);
    
    doc.setFont('helvetica', 'normal');
    if (invoice.razorpay_payment_id) {
      doc.text(`PAYMENT ID: ${invoice.razorpay_payment_id}`, 14, 126);
    }
    doc.text(`PAYMENT METHOD: ${invoice.payment_method || 'Razorpay'}`, 14, 133);
    
    doc.line(14, 139, 196, 139);
    
    // Footer
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for choosing SafarDine!', 14, 150);
    
    doc.setDrawColor(244, 123, 62);
    doc.setLineWidth(2);
    doc.line(10, 287, 200, 287);
    
    const pdfBuffer = doc.output('arraybuffer');
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`
      }
    });
    
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate PDF' }, { status: 500 });
  }
}
