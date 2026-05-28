'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Store, Globe, ArrowRight, ArrowLeft, Upload, 
  MapPin, Phone, Mail, DollarSign, Image as ImageIcon, CheckCircle, AlertCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadRestaurantImage, signout, completeSetupCacheInvalidation } from '@/app/(auth)/actions'

const categories = [
  'Fine Dining',
  'Casual Dining',
  'Cafe & Bistro',
  'Fast Food',
  'Pizzeria',
  'Bakery & Dessert',
  'Bar & Lounge',
  'Food Truck',
  'Other'
]

const currencies = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (INR)' },
  { code: 'USD', symbol: '$', label: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', label: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (GBP)' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen (JPY)' }
]

export default function RestaurantSetup() {
  const router = useRouter()
  const supabase = createClient()

  // Form States
  const [restaurantName, setRestaurantName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Fine Dining')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [slug, setSlug] = useState('')

  // Upload States
  const [logoUrl, setLogoUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [isLogoUploading, setIsLogoUploading] = useState(false)
  const [isCoverUploading, setIsCoverUploading] = useState(false)

  // Page States
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [domain, setDomain] = useState('safardine.com')

  // Auto-generate slug and set domain on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(window.location.host)
    }
  }, [])

  const handleNameChange = (val: string) => {
    setRestaurantName(val)
    // Convert name to clean URL slug
    const cleanSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // remove special characters
      .replace(/[\s_-]+/g, '-') // replace spaces/underscores with hyphen
      .replace(/^-+|-+$/g, '')  // trim leading/trailing hyphens
    setSlug(cleanSlug)
  }

  // Handle Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsLogoUploading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      const url = await uploadRestaurantImage(formData)
      if (url) {
        setLogoUrl(url)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo.')
    } finally {
      setIsLogoUploading(false)
    }
  }

  // Handle Cover Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsCoverUploading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      const url = await uploadRestaurantImage(formData)
      if (url) {
        setCoverUrl(url)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload cover image.')
    } finally {
      setIsCoverUploading(false)
    }
  }

  // Submit Form Action
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    if (!restaurantName || !description || !category || !address || !phone || !email || !currency || !slug) {
      setError('Please fill in all required fields.')
      setIsSaving(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Not authenticated. Please log in again.')
      }

      // Check if slug is already taken by another restaurant
      const { data: slugCheck } = await supabase
        .from('restaurant_profiles')
        .select('id')
        .eq('restaurant_slug', slug)
        .neq('user_id', user.id)
        .maybeSingle()

      if (slugCheck) {
        setError('This URL slug is already taken. Please try a different restaurant name or slug.')
        setIsSaving(false)
        return
      }

      // Upsert restaurant profile
      const { data: existingProfile } = await supabase
        .from('restaurant_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      const profileData = {
        user_id: user.id,
        restaurant_name: restaurantName,
        restaurant_slug: slug,
        restaurant_description: description,
        restaurant_category: category,
        restaurant_address: address,
        restaurant_phone: phone,
        restaurant_email: email,
        restaurant_logo: logoUrl || null,
        restaurant_cover: coverUrl || null,
        currency,
        setup_completed: true,
        updated_at: new Date().toISOString()
      }

      let saveError
      if (existingProfile) {
        const { error } = await supabase
          .from('restaurant_profiles')
          .update(profileData)
          .eq('id', existingProfile.id)
        saveError = error
      } else {
        const { error } = await supabase
          .from('restaurant_profiles')
          .insert(profileData)
        saveError = error
      }

      if (saveError) throw saveError

      setSuccess(true)
      
      // Invalidate the layout cache so dashboard fetches the new restaurant profile
      try {
        await completeSetupCacheInvalidation()
      } catch (cacheErr) {
        console.error('Failed to invalidate cache:', cacheErr)
      }

      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)

    } catch (err: any) {
      console.error('Error saving restaurant setup:', err)
      setError(err.message || 'Failed to save setup details. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = async () => {
    await signout()
  }

  const handleSkip = () => {
    if (typeof document !== 'undefined') {
      document.cookie = "safardine_skip_onboarding=true; path=/; max-age=" + 30 * 24 * 60 * 60;
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden select-none font-sans">
      
      {/* Glow Backdrops */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[90vw] max-w-[800px] h-[550px] bg-gradient-to-tr from-orange-200/40 to-amber-100/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] max-w-[500px] h-[50vw] max-h-[500px] bg-orange-100/20 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-2xl z-10 space-y-6">
        
        {/* Onboarding Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Setup your Safar Dine Platform</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 justify-center">
              <span>Step 1 of 1</span> • <span className="text-orange-500">Restaurant Setup</span>
            </p>
          </div>
        </div>

        {/* Success Splash */}
        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-emerald-100 rounded-3xl p-8 flex flex-col items-center text-center space-y-4 shadow-xl shadow-slate-100/50"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full flex items-center justify-center animate-bounce shadow-sm">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900">Setup Saved Successfully!</h3>
                <p className="text-sm font-semibold text-slate-400">Preparing your interactive AI dashboard...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!success && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100/40 relative overflow-hidden"
          >
            <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-start gap-2.5 leading-normal text-left">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Section 1: Basic Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">1. Restaurant Basics</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block" htmlFor="name">
                      Restaurant Name *
                    </label>
                    <input 
                      id="name" 
                      type="text" 
                      placeholder="e.g. Pizza Hub"
                      required
                      value={restaurantName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-3.5 py-3 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl outline-none text-sm text-slate-800 placeholder-slate-300 font-bold transition-all shadow-sm" 
                    />
                  </div>

                  {/* Category Dropdown */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block" htmlFor="category">
                      Cuisine / Category *
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-3 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl outline-none text-sm text-slate-800 font-bold transition-all shadow-sm bg-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Slug generator widget */}
                {slug && (
                  <div className="p-3.5 bg-orange-50/50 border border-orange-100 rounded-2xl flex items-start gap-3 select-none">
                    <Globe className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest block">Diner Link Generated</span>
                      <p className="text-xs text-slate-600 font-bold mt-1 break-all">
                        {domain}/menu/<span className="text-orange-600 underline">{slug}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Description Field */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block" htmlFor="desc">
                    Restaurant Description *
                  </label>
                  <textarea 
                    id="desc" 
                    placeholder="Provide a stunning short description about your chef specials, ambience, or history..."
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-3 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl outline-none text-sm text-slate-800 placeholder-slate-300 font-bold transition-all shadow-sm" 
                  />
                </div>
              </div>

              {/* Section 2: Contact and Settings */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">2. Contact & Preferences</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block" htmlFor="phone">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        id="phone" 
                        type="tel" 
                        placeholder="+1 (555) 000-0000"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-3 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl outline-none text-sm text-slate-800 placeholder-slate-300 font-bold transition-all shadow-sm" 
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block" htmlFor="email">
                      Contact Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        id="email" 
                        type="email" 
                        placeholder="contact@restaurant.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-3 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl outline-none text-sm text-slate-800 placeholder-slate-300 font-bold transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Currency selector */}
                  <div className="space-y-1.5 text-left sm:col-span-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block" htmlFor="currency">
                      Currency *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select 
                        id="currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-3 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl outline-none text-sm text-slate-800 font-bold transition-all shadow-sm bg-white"
                      >
                        {currencies.map((curr) => (
                          <option key={curr.code} value={curr.code}>
                            {curr.symbol} - {curr.code}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Address Field */}
                  <div className="space-y-1.5 text-left sm:col-span-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block" htmlFor="address">
                      Restaurant Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        id="address" 
                        type="text" 
                        placeholder="e.g. 123 Main St, New York, NY"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-3 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl outline-none text-sm text-slate-800 placeholder-slate-300 font-bold transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Branding & Image uploads */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">3. Visual Branding</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Logo Upload Card */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Restaurant Logo</span>
                    <div className="border-2 border-dashed border-slate-200 hover:border-orange-500/50 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 transition-colors relative min-h-[140px] text-center">
                      {logoUrl ? (
                        <div className="relative flex flex-col items-center space-y-2">
                          <img src={logoUrl} alt="Logo preview" className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                          <button 
                            type="button" 
                            onClick={() => setLogoUrl('')} 
                            className="text-[10px] text-red-500 font-extrabold hover:underline"
                          >
                            Remove Logo
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center space-y-2 w-full h-full justify-center">
                          {isLogoUploading ? (
                            <div className="flex flex-col items-center space-y-2">
                              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                              <span className="text-[11px] font-bold text-slate-400">Uploading to Storage...</span>
                            </div>
                          ) : (
                            <>
                              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shadow-sm shrink-0">
                                <Store className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-700 block">Select Logo Image</span>
                                <span className="text-[9.5px] text-slate-400 font-medium">PNG or JPG, square size preferred</span>
                              </div>
                            </>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleLogoUpload}
                            disabled={isLogoUploading}
                            className="hidden" 
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Cover Upload Card */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Cover Image</span>
                    <div className="border-2 border-dashed border-slate-200 hover:border-orange-500/50 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 transition-colors relative min-h-[140px] text-center">
                      {coverUrl ? (
                        <div className="relative w-full flex flex-col items-center space-y-2">
                          <img src={coverUrl} alt="Cover preview" className="w-full h-14 rounded-xl object-cover border border-slate-200 shadow-sm" />
                          <button 
                            type="button" 
                            onClick={() => setCoverUrl('')} 
                            className="text-[10px] text-red-500 font-extrabold hover:underline"
                          >
                            Remove Cover
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center space-y-2 w-full h-full justify-center">
                          {isCoverUploading ? (
                            <div className="flex flex-col items-center space-y-2">
                              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                              <span className="text-[11px] font-bold text-slate-400">Uploading to Storage...</span>
                            </div>
                          ) : (
                            <>
                              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shadow-sm shrink-0">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-700 block">Select Cover Image</span>
                                <span className="text-[9.5px] text-slate-400 font-medium">PNG or JPG, panoramic size preferred</span>
                              </div>
                            </>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleCoverUpload}
                            disabled={isCoverUploading}
                            className="hidden" 
                          />
                        </label>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 gap-4 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-3 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl text-sm font-extrabold transition-colors cursor-pointer flex items-center gap-1.5 order-2 sm:order-1 w-full sm:w-auto justify-center"
                >
                  <ArrowLeft className="w-4 h-4" /> Cancel & Log out
                </button>
                
                <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-extrabold transition-all cursor-pointer w-full sm:w-auto text-center active:scale-[0.98]"
                  >
                    Set Up Later
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSaving || isLogoUploading || isCoverUploading}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] shadow-md shadow-orange-500/10 w-full sm:w-auto"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Setup</span>
                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </motion.div>
        )}

      </div>
    </div>
  )
}
