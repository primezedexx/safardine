'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Utensils, Layers, FileText, Image as ImageIcon, 
  Sparkles, Flame, ChefHat, Tag, Eye, Heart, Upload, Loader2, X, ChevronDown, ChevronUp
} from 'lucide-react'
import { uploadRestaurantImage } from '@/app/(auth)/actions'

interface NewMenuFormClientProps {
  createMenuItem: (formData: FormData) => Promise<void>
  currency: string
  onClose: () => void
}

export default function NewMenuFormClient({ createMenuItem, currency, onClose }: NewMenuFormClientProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Main Course')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState('Active')
  const [availability, setAvailability] = useState('Available')
  const [foodType, setFoodType] = useState('Veg') // Veg, Non-Veg, Vegan
  
  // Advanced settings (collapsible)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [ingredients, setIngredients] = useState('')
  const [tags, setTags] = useState('')
  const [calories, setCalories] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      const url = await uploadRestaurantImage(uploadFormData)
      if (url) {
        setImageUrl(url)
        setUploadedImageUrl(url)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const currencySymbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('price', price)
      formData.append('category', category)
      formData.append('description', description)
      formData.append('image_url', imageUrl)
      
      // Map status and availability to boolean
      // If either is Inactive or Unavailable, we set available to false
      const isAvailable = status === 'Active' && availability === 'Available'
      formData.append('available', isAvailable ? 'true' : 'false')

      // Consolidate custom tags + Food Type tag
      let tagsList = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
      tagsList = tagsList.filter(t => t !== 'Veg' && t !== 'Non-Veg' && t !== 'Vegan' && t !== 'Vegetarian')
      tagsList.push(foodType)
      formData.append('tags', tagsList.join(', '))
      
      formData.append('ingredients', ingredients)
      formData.append('calories', calories)

      await createMenuItem(formData)
      // Note: we don't need to manually reset form if the parent unmounts or hides it,
      // but if there's an error in the parent, the parent might keep it open.
      // Parent handleCreate will close it instantly for optimistic UI.
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to create menu item. Please try again.')
      setIsSubmitting(false)
    }
  }

  // Parse list for Live Preview
  const tagsList: string[] = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const ingredientsList: string[] = ingredients ? ingredients.split(',').map(i => i.trim()).filter(Boolean) : []

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 font-sans select-none relative">
      <div className="z-10 relative">
        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Glass Form Side */}
          <div className="lg:col-span-7 bg-[#FAFAFA] border border-slate-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden relative">
            
            {/* Soft top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#F47B3E]/30 via-[#F47B3E] to-[#F47B3E]/30" />

            {/* Form Header */}
            <div className="px-6 py-5 border-b border-[#E5E7EB]/40 flex items-center justify-between bg-slate-50">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Add New Menu Item</h1>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">Introduce a delicious new dish to your digital menu</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center border border-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold leading-normal">
                  {error}
                </div>
              )}

              {/* Item Name */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700 block" htmlFor="name">
                  Item Name <span className="text-[#F47B3E] font-black">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Enter item name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-[#E5E7EB]/60 focus:bg-white focus:border-[#F47B3E] focus:ring-4 focus:ring-[#F47B3E]/10 rounded-2xl outline-none text-sm font-semibold text-slate-800 placeholder-slate-400 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                />
              </div>

              {/* Category & Price (Side-by-side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Category */}
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-700 block" htmlFor="category">
                    Category <span className="text-[#F47B3E] font-black">*</span>
                  </label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full pl-11 pr-10 py-3 bg-white/50 border border-[#E5E7EB]/60 focus:bg-white focus:border-[#F47B3E] focus:ring-4 focus:ring-[#F47B3E]/10 rounded-2xl outline-none text-sm font-semibold text-slate-800 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] cursor-pointer appearance-none"
                    >
                      <option value="Starters">Starters</option>
                      <option value="Main Course">Main Course</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Sides">Sides</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-700 block" htmlFor="price">
                    Price <span className="text-[#F47B3E] font-black">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">{currencySymbol}</span>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      required
                      placeholder="Enter price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-white/50 border border-[#E5E7EB]/60 focus:bg-white focus:border-[#F47B3E] focus:ring-4 focus:ring-[#F47B3E]/10 rounded-2xl outline-none text-sm font-semibold text-slate-800 placeholder-slate-400 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700 block" htmlFor="description">
                  Description
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Enter item description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-[#E5E7EB]/60 focus:bg-white focus:border-[#F47B3E] focus:ring-4 focus:ring-[#F47B3E]/10 rounded-2xl outline-none text-sm font-semibold text-slate-800 placeholder-slate-400 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Status & Availability (Side-by-side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Status */}
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-700 block" htmlFor="status">
                    Status <span className="text-[#F47B3E] font-black">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 border border-[#E5E7EB]/60 focus:bg-white focus:border-[#F47B3E] focus:ring-4 focus:ring-[#F47B3E]/10 rounded-2xl outline-none text-sm font-semibold text-slate-800 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] cursor-pointer appearance-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-700 block" htmlFor="availability">
                    Availability
                  </label>
                  <div className="relative">
                    <select
                      id="availability"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 border border-[#E5E7EB]/60 focus:bg-white focus:border-[#F47B3E] focus:ring-4 focus:ring-[#F47B3E]/10 rounded-2xl outline-none text-sm font-semibold text-slate-800 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] cursor-pointer appearance-none"
                    >
                      <option value="Available">Available</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                  </div>
                </div>
              </div>

              {/* Food Type Segmented Selector */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700 block">
                  Food Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Veg */}
                  <button
                    type="button"
                    onClick={() => setFoodType('Veg')}
                    className={`flex items-center justify-between px-4 py-3 border rounded-2xl font-bold text-xs cursor-pointer transition-all ${
                      foodType === 'Veg'
                        ? 'border-emerald-500 bg-emerald-50/40 text-emerald-700'
                        : 'border-[#E5E7EB]/70 bg-white hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <span>Veg</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${foodType === 'Veg' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  </button>

                  {/* Non-Veg */}
                  <button
                    type="button"
                    onClick={() => setFoodType('Non-Veg')}
                    className={`flex items-center justify-between px-4 py-3 border rounded-2xl font-bold text-xs cursor-pointer transition-all ${
                      foodType === 'Non-Veg'
                        ? 'border-orange-500 bg-orange-50/40 text-orange-700'
                        : 'border-[#E5E7EB]/70 bg-white hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <span>Non-Veg</span>
                    <span className={`w-2.5 h-2.5 rounded-full border ${foodType === 'Non-Veg' ? 'border-orange-500 bg-transparent' : 'border-slate-200 bg-transparent'}`} />
                  </button>

                  {/* Vegan */}
                  <button
                    type="button"
                    onClick={() => setFoodType('Vegan')}
                    className={`flex items-center justify-between px-4 py-3 border rounded-2xl font-bold text-xs cursor-pointer transition-all ${
                      foodType === 'Vegan'
                        ? 'border-slate-500 bg-slate-50/40 text-slate-700'
                        : 'border-[#E5E7EB]/70 bg-white hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <span>Vegan</span>
                    <span className={`w-2.5 h-2.5 rounded-full border ${foodType === 'Vegan' ? 'border-slate-400 bg-transparent' : 'border-slate-200 bg-transparent'}`} />
                  </button>
                </div>
              </div>

              {/* Integrated Image Upload Area */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700 block">
                  Image Upload
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-[#E5E7EB] hover:border-[#F47B3E]/60 rounded-2xl bg-white/40 backdrop-blur-md transition-colors relative overflow-hidden group">
                  
                  {/* Image square preview */}
                  {imageUrl ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#E5E7EB] shrink-0 bg-slate-50">
                      <img src={imageUrl} alt="Dish preview" loading="lazy" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute inset-0 bg-black/45 hover:bg-black/65 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer font-bold text-[9px] uppercase tracking-wider"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-orange-50/50 text-[#F47B3E]/60 flex items-center justify-center border border-dashed border-[#FFF3ED] shrink-0 select-none">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1 text-center sm:text-left">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors shadow-sm select-none">
                      {isUploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F47B3E]" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-[#F47B3E]" />
                          <span>{imageUrl ? 'Change Image' : 'Upload Image'}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 font-medium">JPG, PNG up to 2MB (WEBP, SVG up to 5MB supported)</p>
                  </div>
                </div>
              </div>

              {/* Collapsible Advanced Settings (Accordion) */}
              <div className="border border-[#E5E7EB]/50 rounded-2xl overflow-hidden bg-white/30">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F47B3E]" />
                    Advanced Settings (Ingredients, Tags, Calories)
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvanced && (
                  <div className="p-4 bg-white/50 border-t border-[#E5E7EB]/40 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Ingredients */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-600 block" htmlFor="ingredients">
                          Ingredients (comma separated)
                        </label>
                        <div className="relative">
                          <ChefHat className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            id="ingredients"
                            type="text"
                            placeholder="Flour, Cheese, Tomato"
                            value={ingredients}
                            onChange={(e) => setIngredients(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB]/60 focus:border-[#F47B3E] rounded-xl outline-none text-xs font-semibold text-slate-800 placeholder-slate-300"
                          />
                        </div>
                      </div>

                      {/* Custom Tags */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-600 block" htmlFor="tags">
                          Custom Tags (comma separated)
                        </label>
                        <div className="relative">
                          <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            id="tags"
                            type="text"
                            placeholder="Popular, Gluten-free"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB]/60 focus:border-[#F47B3E] rounded-xl outline-none text-xs font-semibold text-slate-800 placeholder-slate-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Calories */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-600 block" htmlFor="calories">
                        Calories (optional)
                      </label>
                      <div className="relative">
                        <Flame className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="calories"
                          type="number"
                          placeholder="e.g. 450"
                          value={calories}
                          onChange={(e) => setCalories(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB]/60 focus:border-[#F47B3E] rounded-xl outline-none text-xs font-semibold text-slate-800 placeholder-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions (Cancel & Save Changes) */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]/40 bg-white/30">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 border border-[#E5E7EB] hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-6 py-3 bg-[#F47B3E] hover:bg-[#e06b30] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] shadow-lg shadow-[#F47B3E]/10"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Add Item</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Interactive Live Preview Card (Right Column) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 z-10 hidden sm:block">
            <div className="mb-4 flex items-center gap-2 justify-center lg:justify-start">
              <Eye className="w-4 h-4 text-[#F47B3E]" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interactive Live Preview</span>
            </div>

            {/* Mobile Mockup Card */}
            <div className="bg-white border border-[#E5E7EB]/60 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col group max-w-sm mx-auto">
              <div className="relative h-56 bg-slate-50 overflow-hidden select-none">
                {imageUrl ? (
                  <img src={imageUrl} alt={name || 'Dish preview'} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-2 bg-gradient-to-br from-orange-100/10 to-amber-100/10">
                    <Utensils className="w-12 h-12 text-[#F47B3E]/30" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No Dish Photo</span>
                  </div>
                )}
                {/* Category badge */}
                <span className="absolute top-4 left-4 px-2.5 py-1.5 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-xl text-[9px] font-extrabold text-slate-600 uppercase tracking-widest shadow-sm">
                  🍴 {category}
                </span>

                {/* Food Type Indicator Dot */}
                <span className={`absolute bottom-4 left-4 px-2.5 py-1.5 bg-white/95 backdrop-blur-sm border rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
                  foodType === 'Veg' ? 'text-emerald-600 border-emerald-100' : foodType === 'Non-Veg' ? 'text-orange-600 border-orange-100' : 'text-slate-600 border-slate-100'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    foodType === 'Veg' ? 'bg-emerald-500' : foodType === 'Non-Veg' ? 'bg-orange-500' : 'bg-slate-400'
                  }`} />
                  {foodType}
                </span>
                
                {/* Calories badge */}
                {calories && (
                  <span className="absolute top-4 right-4 px-2 py-1 bg-red-500 text-white rounded-lg text-[9px] font-black tracking-wider flex items-center gap-1 shadow-sm">
                    <Flame className="w-3.5 h-3.5 fill-white stroke-none" />
                    {calories} kcal
                  </span>
                )}
              </div>

              {/* Card Details */}
              <div className="p-6 flex-1 flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-base text-slate-800 tracking-tight leading-tight max-w-[75%] break-words">
                    {name || 'Delicious Dish Name'}
                  </h3>
                  <span className="font-black text-[#F47B3E] text-base shrink-0 ml-3">
                    {currencySymbol}{price || '0.00'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-medium leading-relaxed min-h-[40px]">
                  {description || 'Provide a stunning short description about your chef special ingredients, portion sizes, or history...'}
                </p>

                {/* Ingredients breakdown */}
                {ingredientsList.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Ingredients</span>
                    <div className="flex flex-wrap gap-1">
                      {ingredientsList.map((ing) => (
                        <span key={ing} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-[8.5px] font-bold text-slate-500 uppercase tracking-wide">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer section with tags & heart indicator */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tagsList.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2.5 py-1 bg-orange-50 border border-orange-100/50 rounded-lg text-[9px] font-black text-[#F47B3E] uppercase tracking-wide">
                        ✨ {tag}
                      </span>
                    ))}
                    {tagsList.length === 0 && (
                      <span className="text-[9.5px] text-slate-300 font-semibold italic">No Tags</span>
                    )}
                  </div>
                  
                  <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Heart className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
