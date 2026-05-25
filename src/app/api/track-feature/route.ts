import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { restaurantId, plan, feature, page } = body

    if (!restaurantId || !plan || !feature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Insert into locked_feature_attempts
    const { error } = await supabase
      .from('locked_feature_attempts')
      .insert({
        restaurant_id: restaurantId,
        plan: plan,
        feature: feature,
        page: page || 'unknown',
      })

    if (error) {
      console.error('Error tracking locked feature attempt:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in track-feature endpoint:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
