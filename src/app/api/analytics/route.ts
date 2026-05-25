import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { restaurantId, lang } = await req.json()
    const supabase = await createClient()

    // We do an RPC or just read/update. 
    // Since we don't have an RPC function for atomic jsonb increment, we'll do a simple select/update.
    // In production, an RPC or Edge Function is better to avoid race conditions.

    let { data: analytics } = await supabase
      .from('analytics')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .maybeSingle()

    if (!analytics) {
      // Create new analytics record for the restaurant
      const languageSelected = { [lang]: 1 }
      const { error: insertError } = await supabase
        .from('analytics')
        .insert({
          restaurant_id: restaurantId,
          total_scans: 1,
          language_selected: languageSelected,
          item_views: {}
        })
      if (insertError) {
        console.error("Error creating initial analytics row in /api/analytics:", insertError);
      }
    } else {
      const languageSelected = analytics.language_selected as Record<string, number> || {}
      languageSelected[lang] = (languageSelected[lang] || 0) + 1

      await supabase
        .from('analytics')
        .update({
          total_scans: (analytics.total_scans || 0) + 1,
          language_selected: languageSelected,
          updated_at: new Date().toISOString()
        })
        .eq('id', analytics.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to track analytics' }, { status: 500 })
  }
}
