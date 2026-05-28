import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  const { data: profile } = await supabase.from('restaurant_profiles').select('*').limit(1).single()
  console.log("Current Profile ID:", profile?.id)
  
  if (profile) {
    const currentLinks = profile.social_links || {}
    const newSettings = {
      ...currentLinks._notifications,
      orderAlerts: true
    }
    
    console.log("Updating to:", newSettings)
    
    const { error } = await supabase.from('restaurant_profiles').update({
      social_links: {
        ...currentLinks,
        _notifications: newSettings
      }
    }).eq('id', profile.id)
    
    if (error) {
      console.error("Update failed:", error)
    } else {
      console.log("Update success! orderAlerts is now TRUE")
    }
  }
}

run()
