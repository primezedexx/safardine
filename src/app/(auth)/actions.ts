'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error("Login error detail:", error)
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // Get current user and check profile status
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    redirect('/login?error=Authentication failed')
  }

  const { data: profile } = await supabase
    .from('restaurant_profiles')
    .select('setup_completed')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  revalidatePath('/', 'layout')

  if (profile && profile.setup_completed) {
    redirect('/dashboard')
  } else {
    redirect('/restaurant-setup')
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error("Signup error detail:", error)
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  const { data: userData } = await supabase.auth.getUser()
  if (userData.user) {
    // Create incomplete profile
    await supabase.from('restaurant_profiles').insert({
      user_id: userData.user.id,
      restaurant_name: formData.get('restaurantName') as string || 'My Restaurant',
      setup_completed: false
    })
  }

  revalidatePath('/', 'layout')
  redirect('/restaurant-setup')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function uploadRestaurantImage(formData: FormData) {
  const supabase = await createClient()
  const image = formData.get('file') as File
  if (!image || image.size === 0) return null

  // 1. Restrict file sizes to maximum 5MB
  const maxSizeBytes = 5 * 1024 * 1024
  if (image.size > maxSizeBytes) {
    throw new Error('File size exceeds the 5MB enterprise-grade upload limit.')
  }

  // 2. Restrict MIME types and file extensions to prevent malicious executable execution
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']
  
  if (!allowedMimeTypes.includes(image.type)) {
    throw new Error('Unsupported file type. Only JPG, PNG, WEBP, GIF, and SVG images are allowed.')
  }

  const fileExt = image.name.split('.').pop()?.toLowerCase() || ''
  if (!allowedExtensions.includes(fileExt)) {
    throw new Error('Invalid file extension. Only JPG, PNG, WEBP, GIF, and SVG are allowed.')
  }

  // 3. Read array buffer and validate magic-byte signatures
  const fileBuffer = Buffer.from(await image.arrayBuffer())
  if (fileBuffer.length < 4) {
    throw new Error('Malformed file payload detected.')
  }

  const hexSignature = fileBuffer.toString('hex', 0, 4).toUpperCase()
  let isValidSignature = false

  if (fileExt === 'jpg' || fileExt === 'jpeg') {
    // JPEG signature: FF D8 FF
    isValidSignature = hexSignature.startsWith('FFD8FF')
  } else if (fileExt === 'png') {
    // PNG signature: 89 50 4E 47
    isValidSignature = hexSignature === '89504E47'
  } else if (fileExt === 'gif') {
    // GIF signature: 47 49 46 38 ('GIF8')
    isValidSignature = hexSignature === '47494638'
  } else if (fileExt === 'webp') {
    // WEBP signature: RIFF (52 49 46 46) at start and WEBP (57 45 42 50) at index 8
    const riffSig = fileBuffer.toString('hex', 0, 4).toUpperCase()
    const webpSig = fileBuffer.toString('hex', 8, 12).toUpperCase()
    isValidSignature = riffSig === '52494646' && webpSig === '57454250'
  } else if (fileExt === 'svg') {
    // SVG: Check first 200 bytes for XML or SVG structure tags
    const previewString = fileBuffer.toString('utf8', 0, Math.min(fileBuffer.length, 200)).toLowerCase()
    isValidSignature = previewString.includes('<svg') || previewString.includes('<?xml')
  }

  if (!isValidSignature) {
    throw new Error('Disguised or malformed file payload detected. Magic bytes do not match.')
  }

  // 4. Rename files using high-entropy secure crypto randomUUID and save under authenticated folder
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    throw new Error('Unauthenticated upload attempt blocked.')
  }

  const { randomUUID } = await import('crypto')
  const fileName = `${randomUUID()}.${fileExt}`
  const securePath = `${userData.user.id}/${fileName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('menu-images')
    .upload(securePath, image, {
      contentType: image.type,
      cacheControl: '3600',
      upsert: false
    })
    
  if (uploadError) {
    console.error("Storage upload error:", uploadError)
    throw new Error(uploadError.message)
  }

  const { data: publicUrlData } = supabase.storage
    .from('menu-images')
    .getPublicUrl(uploadData.path)
  return publicUrlData.publicUrl
}
