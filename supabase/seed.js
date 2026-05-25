const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://efgizrrfrfarnpifnema.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZ2l6cnJmcmZhcm5waWZuZW1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk5OTEwNSwiZXhwIjoyMDk0NTc1MTA1fQ.W8M38RYfqcaOnfLIp4JjTGCxa24-NRaeTOCjOWlwRAg'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  console.log('Seeding beautiful initial menu items and restaurant profile...')

  // Get the first registered auth user to link as owner
  let ownerUserId;
  try {
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) throw listError
    
    if (users && users.length > 0) {
      ownerUserId = users[0].id
      console.log(`Found registered user to act as owner: ${users[0].email} (${ownerUserId})`)
    } else {
      console.log('⚠️ No auth users found. Please sign up a user in the UI first, then run this seed script to populate their data!')
      return
    }
  } catch (err) {
    console.error('Error fetching auth users:', err)
    return
  }

  // Create or retrieve the restaurant profile for this user
  let restaurantId;
  const { data: existingProfile, error: profileFetchError } = await supabase
    .from('restaurant_profiles')
    .select('id')
    .eq('user_id', ownerUserId)
    .maybeSingle()

  if (profileFetchError) {
    console.error('Error checking existing profile:', profileFetchError)
    return
  }

  if (existingProfile) {
    restaurantId = existingProfile.id
    console.log(`Found existing restaurant profile ID: ${restaurantId}`)
    
    // Update it to make sure it's fully populated and marked as complete
    await supabase.from('restaurant_profiles').update({
      restaurant_name: 'Prime Wagyu Bistro',
      restaurant_slug: 'prime-wagyu-bistro',
      restaurant_description: 'A luxurious culinary experience highlighting artisanal wagyu beef, organic ingredients, and modern gastronomy.',
      restaurant_category: 'Fine Dining',
      restaurant_address: '123 Luxury Avenue, Gastronomy District',
      restaurant_phone: '+1 (555) 019-2834',
      restaurant_email: 'info@wagyubistro.com',
      restaurant_logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=150&h=150&q=80',
      restaurant_cover: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&h=400&q=80',
      currency: 'USD',
      setup_completed: true,
      subscription_plan: 'basic'
    }).eq('id', restaurantId)
    console.log('Updated existing profile to complete state and Basic plan.')
  } else {
    console.log('Creating a brand new completed restaurant profile for owner...')
    const { data: newProfile, error: createError } = await supabase
      .from('restaurant_profiles')
      .insert({
        user_id: ownerUserId,
        restaurant_name: 'Prime Wagyu Bistro',
        restaurant_slug: 'prime-wagyu-bistro',
        restaurant_description: 'A luxurious culinary experience highlighting artisanal wagyu beef, organic ingredients, and modern gastronomy.',
        restaurant_category: 'Fine Dining',
        restaurant_address: '123 Luxury Avenue, Gastronomy District',
        restaurant_phone: '+1 (555) 019-2834',
        restaurant_email: 'info@wagyubistro.com',
        restaurant_logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=150&h=150&q=80',
        restaurant_cover: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&h=400&q=80',
        currency: 'USD',
        setup_completed: true,
        subscription_plan: 'basic'
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating restaurant profile:', createError)
      return
    }

    restaurantId = newProfile.id
    console.log(`Created new restaurant profile ID: ${restaurantId}`)
  }

  // Clear existing menu items for this restaurant
  await supabase.from('menu_items').delete().eq('restaurant_id', restaurantId)

  // Seed beautiful, rich menu items - exactly 30 to test Basic plan limits
  const baseItems = [
    {
      name: 'Truffle Wagyu Burger',
      description: 'A premium Wagyu beef patty layered with melted Swiss cheese, fresh wild arugula, and our signature white truffle aioli on a toasted brioche bun.',
      price: 18.99,
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      category: 'Main Course',
      tags: ['Popular', 'Chef Special'],
      calories: 850
    },
    {
      name: 'Crispy Calamari',
      description: 'Tender calamari rings lightly dusted in seasoned flour, fried to golden perfection, served with a zesty lemon-herb aioli and fresh lemon wedges.',
      price: 13.49,
      image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80',
      category: 'Starters',
      tags: ['Seafood', 'Spicy'],
      calories: 420
    },
    {
      name: 'Organic Matcha Latte',
      description: 'Premium ceremonial grade Japanese matcha whisked with steamed organic oat milk and a touch of raw agave nectar.',
      price: 6.50,
      image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
      category: 'Drinks',
      tags: ['Vegan', 'Gluten-Free'],
      calories: 140
    },
    {
      name: 'Decadent Chocolate Soufflé',
      description: 'Warm, airy chocolate soufflé with a molten dark chocolate center, dusted with powdered sugar and served with a scoop of fresh vanilla bean gelato.',
      price: 9.99,
      image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
      category: 'Desserts',
      tags: ['Popular', 'Sweet'],
      calories: 580
    }
  ]

  const items = []
  for (let i = 0; i < 30; i++) {
    const base = baseItems[i % baseItems.length]
    items.push({
      restaurant_id: restaurantId,
      name: `${base.name} (Variant ${i + 1})`,
      description: base.description,
      price: base.price + (i % 5),
      image_url: base.image_url,
      category: base.category,
      tags: base.tags,
      calories: base.calories + (i * 10),
      available: true
    })
  }

  const { error: insertError } = await supabase.from('menu_items').insert(items)

  if (insertError) {
    console.error('Error inserting menu items:', insertError)
  } else {
    console.log(`Successfully seeded ${items.length} premium menu items for testing the Basic Plan limits!`)
  }
}

seed()
