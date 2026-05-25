'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, CheckCircle2, AlertCircle, Upload, Phone, Mail, MapPin } from 'lucide-react'
import { uploadRestaurantImage } from '@/app/(auth)/actions'

export default function RestaurantForm({ restaurant }: { restaurant: any }) {
  const [name, setName] = useState(restaurant?.restaurant_name || '')
  const [description, setDescription] = useState(restaurant?.restaurant_description || '')
  const [logo, setLogo] = useState(restaurant?.restaurant_logo || '')
  const [cover, setCover] = useState(restaurant?.restaurant_cover || '')
  const [category, setCategory] = useState(restaurant?.restaurant_category || 'Fine Dining')
  const [slug, setSlug] = useState(restaurant?.restaurant_slug || '')
  const [phone, setPhone] = useState(restaurant?.restaurant_phone || '')
  const [email, setEmail] = useState(restaurant?.restaurant_email || '')
  const [address, setAddress] = useState(restaurant?.restaurant_address || '')

  const [loading, setLoading] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [status, setStatus] = useState<'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  // Dynamically format slug (lowercase, no spaces, hyphens only)
  const handleSlugChange = (val: string) => {
    const formatted = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setSlug(formatted)
  }

  // Handle Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setLogoUploading(true)
    setStatus(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await uploadRestaurantImage(formData)
      
      if (!res) throw new Error("Upload failed. No public URL received.")
      setLogo(res)
    } catch (err: any) {
      console.error("Logo upload error:", err)
      setStatus('error')
      setErrorMessage(err.message || "Failed to upload logo image.")
    } finally {
      setLogoUploading(false)
    }
  }

  // Handle Cover Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setCoverUploading(true)
    setStatus(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await uploadRestaurantImage(formData)
      
      if (!res) throw new Error("Upload failed. No public URL received.")
      setCover(res)
    } catch (err: any) {
      console.error("Cover upload error:", err)
      setStatus('error')
      setErrorMessage(err.message || "Failed to upload cover image.")
    } finally {
      setCoverUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    // Form verification for slug
    if (!slug) {
      setLoading(false)
      setStatus('error')
      setErrorMessage('Friendly URL slug is required.')
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('restaurant_profiles')
        .update({
          restaurant_name: name,
          restaurant_description: description,
          restaurant_logo: logo,
          restaurant_cover: cover,
          restaurant_category: category,
          restaurant_slug: slug,
          restaurant_phone: phone,
          restaurant_email: email,
          restaurant_address: address
        })
        .eq('id', restaurant.id)

      if (error) throw error

      setStatus('success')
      // Auto-hide success message after 3 seconds
      setTimeout(() => setStatus(null), 3000)
    } catch (err: any) {
      console.error('Error saving restaurant profile:', err)
      setStatus('error')
      setErrorMessage(err.message || 'Failed to update restaurant profile settings.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSave}>
      {status === 'success' && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-800 text-sm font-medium animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profile settings updated successfully! Diner pages will load these changes instantly.</span>
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-800 text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid of Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2" htmlFor="nameInput">Restaurant Name</label>
          <input 
            id="nameInput"
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Prime Wagyu Bistro"
            className="w-full px-4 py-3.5 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl outline-none text-sm text-slate-800 placeholder-slate-300 font-bold transition-all shadow-sm bg-white" 
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2" htmlFor="slugInput">Friendly URL Slug</label>
          <div className="relative">
            <input 
              id="slugInput"
              type="text" 
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
              placeholder="e.g. wagyu-bistro"
              className="w-full px-4 py-3.5 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl outline-none text-sm text-slate-800 placeholder-slate-300 font-bold transition-all shadow-sm bg-white" 
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-extrabold text-orange-500 bg-orange-50 border border-orange-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              /menu/{slug || 'slug'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2" htmlFor="categorySelect">Restaurant Category</label>
          <select 
            id="categorySelect"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3.5 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl outline-none text-sm text-slate-800 font-bold bg-white h-[48px] cursor-pointer" 
          >
            {['Fine Dining', 'Casual Bistro', 'Steakhouse', 'Italian Pizzeria', 'Sushi & Japanese', 'Café & Bakery', 'Fast Food'].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2" htmlFor="descInput">Description / Tagline</label>
          <textarea 
            id="descInput"
            rows={1}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Authentic Japanese Wagyu, custom dry-aged cuts, and premium sake."
            className="w-full px-4 py-3.5 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl outline-none text-sm text-slate-800 placeholder-slate-300 font-bold transition-all shadow-sm bg-white resize-none" 
          />
        </div>
      </div>

      {/* Visual Upload Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
        
        {/* Logo Visual upload */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase text-slate-400 tracking-wider">Restaurant Logo</label>
          <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl bg-slate-50">
            {logo ? (
              <img src={logo} alt="Logo preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200 bg-white shadow-sm shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-orange-100 text-orange-600 font-extrabold text-xl flex items-center justify-center border border-slate-200 shrink-0 select-none">
                {name?.charAt(0) || 'R'}
              </div>
            )}
            
            <div className="space-y-1.5 flex-1 text-left">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors shadow-sm select-none">
                {logoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-orange-500" />}
                {logo ? 'Change Logo Image' : 'Upload Logo'}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={logoUploading} />
              </label>
              <p className="text-[10px] text-slate-400 font-medium">Square format recommended. PNG or JPEG.</p>
            </div>
          </div>
        </div>

        {/* Cover Visual upload */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase text-slate-400 tracking-wider">Cover Banner</label>
          <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl bg-slate-50">
            {cover ? (
              <img src={cover} alt="Cover preview" className="w-20 h-16 rounded-xl object-cover border border-slate-200 bg-white shadow-sm shrink-0" />
            ) : (
              <div className="w-20 h-16 rounded-xl bg-slate-200 text-slate-400 font-bold text-[10px] flex items-center justify-center border border-slate-200 shrink-0 select-none">
                No Cover
              </div>
            )}
            
            <div className="space-y-1.5 flex-1 text-left">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors shadow-sm select-none">
                {coverUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-orange-500" />}
                {cover ? 'Change Cover Banner' : 'Upload Cover'}
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={coverUploading} />
              </label>
              <p className="text-[10px] text-slate-400 font-medium">Landscape banner format. PNG or JPEG.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Contact Details Section */}
      <div className="space-y-5 pt-4 border-t border-slate-100 text-left">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          Contact Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2" htmlFor="phoneInput">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                id="phoneInput"
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 text-slate-700 bg-white h-[44px] font-medium" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2" htmlFor="emailInput">Contact Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                id="emailInput"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. contact@bistro.com"
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 text-slate-700 bg-white h-[44px] font-medium" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2" htmlFor="addressInput">Restaurant Address</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              id="addressInput"
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Main Street, Mumbai, Maharashtra"
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 text-slate-700 bg-white h-[44px] font-medium" 
            />
          </div>
        </div>
      </div>

      {/* Form Submission Actions */}
      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button 
          type="submit" 
          disabled={loading || logoUploading || coverUploading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-xl font-bold text-sm transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-500/10 h-[44px] cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Profile Settings...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Profile Settings
            </>
          )}
        </button>
      </div>
    </form>
  )
}
