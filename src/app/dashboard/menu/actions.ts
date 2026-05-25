'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getPlanLimits } from '@/lib/features'

export async function createMenuItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // Fetch restaurant profile details
  const { data: restaurant } = await supabase
    .from('restaurant_profiles')
    .select('id, subscription_plan')
    .eq('user_id', user.id)
    .maybeSingle()

  const restaurantId = restaurant?.id
  if (!restaurantId) throw new Error('No restaurant profile setup found')

  const userPlan = restaurant.subscription_plan || 'basic'
  const limits = getPlanLimits(userPlan)

  // Enforce Max Menu Items Limit
  const { count: itemsCount } = await supabase
    .from('menu_items')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurantId)

  if (itemsCount !== null && itemsCount >= limits.maxMenuItems) {
    throw new Error(`Plan limit reached: You can only have up to ${limits.maxMenuItems} menu items on the ${userPlan} plan.`)
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const category = formData.get('category') as string
  const image_url = formData.get('image_url') as string
  const calories = parseInt(formData.get('calories') as string) || null
  const available = formData.get('available') !== 'false'
  
  const tagsStr = formData.get('tags') as string
  const ingredientsStr = formData.get('ingredients') as string
  
  const tags = tagsStr ? tagsStr.split(',').map(s => s.trim()) : []
  const ingredients = ingredientsStr ? ingredientsStr.split(',').map(s => s.trim()) : []

  const { error } = await supabase.from('menu_items').insert({
    restaurant_id: restaurantId,
    name,
    description,
    price,
    category,
    image_url: image_url || null,
    calories,
    tags,
    ingredients,
    available
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/menu')
}

export async function updateMenuItem(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const category = formData.get('category') as string
  const image_url = formData.get('image_url') as string
  const calories = parseInt(formData.get('calories') as string) || null
  const available = formData.get('available') !== 'false'
  
  const tagsStr = formData.get('tags') as string
  const ingredientsStr = formData.get('ingredients') as string
  
  const tags = tagsStr ? tagsStr.split(',').map(s => s.trim()) : []
  const ingredients = ingredientsStr ? ingredientsStr.split(',').map(s => s.trim()) : []

  const { error } = await supabase.from('menu_items').update({
    name,
    description,
    price,
    category,
    image_url: image_url || null,
    calories,
    tags,
    ingredients,
    available
  }).eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/menu')
}

export async function deleteMenuItem(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('menu_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/menu')
}

export async function bulkCreateMenuItems(items: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // Fetch restaurant profile details
  const { data: restaurant } = await supabase
    .from('restaurant_profiles')
    .select('id, subscription_plan')
    .eq('user_id', user.id)
    .maybeSingle()

  const restaurantId = restaurant?.id
  if (!restaurantId) throw new Error('No restaurant profile setup found')

  const userPlan = restaurant.subscription_plan || 'basic'
  const limits = getPlanLimits(userPlan)

  // Enforce Max Menu Items Limit
  const { count: itemsCount } = await supabase
    .from('menu_items')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurantId)

  if (itemsCount !== null && itemsCount + items.length > limits.maxMenuItems) {
    throw new Error(`Plan limit reached: Adding these items would exceed your limit of ${limits.maxMenuItems} menu items on the ${userPlan} plan.`)
  }

  const rows = items.map(item => ({
    restaurant_id: restaurantId,
    name: item.name,
    description: item.description || null,
    price: parseFloat(item.price) || 0,
    category: item.category || 'Others',
    image_url: item.image_url || null,
    calories: item.calories ? parseInt(item.calories) : null,
    tags: item.tags ? (typeof item.tags === 'string' ? item.tags.split(',').map((s:string) => s.trim()) : item.tags) : [],
    ingredients: item.ingredients ? (typeof item.ingredients === 'string' ? item.ingredients.split(',').map((s:string) => s.trim()) : item.ingredients) : [],
    available: item.available !== false,
  }))

  const { error } = await supabase.from('menu_items').insert(rows)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/menu')
}

export async function updateItemOrders(orders: { id: string, sort_order: number }[]) {
  const supabase = await createClient()
  
  // Note: this requires a sort_order column in Supabase menu_items table.
  // Supabase doesn't support bulk updates easily via JS API, so we map them.
  for (const item of orders) {
    const { error } = await supabase.from('menu_items').update({ sort_order: item.sort_order }).eq('id', item.id)
    if (error) console.error(`Failed to update order for ${item.id}`, error)
  }
  
  revalidatePath('/dashboard/menu')
}
