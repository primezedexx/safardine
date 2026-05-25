'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { 
  LayoutGrid, 
  Pizza, 
  Beef, 
  Soup, 
  Cherry, 
  Coffee, 
  Cake, 
  Gift, 
  Headphones, 
  Search, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft, 
  Tag,
  Loader2,
  ChevronDown,
  X,
  Sparkles,
  Menu,
  SlidersHorizontal,
  Filter,
  ChefHat,
  Check,
  Leaf,
  Flame,
  Star,
  Clock,
  ReceiptText
} from 'lucide-react'

// Supported Languages
const languages = [
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語' }
]

interface MenuClientProps {
  restaurant: any
  menuItems: any[]
}

export function MenuClient({ restaurant, menuItems }: MenuClientProps) {
  // Shared state
  const [lang, setLang] = useState('en')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All Items')
  const [cart, setCart] = useState<Record<string | number, number>>({})
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [tableNo, setTableNo] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [orderingStatus, setOrderingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  
  // Review Modal states
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHover, setReviewHover] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  
  // Right Cart panel collapsible state
  const [isCartExpanded, setIsCartExpanded] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Filter state
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Cinematic Modal State
  const [journeyStep, setJourneyStep] = useState(0)
  const [journeyQuantity, setJourneyQuantity] = useState(1)

  // Recommendation states
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)

  const [translatedItems, setTranslatedItems] = useState<any[]>(menuItems)
  const [isTranslating, setIsTranslating] = useState(false)

  // Order History state
  const [orderHistory, setOrderHistory] = useState<any[]>([])
  const [showOrderHistory, setShowOrderHistory] = useState(false)

  // Load history on mount
  useEffect(() => {
    try {
      const history = localStorage.getItem(`orders_${restaurant?.id}`)
      if (history) {
        setOrderHistory(JSON.parse(history))
      }
    } catch (e) {
      console.error("Failed to load order history", e)
    }
  }, [restaurant?.id])

  // Dynamic values
  const heroSettings = restaurant?.social_links?._hero || {}
  const heroTagline = heroSettings.tagline || 'AUTHENTIC ITALIAN CUISINE'
  const heroBadge1 = heroSettings.badge1 || '100% Vegetarian Options'
  const heroBadge2 = heroSettings.badge2 || 'Organic Ingredients'

  const restaurantName = restaurant?.restaurant_name || restaurant?.name || 'Bella Italia'
  const restaurantDescription = heroSettings.description || restaurant?.restaurant_description || restaurant?.description || 'Authentic Italian Cuisine. Good Food, Great Mood ❤️'
  const restaurantLogo = restaurant?.restaurant_logo || restaurant?.logo
  const restaurantCover = restaurant?.restaurant_cover || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2574&auto=format&fit=crop'
  const currency = restaurant?.currency || 'INR'

  // Dynamic Category list based on menuItems
  const availableCategories = ['All Items', ...Array.from(new Set(menuItems.map(i => i.category)))]

  // Extract active social links
  const socialLinks = restaurant?.social_links || {}
  const activeSocials = Object.entries(socialLinks).filter(([key, val]) => key !== '_notifications' && typeof val === 'string' && val.trim() !== '')

  const renderSocials = () => {
    if (activeSocials.length === 0) return null
    return (
      <div className="flex items-center justify-center gap-2 mb-3">
        {activeSocials.map(([platform, url]) => {
          const isInsta = platform === 'instagram'
          const isFb = platform === 'facebook'
          const isWa = platform === 'whatsapp'
          const isX = platform === 'x' || platform === 'twitter'
          return (
            <a 
              key={platform}
              href={url as string}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm transition-transform hover:scale-110 ${
                isInsta ? 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]' :
                isFb ? 'bg-[#1877F2]' :
                isWa ? 'bg-[#25D366]' :
                isX ? 'bg-black' :
                'bg-red-600'
              }`}
            >
              {isInsta ? (
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              ) : isFb ? (
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              ) : isWa ? (
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              ) : isX ? (
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              )}
            </a>
          )
        })}
      </div>
    )
  }

  // Map category to matching Lucide Icon
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    if (name.includes('pizza')) return Pizza
    if (name.includes('burger') || name.includes('sandwich') || name.includes('patty')) return Beef
    if (name.includes('pasta') || name.includes('soup') || name.includes('noodle')) return Soup
    if (name.includes('appetizer') || name.includes('starter') || name.includes('cherry')) return Cherry
    if (name.includes('drink') || name.includes('beverage') || name.includes('soda') || name.includes('coffee')) return Coffee
    if (name.includes('dessert') || name.includes('cake') || name.includes('sweet')) return Cake
    if (name.includes('combo') || name.includes('deal') || name.includes('gift')) return Gift
    return LayoutGrid
  }

  // Quantities update
  const updateQuantity = (itemId: string | number, delta: number) => {
    setCart(prev => {
      const current = prev[itemId] || 0
      const next = Math.max(0, current + delta)
      
      const copy = { ...prev }
      if (next === 0) {
        delete copy[itemId]
      } else {
        copy[itemId] = next
      }
      return copy
    })
  }

  // Clear entire cart
  const clearCart = () => {
    setCart({})
  }

  // Handle Place Order logic
  const handlePlaceOrder = async () => {
    if (!tableNo.trim()) {
      alert("Please enter your Table Number to place the order.")
      return
    }

    setOrderingStatus('loading')
    try {
      const orderTotal = subtotal + taxes
      const itemNames = cartItems.map(i => `${i.quantity}x ${i.name}`).join(', ')

      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          type: 'order',
          data: {
            orderTotal,
            tableNumber: tableNo,
            itemName: itemNames,
            specialInstructions
          }
        })
      })
      if (res.ok) {
        // Save to history
        try {
          const newOrder = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            items: cartItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, image: i.image_url || i.image })),
            total: orderTotal,
            tableNumber: tableNo,
            instructions: specialInstructions
          }
          const updatedHistory = [newOrder, ...orderHistory]
          setOrderHistory(updatedHistory)
          localStorage.setItem(`orders_${restaurant.id}`, JSON.stringify(updatedHistory))
        } catch (e) {
          console.error("Failed to save order history", e)
        }

        setOrderingStatus('success')
        clearCart()
        // Close cart sidebar after showing success briefly
        setTimeout(() => {
          setIsCartExpanded(false)
          setTableNo('')
          setSpecialInstructions('')
          setOrderingStatus('idle')
          setShowReviewModal(true)
        }, 1500)
      } else {
        setOrderingStatus('error')
        setTimeout(() => setOrderingStatus('idle'), 2500)
      }
    } catch (err) {
      console.error("Order failed:", err)
      setOrderingStatus('error')
      setTimeout(() => setOrderingStatus('idle'), 2500)
    }
  }

  // Handle Review Submission
  const handleReviewSubmit = async () => {
    if (reviewRating === 0) return
    setSubmittingReview(true)
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          type: 'review',
          data: { rating: reviewRating, comment: reviewComment }
        })
      })
      setTimeout(() => {
        setSubmittingReview(false)
        setShowReviewModal(false)
        setReviewRating(0)
        setReviewComment('')
      }, 800)
    } catch (err) {
      console.error('Failed to submit review', err)
      setSubmittingReview(false)
      setShowReviewModal(false)
    }
  }

  // Format Price
  const formatPrice = (price: number) => {
    const formatter = new Intl.NumberFormat(lang === 'ja' ? 'ja-JP' : 'en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: price % 1 === 0 ? 0 : 2
    })
    return formatter.format(price)
  }

  // Cart helper calculations
  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const originalItem = menuItems.find(i => String(i.id) === String(id))
    if (!originalItem) return null
    return {
      ...originalItem,
      quantity: qty
    }
  }).filter(Boolean) as any[]

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const taxes = subtotal > 0 ? 42 : 0
  const total = subtotal + taxes

  // Automatic Cart Expand / Collapse trigger on item count changes
  useEffect(() => {
    if (cartItems.length === 0) {
      setIsCartExpanded(false)
    }
  }, [cartItems.length])

  // Track visitor session and QR scans ONLY once on mount
  useEffect(() => {
    if (!restaurant?.id || restaurant.id === 'demo') return

    let visitorId = typeof window !== 'undefined' ? localStorage.getItem('safardine_visitor_id') : null
    if (!visitorId) {
      visitorId = crypto.randomUUID()
      if (typeof window !== 'undefined') {
        localStorage.setItem('safardine_visitor_id', visitorId)
      }
    }

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'visit', 
        restaurantId: restaurant.id,
        data: { visitorId }
      })
    }).catch(console.error)

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'scan', 
        restaurantId: restaurant.id 
      })
    }).catch(console.error)
  }, [restaurant?.id])

  // Track page view and language selections
  useEffect(() => {
    if (!restaurant?.id || restaurant.id === 'demo') return
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId: restaurant.id, lang })
    }).catch(console.error)
  }, [lang, restaurant?.id])

  // Translation Effect
  useEffect(() => {
    if (lang === 'en') {
      setTranslatedItems(menuItems)
      return
    }
    
    setIsTranslating(true)
    const targetLangName = languages.find(l => l.code === lang)?.name || lang

    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: menuItems, targetLanguage: targetLangName, targetLanguageCode: lang })
    })
    .then(res => res.json())
    .then(data => {
      if (data.translatedItems) {
        setTranslatedItems(data.translatedItems)
      }
    })
    .catch(console.error)
    .finally(() => setIsTranslating(false))
  }, [lang, menuItems])

  // Filter items based on active category & search query
  const filteredItems = translatedItems.filter(item => {
    const matchesCategory = activeCategory === 'All Items' || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesFilters = true
    if (activeFilters.length > 0) {
      const isVeg = item.is_veg || item.isVeg || (item.tags && item.tags.some((t: string) => t.toLowerCase() === 'veg' || t.toLowerCase() === 'vegetarian'))
      const isNonVeg = !isVeg
      const cat = item.category?.toLowerCase() || ''
      const itemTags = (item.tags || []).map((t: string) => t.toLowerCase())
      
      const hasVegFilter = activeFilters.includes('veg')
      const hasNonVegFilter = activeFilters.includes('non-veg')
      const hasChineseFilter = activeFilters.includes('chinese')
      const hasIndianFilter = activeFilters.includes('indian')
      const hasStarterFilter = activeFilters.includes('starter')
      const hasMainCourseFilter = activeFilters.includes('maincourse')
      
      let dietMatch = true
      if (hasVegFilter && !hasNonVegFilter) dietMatch = isVeg
      else if (hasNonVegFilter && !hasVegFilter) dietMatch = isNonVeg
      
      let cuisineMatch = true
      if (hasChineseFilter || hasIndianFilter) {
         cuisineMatch = (hasChineseFilter && (cat.includes('chinese') || itemTags.includes('chinese'))) ||
                        (hasIndianFilter && (cat.includes('indian') || itemTags.includes('indian')))
      }
      
      let courseMatch = true
      if (hasStarterFilter || hasMainCourseFilter) {
         courseMatch = (hasStarterFilter && (cat.includes('starter') || itemTags.includes('starter') || cat.includes('appetizer'))) ||
                       (hasMainCourseFilter && (cat.includes('main') || cat.includes('maincourse') || itemTags.includes('main course')))
      }
      
      matchesFilters = dietMatch && cuisineMatch && courseMatch
    }

    return matchesCategory && matchesSearch && matchesFilters
  })

  // Recommendations logic
  useEffect(() => {
    if (selectedItem) {
      setLoadingRecommendations(true)
      if (!restaurant?.id || restaurant.id === 'demo') {
        const filtered = translatedItems.filter(item => item.id !== selectedItem.id)
        const shuffled = filtered.sort(() => 0.5 - Math.random())
        setRecommendations(shuffled.slice(0, 3))
        setLoadingRecommendations(false)
        return
      }

      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'view_item', 
          restaurantId: restaurant.id, 
          data: { itemId: selectedItem.id } 
        })
      }).catch(console.error)

      const supabase = createClient()
      const channel = supabase.channel(`restaurant-realtime-${restaurant.id}`)
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'dish_viewed',
            payload: { itemId: selectedItem.id }
          })
        }
      })

      fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentItemName: selectedItem.name, allItems: translatedItems })
      })
      .then(res => res.json())
      .then(data => {
        if (data.recommendations) {
          setRecommendations(data.recommendations)
        }
      })
      .finally(() => setLoadingRecommendations(false))
    } else {
      setRecommendations([])
    }
  }, [selectedItem, translatedItems, restaurant?.id])

  // Determine if Right Cart is physically expanded
  const isCartOpen = cartItems.length > 0 || isCartExpanded

  return (
    <div className="h-screen w-screen bg-gradient-to-tr from-slate-50 via-gray-100/60 to-[#FFF7F2]/50 flex flex-col lg:flex-row font-sans select-none overflow-hidden antialiased p-2 lg:p-4 gap-2 lg:gap-4 relative">
      
      {/* Soft Glowing Backdrop Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-[#FF5722]/8 to-orange-200/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-green-100/20 to-emerald-200/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[30%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-br from-orange-100/10 to-amber-100/5 blur-[100px] pointer-events-none -z-10" />

      {/* Translation Overlay */}
      <AnimatePresence>
        {isTranslating && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <Loader2 className="h-10 w-10 text-[#FF5722] animate-spin mb-4" />
            <p className="text-slate-800 font-semibold text-sm">Translating menu...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 1. LEFT SIDEBAR (18% Locked Card) — Hidden on Mobile ───── */}
      <aside className="hidden lg:flex w-[18%] h-full shrink-0 flex-col justify-between bg-white/40 backdrop-blur-md rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.025)] overflow-y-auto no-scrollbar select-none text-left z-10 border-0">
        
        {/* Top Logo and Tagline */}
        <div className="flex flex-col items-center text-center mt-1 mb-5">
          <div className="flex flex-col items-center select-none">
            <span className="text-[36px] font-serif italic text-[#FF5722] leading-none relative font-semibold tracking-tight">
              Bella
              {/* Decorative green leaf top right */}
              <span className="absolute -top-1 -right-4 text-green-500 text-lg rotate-12 select-none">🌿</span>
            </span>
            <span className="text-[10px] font-semibold tracking-[0.3em] text-[#6E5A4B] mt-0.5 leading-none uppercase">
              ITALIA
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal mt-3.5 flex items-center justify-center gap-1">
            Good Food, Great Mood
            <span className="text-[#FF5722] text-xs">🧡</span>
          </p>
        </div>

        {/* Categories Menu */}
        <nav className="flex-1 space-y-1 mt-1">
          {availableCategories.map((catName) => {
            const Icon = getCategoryIcon(catName)
            const isActive = activeCategory === catName
            const count = catName === 'All Items' 
              ? menuItems.length 
              : menuItems.filter(i => i.category === catName).length

            return (
              <button
                key={catName}
                onClick={() => setActiveCategory(catName)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-[999px] text-[13px] font-semibold transition-all cursor-pointer border-0 ${
                  isActive
                    ? 'bg-[#FF5722]/10 text-[#FF5722] backdrop-blur-sm'
                    : 'text-slate-600 hover:bg-white/40 hover:backdrop-blur-sm'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-[#FF5722]' : 'text-slate-400'}`} />
                  <span className="truncate">{catName}</span>
                </div>
                <span className={`text-[12px] font-semibold ${
                  isActive ? 'text-[#FF5722]' : 'text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Actions & Brand Footers */}
        <div className="space-y-3.5 mt-5">
          
          {/* Help Card */}
          <div className="p-4 bg-orange-50/40 backdrop-blur-md rounded-[24px] text-center border-0 shadow-sm">
            <h4 className="text-[13px] font-semibold text-slate-900 leading-none mb-1">We're here to help!</h4>
            <p className="text-[10px] text-slate-400 font-normal mb-3">Our team is ready to assist you</p>
            {renderSocials()}
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/40 backdrop-blur-md rounded-[16px] text-xs text-[#FF5722] font-semibold hover:bg-white/70 border-0 transition-all cursor-pointer shadow-sm active:scale-[0.98]">
              <Headphones className="w-4 h-4 text-[#FF5722]" />
              Call Staff
            </button>
          </div>

          {/* Feedback Card */}
          <div className="p-4 bg-green-50/30 backdrop-blur-md rounded-[24px] text-center border-0 shadow-sm">
            <h4 className="text-[13px] font-semibold text-slate-900 leading-none mb-1">Loved our menu?</h4>
            <p className="text-[10px] text-slate-400 font-normal mb-3">Share your feedback</p>
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/40 backdrop-blur-md rounded-[16px] text-xs text-[#198754] font-semibold hover:bg-white/70 border-0 transition-all cursor-pointer shadow-sm active:scale-[0.98]">
              <span className="text-[#198754] text-[13px] leading-none">💬</span>
              Share Feedback
            </button>
          </div>

          {/* Locked Hexagonal Powered-By Footer */}
          <div className="pt-3 border-t border-gray-100/50 flex items-center justify-center gap-1.5 shrink-0 select-none">
            <div 
              className="w-4 h-4 bg-[#FF5722] flex items-center justify-center text-white shrink-0 shadow-sm relative overflow-hidden" 
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            >
              <span className="text-[9px] font-semibold leading-none -mt-[0.5px]">S</span>
            </div>
            <p className="text-[10.5px] text-slate-400 font-semibold tracking-tight">
              Powered by <span className="text-slate-800 font-semibold">Safardine</span>
            </p>
          </div>

        </div>
      </aside>

      {/* ─── 2. CENTER CONTENT (57% / Scrollable area) ─────────────── */}
      <main className="flex-1 h-full overflow-y-auto no-scrollbar flex flex-col gap-3 lg:gap-4 text-left pb-20 lg:pb-0">
        
        {/* Top Header Controls */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-3.5 bg-white/45 backdrop-blur-md rounded-[16px] lg:rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] shrink-0 z-10 border-0">
          <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
            {restaurantLogo ? (
              <img src={restaurantLogo} alt="Logo" className="w-7 h-7 rounded-full object-cover shrink-0" />
            ) : null}
            <span className="text-sm lg:text-base font-semibold text-slate-800 truncate leading-tight">{restaurantName}</span>
            <span className="text-green-500 text-xs hidden lg:inline shrink-0">🍃</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Order History Button */}
            {orderHistory.length > 0 && (
              <button 
                onClick={() => setShowOrderHistory(true)}
                className="flex items-center justify-center p-2 bg-white/45 backdrop-blur-md text-slate-700 rounded-[16px] border-0 shadow-sm focus:outline-none hover:bg-white/70 cursor-pointer transition-colors relative"
              >
                <ReceiptText className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF5722] rounded-full border-2 border-white"></span>
              </button>
            )}

            {/* Language Selector */}
            <div className="relative group shrink-0">
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="appearance-none bg-white/45 backdrop-blur-md text-slate-700 rounded-[16px] pl-3.5 pr-8 py-2 text-xs font-semibold focus:outline-none focus:bg-white/70 cursor-pointer border-0 shadow-sm max-w-[90px] lg:max-w-[130px] text-ellipsis"
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Mobile Categories Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden flex items-center justify-center p-2 bg-white/45 backdrop-blur-md text-slate-700 rounded-[16px] border-0 shadow-sm focus:outline-none focus:bg-white/70 cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Hero Banner Banner */}
        <div className="block shrink-0">
          <div className="relative bg-gradient-to-r from-orange-50/50 to-orange-100/20 rounded-[24px] border border-orange-100/30 overflow-hidden shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between">
              {/* Left text info */}
              <div className="flex-1 p-5 text-left">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="text-green-500 text-xs">🌿</span>
                  <span className="text-[9.5px] font-semibold tracking-wider text-green-700 uppercase">{heroTagline}</span>
                  <span className="text-green-500 text-xs">🍃</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-serif text-slate-900 leading-tight mb-2">
                  Welcome to <span className="text-[#FF5722] italic font-semibold">{restaurantName}</span>
                </h1>
                <p className="text-[11px] text-slate-400 font-normal leading-normal max-w-sm mb-4">
                  {restaurantDescription}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">✓ {heroBadge1}</span>
                  <span className="text-[10px] font-semibold text-slate-500">✓ {heroBadge2}</span>
                </div>
              </div>

              {/* Right cover image */}
              <div className="hidden md:block w-full md:w-[260px] h-[180px] shrink-0 relative">
                <img
                  src={restaurantCover}
                  alt={restaurantName}
                  className="w-full h-full object-cover md:rounded-r-[24px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 lg:left-4 top-1/2 -translate-y-1/2 w-4 lg:w-4.5 h-4 lg:h-4.5 text-slate-400 z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Search for dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 lg:pl-11 pr-4 py-2.5 lg:py-3 bg-white/40 backdrop-blur-md rounded-[16px] lg:rounded-[24px] border-0 text-xs font-normal text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white/60 focus:ring-0 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all"
            />
          </div>
        </div>

        {/* Horizontal Category Tabs - Hidden on Mobile */}
        <div className="hidden lg:block shrink-0">
          <div className="flex items-center gap-1.5 lg:gap-2 overflow-x-auto no-scrollbar py-0.5 px-0.5">
            {availableCategories.map((catName) => {
              const Icon = getCategoryIcon(catName)
              const isActive = activeCategory === catName
              return (
                <button
                  key={catName}
                  onClick={() => setActiveCategory(catName)}
                  className={`flex items-center gap-1 lg:gap-1.5 px-3 lg:px-4.5 py-1.5 lg:py-2 rounded-[999px] text-[10px] lg:text-[11px] font-semibold border-0 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#FF5722]/90 text-white backdrop-blur-md shadow-sm'
                      : 'bg-white/45 backdrop-blur-md text-slate-600 hover:bg-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  <Icon className="w-3.5 lg:w-4 h-3.5 lg:h-4 shrink-0" />
                  {catName}
                </button>
              )
            })}
          </div>
        </div>

        {/* Grid Dishes Section */}
        <section className="flex-1 pb-2 lg:pb-6">
          <div className="flex items-center justify-between mb-3 lg:mb-4.5 gap-3">
            <div className="flex items-baseline gap-2 lg:block shrink-0">
              <h2 className="text-sm lg:text-base font-semibold text-slate-800 flex items-center gap-1.5">
                Our Menu
                <span className="text-[#FF5722] text-sm">🍕</span>
              </h2>
              <p className="text-[10px] lg:text-[11px] text-slate-400 font-normal">{filteredItems.length} dishes</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Mobile Filter Button */}
              <button 
                onClick={() => setIsFilterMenuOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white/50 backdrop-blur-md rounded-[12px] border-0 text-[11px] font-semibold text-slate-700 shadow-sm"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                Filter
              </button>

              {/* Desktop Sort Button */}
              <button className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-white/45 backdrop-blur-md rounded-[16px] border-0 text-xs font-semibold text-slate-600 hover:bg-white/70 transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                Popular Dishes
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 lg:gap-4">
            {filteredItems.map((item) => {
              const qty = cart[item.id] || 0
              const isVeg = item.is_veg || item.isVeg || (item.tags && item.tags.some((t: string) => t.toLowerCase().includes('veg')))
              
              // Seed custom badges for beautiful visual consistency
              const isBestseller = item.name.toLowerCase().includes('pizza') || item.name.toLowerCase().includes('burger')
              const isChefsPick = item.name.toLowerCase().includes('pasta') || item.name.toLowerCase().includes('ravioli')
              const isNew = item.name.toLowerCase().includes('cake') || item.name.toLowerCase().includes('soda')

              return (
                <div 
                  key={item.id} 
                  className="bg-white rounded-xl lg:rounded-2xl overflow-hidden border border-[#EEEEEE] flex flex-col h-full hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:translate-y-[-2px] transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Card Image banner click */}
                  <div className="relative aspect-[4/3] lg:aspect-[16/11] w-full overflow-hidden bg-slate-50 shrink-0">
                    <img
                      src={item.image_url || item.image || "https://csspicker.dev/api/image/?q=italian+dish&image_type=photo"}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Badge Overlays on Image */}
                    {isBestseller && (
                      <span className="absolute top-2.5 right-2.5 text-[8.5px] font-bold px-2 py-0.5 rounded-full text-white bg-[#F47B3E]">
                        Bestseller
                      </span>
                    )}
                    {isChefsPick && (
                      <span className="absolute top-2.5 right-2.5 text-[8.5px] font-bold px-2 py-0.5 rounded-full text-white bg-[#009688]">
                        Chef's Pick
                      </span>
                    )}
                    {isNew && (
                      <span className="absolute top-2.5 right-2.5 text-[8.5px] font-bold px-2 py-0.5 rounded-full text-white bg-[#4CAF50]">
                        New
                      </span>
                    )}
                  </div>

                  {/* Card Content details */}
                  <div className="p-2.5 lg:p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-[11px] lg:text-[13px] leading-tight mb-0.5 lg:mb-1 truncate">{item.name}</h3>
                      <p className="text-[10px] lg:text-[11px] text-slate-400 font-normal line-clamp-1 lg:line-clamp-2 leading-relaxed mb-2 lg:mb-3">{item.description || 'Freshly made authentic local dish.'}</p>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-bold text-slate-900 text-xs lg:text-sm">{formatPrice(item.price)}</span>

                      <div className="flex items-center gap-2">
                        {/* Veg / Non-Veg Symbol matching the image exactly */}
                        {isVeg ? (
                          <div className="w-4.5 h-4.5 border border-[#22C55E] flex items-center justify-center rounded-[3px] shrink-0 p-[2.5px]" title="Vegetarian">
                            <div className="w-2 h-2 bg-[#22C55E] rounded-full" />
                          </div>
                        ) : (
                          <div className="w-4.5 h-4.5 border border-red-500 flex items-center justify-center rounded-[3px] shrink-0 p-[2.5px]" title="Non-Vegetarian">
                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[7px] border-b-red-500" />
                          </div>
                        )}


                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

      </main>

      {/* ─── 3. RIGHT COLLAPSIBLE SMART ORDER PANEL (25% or 80px) — Desktop only ── */}
      <aside 
        className={`hidden lg:flex h-full bg-white/40 backdrop-blur-md rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.025)] flex-col transition-all duration-300 ease-in-out shrink-0 select-none text-left overflow-hidden z-40 border-0 ${
          isCartOpen ? 'w-[360px]' : 'w-[80px]'
        }`}
      >
        
        {/* COLLAPSED DEFAULT STATE (80px) */}
        {!isCartOpen && (
          <div 
            onClick={() => setIsCartExpanded(true)}
            className="h-full flex flex-col items-center justify-between py-6 cursor-pointer select-none"
          >
            {/* Bag icon with 0 count */}
            <div className="relative mt-2">
              <div className="w-11 h-11 bg-white/50 backdrop-blur-sm rounded-[16px] flex items-center justify-center text-[#FF5722]">
                <ShoppingBag className="w-5.5 h-5.5" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 bg-[#FF5722] text-white text-[9.5px] font-semibold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                0
              </span>
            </div>

            {/* Vertical text label */}
            <div className="flex-1 flex items-center justify-center">
              <span className="text-[12px] font-semibold text-slate-700 tracking-[0.25em] uppercase select-none" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                Your Order
              </span>
            </div>

            {/* Expand arrow */}
            <div className="w-7 h-7 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-[#FF5722] hover:bg-orange-50/50 transition-all">
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* EXPANDED FULL CART STATE (360px) */}
        {isCartOpen && (
          <div className="flex flex-col h-full bg-transparent transition-opacity duration-300">
            
            {/* Expanded Header */}
            <div className="p-5 border-b border-gray-100/50 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <ShoppingBag className="w-5 h-5 text-[#FF5722]" />
                  <h2 className="text-[15px] font-semibold text-slate-900">Your Order</h2>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">{cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items Added</span>
              </div>
              
              <div className="flex items-center gap-3">
                {cartItems.length > 0 && (
                  <button 
                    onClick={clearCart}
                    className="text-[11px] text-[#FF5722] font-semibold hover:text-[#E64A19] cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                {/* Collapse button trigger */}
                <button 
                  onClick={() => setIsCartExpanded(false)}
                  className="p-1 rounded-full bg-white/40 backdrop-blur-sm hover:bg-white/70 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Items List or Empty state */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-14 h-14 rounded-[20px] bg-orange-50/40 backdrop-blur-sm flex items-center justify-center text-[#FF5722]">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Your basket is empty</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-[200px] mx-auto">
                      Add some items from our menu to get started!
                    </p>
                  </div>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.image_url || item.image || "https://csspicker.dev/api/image/?q=italian+dish&image_type=photo"}
                      alt={item.name}
                      className="w-11 h-11 rounded-[12px] object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[12px] font-semibold text-slate-800 truncate">{item.name}</h4>
                      <p className="text-xs font-semibold text-slate-900 mt-0.5">{formatPrice(item.price)}</p>
                    </div>
                    
                    {/* Item count inside cart panel */}
                    <div className="flex items-center gap-1.5 bg-white/45 backdrop-blur-sm rounded-[16px] p-0.5 shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-5.5 h-5.5 flex items-center justify-center bg-white/60 hover:bg-white rounded-[12px] text-slate-500 border-0 cursor-pointer active:scale-95 transition-all"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-[11.5px] font-semibold w-3.5 text-center text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-5.5 h-5.5 flex items-center justify-center bg-white/60 hover:bg-white rounded-[12px] text-slate-500 border-0 cursor-pointer active:scale-95 transition-all"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations and CTA summary */}
            {subtotal > 0 && (
              <div className="p-5 border-t border-gray-100/50 space-y-4 shrink-0 bg-white/30 backdrop-blur-md">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    <span>Taxes & Charges</span>
                    <span className="font-semibold text-slate-800">{formatPrice(taxes)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200/50">
                    <span className="text-[13px] font-semibold text-slate-800">Total Amount</span>
                    <span className="text-[15px] font-semibold text-[#FF5722]">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Table Number Input */}
                <div className="flex flex-col gap-1.5 pb-2">
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Table No.</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={tableNo}
                    onChange={(e) => setTableNo(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 12"
                    className="w-full bg-white border border-gray-200 rounded-[12px] px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-all"
                  />
                </div>

                {/* Cooking Instructions Input */}
                <div className="flex flex-col gap-1.5 pb-2">
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Cooking Instructions</label>
                  <input 
                    type="text" 
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. extra spicy, no onion..."
                    className="w-full bg-white border border-gray-200 rounded-[12px] px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-all"
                  />
                </div>

                {/* Checkout CTA */}
                <button 
                  onClick={handlePlaceOrder}
                  disabled={orderingStatus !== 'idle'}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#FF5722]/90 hover:bg-[#FF5722] text-white rounded-[16px] font-semibold shadow-sm text-xs cursor-pointer active:scale-[0.98] transition-all backdrop-blur-md border-0 disabled:opacity-50"
                >
                  {orderingStatus === 'loading' ? 'Placing Order...' : orderingStatus === 'error' ? 'Failed' : 'Place Order'}
                  {orderingStatus === 'idle' && <ArrowRight className="w-4 h-4" />}
                </button>

                {/* Promo Code section */}
                <div className="p-3 bg-orange-50/40 backdrop-blur-sm rounded-[16px] flex items-center justify-between select-none border-0 shadow-sm">
                  <div className="flex items-center gap-2 text-[#FF5722]">
                    <Tag className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[10px] font-semibold">Have a promo code?</span>
                  </div>
                  <button className="text-[10px] text-[#FF5722] font-semibold hover:text-[#E64A19] cursor-pointer">
                    Apply
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </aside>

      {/* ─── 4. BOTTOM MOBILE CONTROLS ─── */}
      <AnimatePresence>
        {cartItems.length > 0 && (
          <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-full px-4 select-none">
            <motion.button
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={() => setIsCartExpanded(true)}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-[#FF5722] text-white rounded-2xl shadow-[0_8px_30px_rgba(255,87,34,0.35)] font-semibold text-sm transition-all border-0"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <span>{cartItems.reduce((a, i) => a + i.quantity, 0)} items</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>{formatPrice(total)}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 4b. MOBILE FULL-SCREEN CART DRAWER ─── */}
      <AnimatePresence>
        {isCartExpanded && (
          <div className="lg:hidden fixed inset-0 z-[70]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setIsCartExpanded(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] max-h-[85vh] flex flex-col shadow-2xl"
            >
              {/* Mobile Cart Header */}
              <div className="p-4 border-b border-gray-100/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#FF5722]" />
                  <h2 className="text-[15px] font-semibold text-slate-900">Your Order</h2>
                  <span className="text-[11px] text-slate-400 font-semibold">({cartItems.reduce((a, i) => a + i.quantity, 0)} items)</span>
                </div>
                <div className="flex items-center gap-3">
                  {cartItems.length > 0 && (
                    <button onClick={clearCart} className="text-[11px] text-[#FF5722] font-semibold cursor-pointer">Clear</button>
                  )}
                  <button onClick={() => setIsCartExpanded(false)} className="p-1.5 rounded-full bg-slate-100 text-slate-500 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-[20px] bg-orange-50 flex items-center justify-center text-[#FF5722] mb-4">
                      <ShoppingBag className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">Your basket is empty</p>
                    <p className="text-xs text-slate-400 mt-1">Add some items from our menu!</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.image_url || item.image || "https://csspicker.dev/api/image/?q=dish&image_type=photo"}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-semibold text-slate-800 truncate">{item.name}</h4>
                        <p className="text-xs font-semibold text-slate-900 mt-0.5">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 rounded-full p-0.5">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-full text-slate-500 shadow-sm cursor-pointer active:scale-95">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold w-4 text-center text-slate-800">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-full text-slate-500 shadow-sm cursor-pointer active:scale-95">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Mobile Cart Footer */}
              {subtotal > 0 && (
                <div className="p-4 border-t border-gray-100 space-y-3 shrink-0 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Taxes & Charges</span>
                    <span className="font-semibold text-slate-800">{formatPrice(taxes)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm font-semibold text-slate-800">Total</span>
                    <span className="text-base font-semibold text-[#FF5722]">{formatPrice(total)}</span>
                  </div>
                  
                  {/* Table Number Input */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Table No.</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={tableNo}
                      onChange={(e) => setTableNo(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 12"
                      className="w-full bg-white border border-gray-200 rounded-[12px] px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-all"
                    />
                  </div>

                  {/* Cooking Instructions Input */}
                  <div className="flex flex-col gap-1.5 pb-1">
                    <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Cooking Instructions</label>
                    <input 
                      type="text" 
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="e.g. extra spicy, no onion..."
                      className="w-full bg-white border border-gray-200 rounded-[12px] px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-all"
                    />
                  </div>

                  <button 
                    onClick={handlePlaceOrder}
                    disabled={orderingStatus !== 'idle'}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FF5722] text-white rounded-2xl font-semibold text-sm shadow-sm cursor-pointer active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {orderingStatus === 'loading' ? 'Placing Order...' : orderingStatus === 'error' ? 'Failed' : 'Place Order'}
                    {orderingStatus === 'idle' && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 4c. MOBILE CATEGORIES SIDEBAR DRAWER ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[70] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-[75%] max-w-[320px] h-full bg-white shadow-2xl flex flex-col rounded-l-[24px] overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100/50 flex items-center justify-between">
                <span className="text-[18px] font-serif italic text-[#FF5722] font-semibold">Bella Italia</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-full bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Menu Categories</h3>
                {availableCategories.map((catName) => {
                  const Icon = getCategoryIcon(catName)
                  const isActive = activeCategory === catName
                  const count = catName === 'All Items' 
                    ? menuItems.length 
                    : menuItems.filter(i => i.category === catName).length

                  return (
                    <button
                      key={catName}
                      onClick={() => {
                        setActiveCategory(catName)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-[16px] text-[13px] font-semibold transition-all cursor-pointer border-0 ${
                        isActive
                          ? 'bg-[#FF5722]/10 text-[#FF5722]'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-[#FF5722]' : 'text-slate-400'}`} />
                        <span className="truncate">{catName}</span>
                      </div>
                      <span className={`text-[12px] font-semibold ${isActive ? 'text-[#FF5722]' : 'text-slate-400'}`}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
              
              <div className="p-5 border-t border-gray-100/50 space-y-3 bg-slate-50/30">
                 {renderSocials()}
                 <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-[#FFE0D3] rounded-[16px] text-xs text-[#FF5722] font-semibold shadow-sm">
                  <Headphones className="w-4 h-4 text-[#FF5722]" />
                  Call Staff
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-[#D1E7DD] rounded-[16px] text-xs text-[#198754] font-semibold shadow-sm">
                  <span className="text-[#198754] text-[13px] leading-none">💬</span>
                  Share Feedback
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── FILTER DRAWER ─── */}
      <AnimatePresence>
        {isFilterMenuOpen && (
          <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setIsFilterMenuOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-w-sm max-h-[85vh] bg-white/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50 flex flex-col rounded-[24px] overflow-hidden"
            >
              <div className="p-4 lg:p-5 border-b border-gray-200/40 flex items-center justify-between">
                <span className="text-[16px] lg:text-[18px] font-semibold text-slate-800">Filters</span>
                <button 
                  onClick={() => setIsFilterMenuOpen(false)}
                  className="p-1.5 rounded-full bg-slate-100/50 hover:bg-slate-200/50 text-slate-500 cursor-pointer border-0 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-6 no-scrollbar">
                
                {/* Diet */}
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Dietary Preference</h4>
                  <div className="flex flex-wrap gap-2">
                    {['veg', 'non-veg'].map(filter => {
                      const isActive = activeFilters.includes(filter)
                      return (
                        <button
                          key={filter}
                          onClick={() => setActiveFilters(prev => isActive ? prev.filter(f => f !== filter) : [...prev, filter])}
                          className={`px-3 py-1.5 rounded-[12px] text-[11px] font-semibold transition-all border-0 shadow-[0_4px_20px_rgba(0,0,0,0.02)] cursor-pointer ${isActive ? 'bg-[#FF5722] text-white shadow-[#FF5722]/20' : 'bg-white/60 text-slate-600 hover:bg-white'}`}
                        >
                          {filter === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Cuisine */}
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Cuisine</h4>
                  <div className="flex flex-wrap gap-2">
                    {['indian', 'chinese'].map(filter => {
                      const isActive = activeFilters.includes(filter)
                      return (
                        <button
                          key={filter}
                          onClick={() => setActiveFilters(prev => isActive ? prev.filter(f => f !== filter) : [...prev, filter])}
                          className={`px-3 py-1.5 rounded-[12px] text-[11px] font-semibold transition-all border-0 shadow-[0_4px_20px_rgba(0,0,0,0.02)] cursor-pointer ${isActive ? 'bg-[#FF5722] text-white shadow-[#FF5722]/20' : 'bg-white/60 text-slate-600 hover:bg-white'}`}
                        >
                          {filter === 'indian' ? 'Indian' : 'Chinese'}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Course */}
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Course</h4>
                  <div className="flex flex-wrap gap-2">
                    {['starter', 'maincourse'].map(filter => {
                      const isActive = activeFilters.includes(filter)
                      return (
                        <button
                          key={filter}
                          onClick={() => setActiveFilters(prev => isActive ? prev.filter(f => f !== filter) : [...prev, filter])}
                          className={`px-3 py-1.5 rounded-[12px] text-[11px] font-semibold transition-all border-0 shadow-[0_4px_20px_rgba(0,0,0,0.02)] cursor-pointer ${isActive ? 'bg-[#FF5722] text-white shadow-[#FF5722]/20' : 'bg-white/60 text-slate-600 hover:bg-white'}`}
                        >
                          {filter === 'starter' ? 'Starter' : 'Main Course'}
                        </button>
                      )
                    })}
                  </div>
                </div>

              </div>

              <div className="p-4 lg:p-5 border-t border-gray-200/40 flex gap-2.5 bg-slate-50/20 backdrop-blur-md">
                 <button 
                   onClick={() => setActiveFilters([])}
                   className="flex-1 py-2.5 bg-white/60 hover:bg-white border border-gray-200/50 rounded-[14px] text-xs text-slate-600 font-semibold shadow-sm cursor-pointer transition-colors"
                 >
                  Clear
                </button>
                <button 
                  onClick={() => setIsFilterMenuOpen(false)}
                  className="flex-[2] py-2.5 bg-[#FF5722] border-0 text-white rounded-[14px] text-xs font-semibold shadow-[0_4px_20px_rgba(255,87,34,0.3)] cursor-pointer hover:bg-[#E64A19] transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 5. SINGLE PAGE POPUP MODAL ────────────────────────── */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 cursor-pointer"
            />
            
            <motion.div 
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-[700px] rounded-[24px] bg-[#1C1C1E]/95 shadow-2xl z-10 flex flex-col md:flex-row overflow-hidden border border-white/10 backdrop-blur-xl"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-3 md:top-4 right-3 md:right-4 z-50 h-8 w-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center shadow-sm backdrop-blur-md transition-all active:scale-95 cursor-pointer border border-white/10"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Left Side (Image & Price) */}
              <div className="w-full md:w-[45%] p-4 flex flex-col gap-3">
                <div className="w-full aspect-square rounded-[16px] overflow-hidden">
                  <img 
                    src={selectedItem.image_url || selectedItem.image || "https://csspicker.dev/api/image/?q=food&image_type=photo"} 
                    alt={selectedItem.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex flex-col px-1">
                  <span className="text-white text-2xl font-bold">{formatPrice(selectedItem.price)}</span>
                  <span className="text-[#8E8E93] text-[10px]">Inclusive of taxes</span>
                </div>
              </div>

              {/* Right Side (Details & CTA) */}
              <div className="w-full md:w-[55%] p-4 md:pl-2 flex flex-col">
                 {/* Tag */}
                 <div className="mb-3">
                    {(selectedItem.is_veg || selectedItem.isVeg || (selectedItem.tags && selectedItem.tags.some((t: string) => t.toLowerCase().includes('veg')))) ? (
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B2A1E] text-[#4CD964] text-[10px] font-bold border border-[#27402A]">
                         <Leaf className="w-3 h-3" /> 100% VEG
                       </span>
                    ) : (
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2A1B1B] text-[#FF3B30] text-[10px] font-bold border border-[#402727]">
                         <Beef className="w-3 h-3" /> NON-VEG
                       </span>
                    )}
                 </div>

                 {/* Title & Description */}
                 <h2 className="text-white text-2xl md:text-3xl font-bold leading-tight mb-3 tracking-tight">
                   {selectedItem.name}
                 </h2>
                 
                 <p className="text-[#8E8E93] text-xs leading-relaxed mb-6 md:mb-8 line-clamp-3 md:line-clamp-none">
                   {selectedItem.description || 'A timeless classic with the perfect balance of fresh & simple ingredients.'}
                 </p>

                 {/* Features grid */}
                 <div className="grid grid-cols-3 gap-2 border-y border-white/5 py-4 mb-6 md:mb-auto">
                    <div className="flex flex-col items-center justify-center text-center">
                       <Leaf className="w-4 h-4 md:w-5 md:h-5 text-[#4CD964] mb-1.5" />
                       <span className="text-[#8E8E93] text-[9px] md:text-[10px]">{(selectedItem.is_veg || selectedItem.isVeg || (selectedItem.tags && selectedItem.tags.some((t: string) => t.toLowerCase().includes('veg')))) ? '100% Veg' : 'Non-Veg'}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center border-l border-white/5">
                       <ChefHat className="w-4 h-4 md:w-5 md:h-5 text-[#FFCC00] mb-1.5" />
                       <span className="text-[#8E8E93] text-[9px] md:text-[10px]">Chef's Special</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center border-l border-white/5">
                       <Flame className="w-4 h-4 md:w-5 md:h-5 text-[#FF3B30] mb-1.5" />
                       <span className="text-[#8E8E93] text-[9px] md:text-[10px]">Mildly Spicy</span>
                    </div>
                 </div>

                 {/* CTA */}
                 <div className="mt-auto">
                    <button 
                       onClick={() => {
                         updateQuantity(selectedItem.id, 1)
                         setSelectedItem(null)
                         setIsCartExpanded(true)
                       }}
                       className="w-full bg-[#FF5722] hover:bg-[#E64A19] text-white py-3 md:py-4 rounded-[12px] md:rounded-full font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(255,87,34,0.3)] transition-all cursor-pointer border-0 active:scale-[0.98]"
                    >
                       <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                       <span>ORDER NOW</span>
                       <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 6. SUCCESS CONFIRMATION MODAL ────────────────────────── */}
      <AnimatePresence>
        {orderingStatus === 'success' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[24px] p-6 max-w-[320px] w-full text-center shadow-2xl flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-[#E8F8EE] rounded-full flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-[#1B8E4C] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(27,142,76,0.3)]">
                  <Check className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Order Confirmed!</h3>
              <p className="text-sm text-slate-500 font-semibold mb-6">
                Your order has been placed and the staff is reaching to confirm that order in 1 minute.
              </p>
              <button
                onClick={() => setOrderingStatus('idle')}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-[16px] transition-colors cursor-pointer border-0"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 7. REVIEW MODAL (AFTER ORDER SUCCESS) ────────────────────── */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[24px] p-6 max-w-[340px] w-full text-center shadow-2xl flex flex-col items-center relative overflow-hidden"
            >
              <button 
                onClick={() => setShowReviewModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-14 h-14 bg-[#FFF3ED] rounded-full flex items-center justify-center mb-4 mt-2">
                <Star className="w-7 h-7 text-[#FFCC00] fill-[#FFCC00]" />
              </div>
              
              <h3 className="text-[20px] font-bold text-slate-800 mb-1">How was your order?</h3>
              <p className="text-[12px] text-slate-500 font-medium mb-6">
                Your feedback helps us improve and serve you better.
              </p>
              
              {/* Star Rating */}
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setReviewHover(star)}
                    onMouseLeave={() => setReviewHover(0)}
                    onClick={() => setReviewRating(star)}
                    className="cursor-pointer transition-transform hover:scale-110 active:scale-90 p-1"
                  >
                    <Star 
                      className={`w-8 h-8 transition-colors ${
                        (reviewHover || reviewRating) >= star 
                          ? 'text-[#FFCC00] fill-[#FFCC00]' 
                          : 'text-slate-200 fill-transparent'
                      }`} 
                    />
                  </button>
                ))}
              </div>
              
              <AnimatePresence>
                {reviewRating > 0 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="w-full flex flex-col gap-3 overflow-hidden"
                  >
                    <textarea 
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Any additional comments? (Optional)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-3 text-[13px] text-slate-700 outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-all resize-none h-[80px]"
                    />
                    <button
                      onClick={handleReviewSubmit}
                      disabled={submittingReview}
                      className="w-full py-3.5 bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-[14px] rounded-[14px] shadow-[0_4px_15px_rgba(255,87,34,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {submittingReview ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                      ) : (
                        'Submit Review'
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── ORDER HISTORY MODAL ─── */}
      <AnimatePresence>
        {showOrderHistory && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOrderHistory(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full md:w-[400px] h-full bg-[#FAFAFA] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 bg-white border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-[#FF5722] flex items-center justify-center">
                    <ReceiptText className="w-4 h-4" />
                  </div>
                  <h2 className="text-[17px] font-bold text-slate-800">Your Orders</h2>
                </div>
                <button 
                  onClick={() => setShowOrderHistory(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {orderHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3 pb-10">
                    <ReceiptText className="w-12 h-12 text-slate-200" />
                    <p className="text-sm font-semibold text-slate-500">No recent orders found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderHistory.map((order, idx) => (
                      <div key={order.id || idx} className="bg-white border border-gray-100 rounded-[16px] p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Order ID • {order.id.slice(-6)}</p>
                            <p className="text-[13px] font-semibold text-slate-700">
                              {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-block px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-md uppercase">Received</span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          {order.items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-start gap-3">
                              <span className="text-[13px] font-medium text-slate-600 flex-1">
                                <span className="text-slate-400 mr-1">{item.quantity}x</span> {item.name}
                              </span>
                              <span className="text-[13px] font-semibold text-slate-700">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {order.instructions && (
                          <div className="mb-3 px-3 py-2 bg-orange-50/50 rounded-lg border border-orange-100/50">
                            <p className="text-[11px] font-semibold text-orange-800">
                              <span className="text-orange-500 mr-1">Note:</span>
                              {order.instructions}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                          <span className="text-[12px] font-bold text-slate-500">Total Paid</span>
                          <span className="text-[15px] font-bold text-[#FF5722]">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
