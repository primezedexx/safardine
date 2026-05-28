import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { restaurantId, type, data } = await req.json();
    const supabase = await createClient();

    // Fetch notification preferences from restaurant_profiles
    const { data: profile } = await supabase
      .from('restaurant_profiles')
      .select('social_links')
      .eq('id', restaurantId)
      .maybeSingle();
    
    const notifSettings = profile?.social_links?._notifications || {};
    const orderAlertsEnabled = notifSettings.orderAlerts !== false; // default true
    const scanAlertsEnabled = notifSettings.scanAlerts === true; // default false

    if (type === 'scan') {
      const { error } = await supabase.from('qr_scans').insert({
        restaurant_id: restaurantId
      });
      if (error) console.error("Error inserting scan tracking:", error);

      // Insert a scan notification if the setting is enabled
      if (scanAlertsEnabled) {
        const { error: notifError } = await supabase.from('notifications').insert({
          restaurant_id: restaurantId,
          title: `Menu Scanned`,
          description: `A customer just scanned the QR menu.`,
          type: 'scan',
          is_read: false
        });
        if (notifError) console.error("Error inserting scan notification:", notifError);
      }
    } else if (type === 'visit') {
      const { error } = await supabase.from('restaurant_visits').insert({
        restaurant_id: restaurantId,
        visitor_id: data?.visitorId
      });
      if (error) console.error("Error inserting visit tracking:", error);
    } else if (type === 'order') {
      const { error } = await supabase.from('orders').insert({
        restaurant_id: restaurantId,
        order_total: Number(data?.orderTotal || 0)
      });
      if (error) console.error("Error inserting order tracking:", error);

      // Only insert order notification if the setting is enabled
      if (orderAlertsEnabled && data?.tableNumber && data?.itemName) {
        let desc = `Order received for ${data.itemName} from Table ${data.tableNumber}.`;
        if (data.specialInstructions) {
          desc += `\nSpecial Instructions: ${data.specialInstructions}`;
        }

        const { error: notifError } = await supabase.from('notifications').insert({
          restaurant_id: restaurantId,
          title: `New Order (Table ${data.tableNumber})`,
          description: desc,
          type: 'order',
          is_read: false
        });
        if (notifError) console.error("Error inserting order notification:", notifError);

        // OneSignal push notification completely disabled per user request
      }
    } else if (type === 'review') {
      // Store the review in the reviews table
      const { error: reviewError } = await supabase.from('reviews').insert({
        restaurant_id: restaurantId,
        rating: data?.rating || 5,
        comment: data?.comment || ''
      });
      if (reviewError) console.error("Error inserting review:", reviewError);

      const { error: notifError } = await supabase.from('notifications').insert({
        restaurant_id: restaurantId,
        title: `New Review Received (⭐ ${data?.rating}/5)`,
        description: data?.comment ? `"${data.comment}"` : `A customer rated their experience ${data?.rating} stars.`,
        type: 'system',
        is_read: false
      });
      if (notifError) console.error("Error inserting review notification:", notifError);
    } else {
      // Legacy analytics view/language tracking
      let { data: analytics } = await supabase
        .from('analytics')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .maybeSingle();

      if (!analytics) {
        const initialViews = type === 'view_item' ? { [data.itemId]: 1 } : {};
        const initialLangs = type === 'language' ? { [data.language]: 1 } : {};
        const { error: insertError } = await supabase
          .from('analytics')
          .insert({
            restaurant_id: restaurantId,
            item_views: initialViews,
            language_selected: initialLangs,
            total_scans: 0
          });
        if (insertError) console.error("Error creating initial analytics row in /api/track:", insertError);
      } else {
        let updates = {};
        if (type === 'view_item') {
          const currentViews = analytics.item_views as Record<string, number> || {};
          updates = {
            item_views: {
              ...currentViews,
              [data.itemId]: (currentViews[data.itemId] || 0) + 1
            }
          };
        } else if (type === 'language') {
          const currentLangs = analytics.language_selected as Record<string, number> || {};
          updates = {
            language_selected: {
              ...currentLangs,
              [data.language]: (currentLangs[data.language] || 0) + 1
            }
          };
        }

        if (Object.keys(updates).length > 0) {
          await supabase.from('analytics').update(updates).eq('id', analytics.id);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API tracking endpoint error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
