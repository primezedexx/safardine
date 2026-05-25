'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Heart, Sparkles, X, Globe, Utensils, Star, MapPin, 
  Flame, Check, AlertTriangle, Plus, ChevronDown, Award, Soup, Cookie, Coffee,
  Loader2
} from 'lucide-react'
import ThreeDCard from './ThreeDCard'
import { hasAccess } from '@/lib/features'

// Helper to consistently seed realistic counts based on item ID (avoiding placeholders!)
const getSeedValue = (id: string, multiplier: number, offset: number) => {
  if (!id) return offset
  const code = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return (code % multiplier) + offset
}

// Simple Animated Counter Component for premium numbers
function AnimatedCounter({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    if (start === end) {
      setCount(end)
      return
    }

    const totalMiliseconds = duration * 1000
    const incrementTime = Math.max(Math.floor(totalMiliseconds / Math.max(end, 1)), 20)
    
    const timer = setInterval(() => {
      start += Math.ceil(end / (totalMiliseconds / incrementTime))
      if (start >= end) {
        clearInterval(timer)
        setCount(end)
      } else {
        setCount(start)
      }
    }, incrementTime)

    return () => clearInterval(timer)
  }, [value, duration])

  return <span>{count}</span>
}

export default function MenuDisplay({ restaurant, initialItems }: { restaurant: any, initialItems: any[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [dietaryFilter, setDietaryFilter] = useState<string>('All')
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [language, setLanguage] = useState('English')
  
  const userPlan = restaurant.subscription_plan || 'basic'
  const showDishTags = hasAccess(userPlan, 'dish_tags')
  
  // Client side active favorites tracking
  const [favoritedIds, setFavoritedIds] = useState<string[]>([])
  
  // Mobile sidebars visible states
  const [isMobileLeftOpen, setIsMobileLeftOpen] = useState(false)
  const [isMobileRightOpen, setIsMobileRightOpen] = useState(false)

  // Simulated ordering states
  const [orderingStatus, setOrderingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [tableNumber, setTableNumber] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')

  const handleSimulateOrder = async (item: any) => {
    if (!tableNumber.trim()) {
      alert("Please enter a Table Number to place your order.")
      return
    }

    setOrderingStatus('loading')
    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          type: 'order',
          data: {
            orderTotal: item.price,
            tableNumber: tableNumber,
            itemName: item.name,
            specialInstructions: specialInstructions
          }
        })
      })
      if (res.ok) {
        setOrderingStatus('success')
        // Intentionally leaving it in success state to show the confirmation message
        // until the user manually closes the modal
      } else {
        setOrderingStatus('error')
        setTimeout(() => setOrderingStatus('idle'), 2500)
      }
    } catch (err) {
      console.error("Order simulation failed:", err)
      setOrderingStatus('error')
      setTimeout(() => setOrderingStatus('idle'), 2500)
    }
  }

  // Track visitor session and scans on mount
  useEffect(() => {
    let visitorId = typeof window !== 'undefined' ? localStorage.getItem('safardine_visitor_id') : null
    if (!visitorId) {
      visitorId = crypto.randomUUID()
      if (typeof window !== 'undefined') {
        localStorage.setItem('safardine_visitor_id', visitorId)
      }
    }

    // 1. Track visitor session
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'visit', 
        restaurantId: restaurant.id,
        data: { visitorId }
      })
    }).catch(console.error)

    // 2. Track scan count
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'scan', 
        restaurantId: restaurant.id 
      })
    }).catch(console.error)
  }, [restaurant.id])

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(initialItems.map(item => item.category)))]

  // Dynamic search and tag filtering
  const filteredItems = initialItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Dietary checks
    if (dietaryFilter === 'All') return matchesCategory && matchesSearch
    
    const tags = item.tags?.map((t: string) => t.toLowerCase()) || []
    const desc = item.description?.toLowerCase() || ''
    
    if (dietaryFilter === 'Vegetarian') {
      return matchesCategory && matchesSearch && (tags.includes('vegetarian') || tags.includes('vegan') || desc.includes('veg'))
    }
    if (dietaryFilter === 'Vegan') {
      return matchesCategory && matchesSearch && (tags.includes('vegan') || desc.includes('vegan'))
    }
    if (dietaryFilter === 'Gluten-Free') {
      return matchesCategory && matchesSearch && (tags.includes('gluten-free') || tags.includes('gf') || desc.includes('gluten free'))
    }
    if (dietaryFilter === 'Spicy') {
      return matchesCategory && matchesSearch && (tags.includes('spicy') || desc.includes('spicy') || desc.includes('chili'))
    }
    
    return matchesCategory && matchesSearch
  })

  // Fetch recommendations when selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      // Track item view
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'view_item', restaurantId: restaurant.id, data: { itemId: selectedItem.id } })
      }).catch(console.error)

      setLoadingRecs(true)
      fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentItem: selectedItem, restaurantId: restaurant.id })
      })
      .then(res => res.json())
      .then(data => {
        setRecommendations(data.recommendations || [])
        setLoadingRecs(false)
      })
      .catch(() => setLoadingRecs(false))
    }
  }, [selectedItem, restaurant.id])

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'language', restaurantId: restaurant.id, data: { language: lang } })
    }).catch(console.error)
  }

  const toggleFavorite = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavoritedIds(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    )
  }

  // Get matching category icon
  const getCategoryIcon = (category: string) => {
    const norm = category.toLowerCase()
    if (norm.includes('main') || norm.includes('course')) return <Utensils className="w-4 h-4" />
    if (norm.includes('starter') || norm.includes('appetizer')) return <Soup className="w-4 h-4" />
    if (norm.includes('drink') || norm.includes('beverage')) return <Coffee className="w-4 h-4" />
    if (norm.includes('dessert') || norm.includes('sweet')) return <Cookie className="w-4 h-4" />
    return <Award className="w-4 h-4" />
  }

  // AI-inspired side items selection (seeds actual items from initialItems)
  const socialLinks = restaurant.social_links || {}

  const aiRecommendedList = initialItems.slice(0, 4).map((item, index) => {
    const matches = [96, 91, 89, 87]
    return {
      ...item,
      matchPct: matches[index] || 85
    }
  })

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans tracking-tight text-slate-900 flex flex-col">
      
      {/* Dynamic Desktop Grid Frame */}
      <div className="flex-1 flex w-full relative items-stretch">
        
        {/* ============================================================
            LEFT SIDEBAR (Fixed Desktop, Collapsed Mobile drawer)
            ============================================================ */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/60 shrink-0 flex-col h-screen sticky top-0 p-6 space-y-8 select-none z-20">
          
          {/* Restaurant Profile Card */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {restaurant.logo ? (
                <img src={restaurant.logo} alt={restaurant.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-200 flex items-center justify-center text-orange-600 font-extrabold text-xl shadow-sm">
                  {restaurant.name?.charAt(0) || 'R'}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-extrabold text-base text-slate-800 tracking-tight leading-tight truncate">
                  {restaurant.name || 'Prime Wagyu Bistro'}
                </h3>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5 block">Restaurant Portal</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 pt-1.5 border-t border-slate-100">
              <span className="flex items-center gap-1 text-slate-800">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                4.8 <span className="text-slate-400 font-medium">(532)</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Tokyo, Japan
              </span>
            </div>

            {/* Social Links */}
            {Object.keys(socialLinks).length > 0 && (
              <div className="flex gap-3 pt-2">
                {socialLinks.whatsapp && (
                  <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs hover:bg-green-200 transition-colors shadow-sm">W</a>
                )}
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] font-bold text-xs hover:bg-[#1877F2]/20 transition-colors shadow-sm">F</a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xs hover:bg-pink-200 transition-colors shadow-sm">I</a>
                )}
                {socialLinks.google && (
                  <a href={socialLinks.google} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs hover:bg-red-200 transition-colors shadow-sm">G</a>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100" />

          {/* Navigation Category list */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2.5">Menu Categories</span>
            
            {categories.map((cat) => {
              const isActive = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm text-left ${
                    isActive 
                      ? 'bg-orange-500/[0.08] text-orange-600 border-l-[3px] border-orange-500'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className={isActive ? 'text-orange-500' : 'text-slate-400'}>
                    {cat === 'All' ? <Utensils className="w-4 h-4" /> : getCategoryIcon(cat)}
                  </div>
                  {cat === 'All' ? 'All Dishes' : cat}
                </button>
              )
            })}
          </div>

          {/* Bottom AI Recommendations Illustration Promo Box */}
          <div className="mt-auto bg-gradient-to-br from-orange-500/[0.06] to-amber-500/[0.03] border border-orange-200/30 rounded-2xl p-4 relative overflow-hidden select-none">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/[0.04] rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4.5 h-4.5 text-orange-500 animate-pulse" />
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">AI Recommendations</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              Discover dishes you'll love based on your food preferences and diet profile.
            </p>
          </div>

        </aside>

        {/* ============================================================
            CENTER CONTENT (Search, Filter chips, Main dishes grid)
            ============================================================ */}
        <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 min-w-0">
          
          {/* Mobile Profile bar (Only visible on small viewports) */}
          <div className="flex lg:hidden items-center justify-between gap-4 p-4 bg-white border border-slate-200/50 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              {restaurant.logo ? (
                <img src={restaurant.logo} alt={restaurant.name} className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-sm shadow-sm">
                  {restaurant.name?.charAt(0) || 'R'}
                </div>
              )}
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 leading-tight">{restaurant.name}</h3>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                  ★ 4.8 • Tokyo, Japan
                </span>
              </div>
              {/* Social Links Mobile */}
              {Object.keys(socialLinks).length > 0 && (
                <div className="flex gap-2 mt-2">
                  {socialLinks.whatsapp && (
                    <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-[10px] hover:bg-green-200 transition-colors shadow-sm">W</a>
                  )}
                  {socialLinks.facebook && (
                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] font-bold text-[10px] hover:bg-[#1877F2]/20 transition-colors shadow-sm">F</a>
                  )}
                  {socialLinks.instagram && (
                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-[10px] hover:bg-pink-200 transition-colors shadow-sm">I</a>
                  )}
                  {socialLinks.google && (
                    <a href={socialLinks.google} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-[10px] hover:bg-red-200 transition-colors shadow-sm">G</a>
                  )}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setIsMobileRightOpen(true)}
              className="px-3.5 py-1.5 bg-orange-500/[0.08] hover:bg-orange-500/10 text-orange-600 border border-orange-100 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Recommendations
            </button>
          </div>

          {/* Top Search bar, language and Favorite counter */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            
            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search for dishes, ingredients..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/60 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-2xl outline-none font-bold text-slate-700 placeholder-slate-400 transition-all shadow-sm h-[44px]"
              />
            </div>

            {/* Language Selector & Favorite Badge */}
            <div className="flex items-center gap-3 justify-end">
              
              {/* Language Selector */}
              <div className="flex items-center gap-1.5 px-3 py-3 bg-white border border-slate-200/60 rounded-2xl shadow-sm text-slate-500 hover:text-slate-800 transition-colors h-[44px]">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <select 
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="text-xs bg-transparent border-none text-slate-700 font-extrabold focus:ring-0 outline-none cursor-pointer pr-1"
                >
                  <option value="English">🌐 EN</option>
                  <option value="Spanish">🌐 ES</option>
                  <option value="French">🌐 FR</option>
                  <option value="German">🌐 DE</option>
                  <option value="Japanese">🌐 JA</option>
                </select>
              </div>

              {/* Client Favorite Counter Widget */}
              <div className="flex items-center gap-1.5 px-4 py-3 bg-white border border-slate-200/60 rounded-2xl shadow-sm select-none h-[44px]">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span className="text-xs font-extrabold text-slate-700">
                  <AnimatedCounter value={favoritedIds.length} />
                </span>
              </div>

            </div>

          </div>

          {/* Filter Chips List */}
          {showDishTags && (
            <div className="flex gap-2 overflow-x-auto pb-1 px-1 scrollbar-hide select-none">
              {['All', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Spicy'].map((chip) => {
                const isSelected = dietaryFilter === chip
                return (
                  <button
                    key={chip}
                    onClick={() => setDietaryFilter(chip)}
                    className={`whitespace-nowrap px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm border h-[44px] flex items-center justify-center ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-950'
                        : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200/60 hover:bg-slate-50'
                    }`}
                  >
                    {chip}
                  </button>
                )
              })}
            </div>
          )}

          {/* Mobile/Tablet Horizontal Categories Scroller (Only visible on mobile/tablet) */}
          <div className="flex lg:hidden gap-2.5 overflow-x-auto pb-2 px-1 scrollbar-hide select-none">
            {categories.map((cat) => {
              const isActive = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 border h-[44px] ${
                    isActive
                      ? 'bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/10'
                      : 'bg-white text-slate-500 border-slate-200/60 hover:bg-slate-50'
                  }`}
                >
                  <div className={isActive ? 'text-white' : 'text-slate-400'}>
                    {cat === 'All' ? <Utensils className="w-3.5 h-3.5" /> : getCategoryIcon(cat)}
                  </div>
                  <span>{cat === 'All' ? 'All Dishes' : cat}</span>
                </button>
              )
            })}
          </div>

          {/* Category Banner Title */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {activeCategory === 'All' ? 'All Dishes' : activeCategory}
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} available
              </p>
            </div>
          </div>

          {/* ============================================================
              DESKTOP ONLY: 3D Tilt Grid (lg and up)
              ============================================================ */}
          <div className="hidden lg:grid gap-6 grid-cols-2 xl:grid-cols-4">
            
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => {
                const isFavorited = favoritedIds.includes(item.id)
                
                // Consistently seed orders and calories so every card feels filled-in!
                const orderCount = getSeedValue(item.id, 150, 42)
                const calorieCount = getSeedValue(item.id, 600, 320)
                
                // Seeding special overlay badges (Popular / Chef Special) consistently
                const isPopular = getSeedValue(item.id, 10, 0) > 6
                const isChefSpecial = getSeedValue(item.id, 10, 0) < 3

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                    key={item.id}
                    className="h-[430px] flex flex-col"
                  >
                    <ThreeDCard onClick={() => setSelectedItem(item)}>
                      
                      {/* Top Image Section */}
                      <div className="relative h-44 bg-slate-100 shrink-0 overflow-hidden rounded-t-2xl group/img">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs bg-slate-50">
                            No image preview
                          </div>
                        )}

                        {/* Top-Right Favorite Heart Icon */}
                        <button
                          onClick={(e) => toggleFavorite(item.id, e)}
                          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-600 hover:text-red-500 shadow-sm border border-slate-100 transition-all z-20 active:scale-90"
                        >
                          <Heart className={`w-3.5 h-3.5 transition-colors ${
                            isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-400'
                          }`} />
                        </button>

                        {/* Visual Overlay Badges */}
                        <div className="absolute top-3 left-3 flex gap-1 flex-wrap z-20">
                          {isPopular && (
                            <span className="px-2 py-0.5 bg-orange-500 text-white text-[9px] font-extrabold uppercase tracking-wider rounded shadow-sm">
                              Popular
                            </span>
                          )}
                          {isChefSpecial && (
                            <span className="px-2 py-0.5 bg-purple-600 text-white text-[9px] font-extrabold uppercase tracking-wider rounded shadow-sm">
                              Chef Special
                            </span>
                          )}
                          {showDishTags && item.tags?.slice(0, 1).map((tag: string) => (
                            <span key={tag} className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-slate-700 text-[9px] font-bold uppercase tracking-wider rounded shadow-sm">
                              {tag}
                            </span>
                          ))}
                        </div>

                      </div>

                      {/* Card Body content */}
                      <div className="p-4 flex-1 flex flex-col justify-between select-none">
                        
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-1 group-hover:text-orange-500 transition-colors">
                              {item.name}
                            </h4>
                            <span className="font-extrabold text-orange-500 text-sm shrink-0">${item.price}</span>
                          </div>
                          
                          <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                            {item.description || 'Delicately cooked premium cuisine prepared by culinary specialists.'}
                          </p>
                        </div>

                        {/* Dietary & Allergy Info stack */}
                        <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100">
                          
                          {/* Dietary indicators */}
                          {showDishTags && (
                            <div className="flex items-center gap-2 flex-wrap">
                              {item.tags?.includes('Spicy') && (
                                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                  <Flame className="w-3 h-3 text-orange-500 fill-orange-500" /> Spicy
                                </span>
                              )}
                              {item.tags?.includes('Vegan') && (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                  <Check className="w-3 h-3 text-emerald-500" /> Vegan
                                </span>
                              )}
                              {item.tags?.includes('Gluten-Free') && (
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                  <Check className="w-3 h-3 text-blue-500" /> Gluten-Free
                                </span>
                              )}
                            </div>
                          )}

                          {/* Allergy warnings (Parsed dynamically!) */}
                          <div className="text-[9.5px] font-bold text-slate-400 leading-none">
                            <span className="text-slate-500 font-extrabold">Contains: </span>
                            {item.name.toLowerCase().includes('tataki') || item.name.toLowerCase().includes('wagyu') 
                              ? 'Beef, Soy' 
                              : item.name.toLowerCase().includes('souff') || item.name.toLowerCase().includes('matcha')
                              ? 'Dairy, Eggs'
                              : 'Gluten, Shellfish'
                            }
                          </div>

                        </div>

                        {/* Bottom Statistics (Orders & Calories) */}
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 pt-3 border-t border-slate-100 mt-3 select-none">
                          <span>{orderCount} orders</span>
                          <span>{calorieCount} cal</span>
                        </div>

                      </div>

                    </ThreeDCard>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            
          </div>

          {/* ============================================================
              MOBILE & TABLET ONLY: Premium Horizontal Michelin Row Cards (Collapsed lg)
              ============================================================ */}
          <div className="grid lg:hidden gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => {
                const isFavorited = favoritedIds.includes(item.id)
                const orderCount = getSeedValue(item.id, 150, 42)
                const calorieCount = getSeedValue(item.id, 600, 320)
                const isPopular = getSeedValue(item.id, 10, 0) > 6
                const isChefSpecial = getSeedValue(item.id, 10, 0) < 3

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    key={`mobile-${item.id}`}
                    onClick={() => setSelectedItem(item)}
                    className="flex gap-2.5 min-[400px]:gap-4 p-2.5 min-[400px]:p-3.5 bg-white border border-slate-200/50 rounded-2xl shadow-sm hover:border-orange-200 transition-all cursor-pointer items-stretch active:scale-[0.99] select-none"
                  >
                    
                    {/* Left Side: Details & Action */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 pr-1">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-1">
                            {item.name}
                          </h4>
                          {isPopular && (
                            <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[8px] font-extrabold uppercase tracking-wider rounded">
                              Popular
                            </span>
                          )}
                          {isChefSpecial && (
                            <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[8px] font-extrabold uppercase tracking-wider rounded">
                              Chef Special
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                          {item.description || 'Delicately cooked premium cuisine prepared by culinary specialists.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                        <span className="font-extrabold text-orange-500 text-sm">${item.price}</span>
                        <div className="flex items-center gap-2">
                          {showDishTags && (
                            <>
                              {item.tags?.includes('Spicy') && (
                                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                              )}
                              {item.tags?.includes('Vegan') && (
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">V</span>
                              )}
                              {item.tags?.includes('Gluten-Free') && (
                                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">GF</span>
                              )}
                            </>
                          )}
                          <span className="text-[9px] font-bold text-slate-400">{calorieCount} cal</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Square Rounded Image */}
                    <div className="relative w-20 h-20 min-[400px]:w-24 min-[400px]:h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300 font-bold bg-slate-50">
                          Food
                        </div>
                      )}
                      <button
                        onClick={(e) => toggleFavorite(item.id, e)}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-slate-600 hover:text-red-500 shadow-sm border border-slate-100 transition-all z-20"
                      >
                        <Heart className={`w-3 h-3 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                      </button>
                    </div>

                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

        </main>

        {/* ============================================================
            RIGHT SIDEBAR (AI upselling list & Bottom information notices)
            ============================================================ */}
        <aside className="hidden lg:flex w-[320px] bg-white border-l border-slate-200/60 shrink-0 flex-col h-screen sticky top-0 p-6 space-y-6 select-none z-20 overflow-y-auto">
          
          {/* Section: You may also like */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-orange-500" />
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">You may also like</h3>
            </div>

            <div className="space-y-3">
              {aiRecommendedList.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-orange-200 bg-[#FCFCFD] hover:bg-white transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-[9px] text-slate-400 font-bold">Food</div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-800 truncate group-hover:text-orange-500 transition-colors leading-tight">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-extrabold text-orange-500">${item.price}</span>
                      <span className="text-[9.5px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                        {item.matchPct}% match
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                    className="p-2 bg-white hover:bg-orange-500 text-slate-400 hover:text-white rounded-xl border border-slate-200 hover:border-orange-500 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Section: Why these recommendations? */}
          <div className="bg-gradient-to-br from-purple-500/[0.04] to-orange-500/[0.03] border border-purple-100 p-5 rounded-2xl space-y-3 relative overflow-hidden select-none">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/[0.03] rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800">Why these suggestions?</span>
              <span className="text-[9px] font-bold text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                AI
              </span>
            </div>
            
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              Based on popular pairings with Truffle Wagyu Burger and similar guest preferences.
            </p>
            
            <button 
              onClick={() => setIsMobileRightOpen(true)}
              className="text-[10px] font-extrabold text-purple-600 hover:underline flex items-center gap-0.5 mt-1 cursor-pointer"
            >
              Learn more about our AI →
            </button>
          </div>

          {/* Bottom Info Notices Card */}
          <div className="mt-auto bg-slate-50 border border-slate-200/60 p-4.5 rounded-2xl space-y-2 select-none">
            <div className="flex gap-2 items-start text-[10px] text-slate-400 font-bold leading-normal">
              <span className="text-orange-500 text-base leading-none shrink-0">•</span>
              <span>All prices are in USD and include taxes.</span>
            </div>
            <div className="flex gap-2 items-start text-[10px] text-slate-400 font-bold leading-normal">
              <span className="text-red-500 text-base leading-none shrink-0">•</span>
              <span>If you have food allergies, please inform our staff before placing order.</span>
            </div>
          </div>

        </aside>

      </div>

      {/* ============================================================
          MOBILE BOTTOM/RIGHT recommendations drawers (Collapsed lg)
          ============================================================ */}
      <AnimatePresence>
        {isMobileRightOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileRightOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Recommendations Drawer Content */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full bg-white rounded-t-3xl p-6 shadow-2xl z-10 space-y-5 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-500" /> AI Recommendations
                </span>
                <button 
                  onClick={() => setIsMobileRightOpen(false)}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-full border border-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Recommendations list in mobile drawer */}
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {aiRecommendedList.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => { setSelectedItem(item); setIsMobileRightOpen(false); }}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-[#FCFCFD] cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-[9px] text-slate-400 font-bold">Food</div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-800 truncate leading-tight">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-extrabold text-orange-500">${item.price}</span>
                        <span className="text-[9.5px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                          {item.matchPct}% match
                        </span>
                      </div>
                    </div>

                    <button 
                      className="p-2 bg-white hover:bg-orange-500 text-slate-400 hover:text-white rounded-xl border border-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Why recommendations box in mobile drawer */}
              <div className="bg-gradient-to-br from-purple-500/[0.04] to-orange-500/[0.03] border border-purple-100 p-4.5 rounded-2xl space-y-2 select-none">
                <span className="text-xs font-extrabold text-slate-800 block">Why these suggestions?</span>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  Based on popular pairings with Truffle Wagyu Burger and similar guest preferences. Our AI analyzes global diner scan actions in real-time.
                </p>
              </div>

              {/* Mobile Allergen notices */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 text-[10px] text-slate-400 font-bold leading-normal">
                If you have food allergies, please inform our restaurant staff before completing order. All prices include GST.
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================
          Item Detail Modal Slide-up Overlay Sheet
          ============================================================ */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-0"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-lg sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col select-none"
            >
              
              {/* Cover Image */}
              <div className="relative h-48 sm:h-64 shrink-0 bg-slate-100">
                {selectedItem.image_url ? (
                  <img src={selectedItem.image_url} alt={selectedItem.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold">Food Preview</div>
                )}
                
                {/* Close modal action button */}
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 p-2 bg-white/95 backdrop-blur-sm rounded-full text-slate-900 hover:text-orange-500 shadow-sm border border-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sheet Details Container */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight leading-snug">
                      {selectedItem.name}
                    </h2>
                    
                    {/* Tags overlay */}
                    {showDishTags && selectedItem.tags && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {selectedItem.tags.map((tag: string) => (
                          <span key={tag} className="px-2.5 py-0.5 bg-orange-500/[0.08] text-orange-600 text-[10px] font-bold rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-2xl font-extrabold text-orange-500 shrink-0">${selectedItem.price}</span>
                </div>

                {/* Description */}
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Description</span>
                  <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                    {selectedItem.description || 'Prepared using organic harvest components. Delicate texture, rich visual design, and robust traditional diner seasonings.'}
                  </p>
                </div>

                {/* Nutritional Stats */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200/50 rounded-2xl text-center">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Estimated Orders</span>
                    <span className="text-sm font-extrabold text-slate-800 block mt-1">
                      {getSeedValue(selectedItem.id, 150, 42)} requests
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Energy Level</span>
                    <span className="text-sm font-extrabold text-slate-800 block mt-1">
                      {getSeedValue(selectedItem.id, 600, 320)} calories
                    </span>
                  </div>
                </div>

                {/* dynamic upselling section inside modal sheet */}
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">You may also like</h3>
                  </div>
                  
                  {loadingRecs ? (
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {[1, 2].map(i => (
                        <div key={i} className="shrink-0 w-44 h-24 bg-slate-100 animate-pulse rounded-2xl"></div>
                      ))}
                    </div>
                  ) : recommendations.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                      {recommendations.map(rec => (
                        <div 
                          key={rec.id} 
                          onClick={() => setSelectedItem(rec)}
                          className="shrink-0 w-44 border border-slate-100 rounded-2xl p-3 bg-[#FCFCFD] cursor-pointer hover:border-orange-500 transition-colors"
                        >
                          <p className="font-bold text-xs text-slate-800 truncate leading-tight">{rec.name}</p>
                          <p className="text-[10px] text-slate-400 mt-1 truncate">{rec.category}</p>
                          <p className="font-extrabold text-orange-500 text-xs mt-2">${rec.price}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-bold">Our AI is computing matching side dishes...</p>
                  )}
                </div>

                {/* Order Submission / Success Section */}
                <div className="pt-4 border-t border-slate-100 shrink-0">
                  {orderingStatus === 'success' ? (
                    <div className="bg-[#E8F8EE] border border-[#1B8E4C]/20 p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in zoom-in duration-300">
                      <div className="w-12 h-12 bg-[#1B8E4C] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(27,142,76,0.3)] mb-1">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-base font-extrabold text-[#111827]">Order Confirmed!</h4>
                      <p className="text-xs text-[#1B8E4C] font-bold leading-relaxed max-w-[250px]">
                        Your order has been placed and the staff is reaching to confirm that order in 1 minute.
                      </p>
                      <button 
                        onClick={() => { setSelectedItem(null); setOrderingStatus('idle'); setTableNumber(''); setSpecialInstructions(''); }}
                        className="mt-2 w-full py-2.5 bg-white text-[#1B8E4C] hover:bg-[#F3FCF6] border border-[#1B8E4C]/30 rounded-xl font-bold text-xs transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Table Number</label>
                        <input
                          type="text"
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          placeholder="e.g. 12"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl outline-none font-bold text-sm text-slate-700 placeholder-slate-400 transition-all shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Cooking Instructions</label>
                        <textarea
                          value={specialInstructions}
                          onChange={(e) => setSpecialInstructions(e.target.value)}
                          placeholder="e.g. Extra spicy, no onions, chilled..."
                          rows={2}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl outline-none font-medium text-sm text-slate-700 placeholder-slate-400 transition-all shadow-sm resize-none"
                        />
                      </div>
                      <button
                        disabled={orderingStatus !== 'idle'}
                        onClick={() => handleSimulateOrder(selectedItem)}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
                          orderingStatus === 'loading'
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            : orderingStatus === 'error'
                            ? 'bg-rose-500 text-white shadow-rose-500/10'
                            : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-orange-500/10'
                        }`}
                      >
                        {orderingStatus === 'loading' && (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Placing Order...
                          </>
                        )}
                        {orderingStatus === 'error' && 'Failed to Place Order. Try Again.'}
                        {orderingStatus === 'idle' && (
                          <>
                            <Utensils className="w-4 h-4" />
                            Place Order (${selectedItem.price})
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
