'use client'

import React, { useState } from 'react'
import { 
  Pencil, 
  MapPin, 
  Star, 
  Copy, 
  Check, 
  Phone, 
  Mail, 
  Utensils, 
  Clock, 
  Clipboard,
  Users,
  ShoppingBag,
  IndianRupee,
  QrCode,
  Download,
  X,
  Link2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProfileClientProps {
  restaurant: any
  publicMenuUrl: string
  qrCodeUrl: string
  visitors: number
  orders: number
  revenue: number
  scans: number
  reviewCount: number
  avgRating: number
}

export default function ProfileClient({
  restaurant,
  publicMenuUrl,
  qrCodeUrl,
  visitors,
  orders,
  revenue,
  scans,
  reviewCount,
  avgRating
}: ProfileClientProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicMenuUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const [isQRModalOpen, setIsQRModalOpen] = useState(false)

  const handleDownloadQR = async () => {
    try {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        
        // Fill white background just in case the QR code has transparency
        if (ctx) {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
        }
        
        canvas.toBlob((blob) => {
          if (!blob) return
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          const safeName = (restaurant?.restaurant_name || 'restaurant').replace(/\s+/g, '_').toLowerCase()
          link.download = `${safeName}_menu_qr.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          setIsQRModalOpen(false)
        }, 'image/png')
      }
      img.onerror = () => {
        // Fallback if CORS fails: just open in new tab
        window.open(qrCodeUrl, '_blank')
        setIsQRModalOpen(false)
      }
      img.src = `${qrCodeUrl}&t=${new Date().getTime()}`
    } catch (err) {
      console.error('Failed to download QR code', err)
      window.open(qrCodeUrl, '_blank')
      setIsQRModalOpen(false)
    }
  }

  // Fallbacks for display
  const name = restaurant?.restaurant_name || 'Bella Italia'
  const cuisine = restaurant?.restaurant_category || 'Italian'
  const phone = restaurant?.restaurant_phone || '+91 98765 43210'
  const email = restaurant?.restaurant_email || 'bella@bellaitalia.com'
  const address = restaurant?.restaurant_address || 'Nashik, Maharashtra'
  const openingHours = restaurant?.opening_hours || '10:00 AM – 11:00 PM'
  
  // Cover and Logo with fallbacks
  const coverImage = restaurant?.restaurant_cover || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80'
  const logoImage = restaurant?.restaurant_logo || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=150&q=80'

  const displayVisitors = visitors > 0 ? visitors.toLocaleString() : '12,482'
  const displayOrders = orders > 0 ? orders.toLocaleString() : '3,214'
  const displayRevenue = revenue > 0 ? `₹${revenue.toLocaleString()}` : '₹2,40,980'
  const displayScans = scans > 0 ? scans.toLocaleString() : '6,298'

  const socialLinks = restaurant?.social_links || {}
  const allPlatforms = [
    { 
      id: 'facebook',
      name: 'Facebook', 
      logoBg: 'bg-[#1877F2]/10 text-[#1877F2]', 
      logoName: 'FB',
      desc: 'Social Marketing'
    },
    { 
      id: 'instagram',
      name: 'Instagram', 
      logoBg: 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white', 
      logoName: 'IG',
      desc: 'photo platform'
    },
    { 
      id: 'whatsapp',
      name: 'WhatsApp', 
      logoBg: 'bg-[#22C55E]/10 text-[#22C55E]', 
      logoName: 'WA',
      desc: 'Order Support'
    },
    { 
      id: 'google',
      name: 'Google Maps', 
      logoBg: 'bg-slate-100 text-[#4285F4]', 
      logoName: 'G',
      desc: 'Location listing'
    }
  ]
  const connectedPlatforms = allPlatforms.filter(p => socialLinks[p.id])

  return (
    <div className="w-full bg-[#FAFAFA] select-none animate-fadeIn">
      {/* 1. COVER + PROFILE HEADER CARD */}
      <div className="bg-white border border-[#EEEEEE] border-t-0 rounded-b-[12px] relative shadow-sm mb-8">
        {/* Cover Photo moved to DashboardLayoutClient for LCP optimization */}

        {/* Info bar inside the same card */}
        <div className="bg-white px-8 pb-6 pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
          
          {/* Avatar (Overlapping cover edge by 30px) */}
          <div className="absolute -top-[30px] left-8 z-10">
            <img 
              src={logoImage} 
              alt="Restaurant Logo" 
              className="w-[70px] h-[70px] rounded-full object-cover border-[3px] border-white shadow-sm bg-white"
            />
          </div>

          {/* Restaurant Details (Pushed right to account for overlapping avatar) */}
          <div className="pl-0 md:pl-24 pt-8 md:pt-0 flex-1 text-left flex items-center min-h-[48px]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 gap-y-1">
              <span className="text-[20px] font-bold text-[#1A1A1A] leading-none">
                {name}
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#6B7280] font-medium leading-none">
                <span>{cuisine} Cuisine</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#6B7280] stroke-[1.5]" />
                  {address}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#F47B3E] text-[#F47B3E] stroke-0" />
                  <strong className="text-[#F47B3E] font-bold">{avgRating > 0 ? avgRating : '—'}</strong>
                  <span className="text-[#6B7280]">({reviewCount > 0 ? `${reviewCount.toLocaleString()} Review${reviewCount !== 1 ? 's' : ''}` : 'No Reviews'})</span>
                </span>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="shrink-0 self-end md:self-center">
            <button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('spaNavigate', { detail: { tab: 'settings', href: '/dashboard/settings' } }))
              }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#F47B3E] text-[#F47B3E] hover:bg-[#F47B3E]/5 rounded-[8px] text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 stroke-[1.5]" />
              Edit Profile
            </button>
          </div>

        </div>
      </div>

      {/* 2. TWO COLUMN LAYOUT (Left 45%, Right 55%, 24px gap) */}
      <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6 text-left mb-12">
        
        {/* LEFT COLUMN: Restaurant Details & QR Access */}
        <div className="flex flex-col gap-6">
          
          {/* Restaurant Information */}
          <div>
            <h3 className="text-[#1A1A1A] font-bold text-[12px] tracking-[0.08em] uppercase mb-4">
              RESTAURANT INFORMATION
            </h3>
            
            <div className="bg-white border border-[#EEEEEE] rounded-[12px] overflow-hidden shadow-sm">
              {[
                { label: 'Restaurant Name', value: name, icon: Clipboard },
                { label: 'Cuisine', value: `${cuisine} Cuisine`, icon: Utensils },
                { label: 'Phone Number', value: phone, icon: Phone },
                { label: 'Email', value: email, icon: Mail },
                { label: 'Address', value: address, icon: MapPin },
                { label: 'Opening Hours', value: openingHours, icon: Clock }
              ].map((row, idx) => {
                const Icon = row.icon
                return (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between px-5 h-[52px] border-b border-[#EEEEEE] last:border-b-0 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-7 h-7 rounded bg-[#F47B3E]/10 text-[#F47B3E] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 stroke-[1.5]" />
                      </div>
                      <span className="text-[13px] font-medium text-[#6B7280] ml-3">{row.label}</span>
                    </div>
                    <span className="text-[13px] font-bold text-[#1A1A1A] text-right truncate max-w-[220px]">
                      {row.value}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* QR Menu Access */}
          <div>
            <h3 className="text-[#1A1A1A] font-bold text-[12px] tracking-[0.08em] uppercase mb-4">
              QR MENU ACCESS
            </h3>
            
            <div className="bg-white border border-[#EEEEEE] rounded-[12px] p-5 shadow-sm">
              <h4 className="text-[13px] font-bold text-[#1A1A1A] mb-4">
                Your menu is just a scan away
              </h4>
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="shrink-0 bg-slate-50 border border-slate-100 p-2 rounded-[8px] flex items-center justify-center">
                  <img 
                    src={qrCodeUrl} 
                    alt="Menu QR Code" 
                    className="w-16 h-16 object-contain mix-blend-multiply"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-[8px] text-[11px] font-medium text-slate-500 truncate font-mono select-all">
                    {publicMenuUrl}
                  </div>
                  
                  <button 
                    onClick={() => setIsQRModalOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#F47B3E] hover:bg-[#e06b2f] text-white rounded-[8px] text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download QR
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Metrics, Gallery, Platforms */}
        <div className="flex flex-col gap-6">
          
          {/* Performance Snapshot */}
          <div>
            <h3 className="text-[#1A1A1A] font-bold text-[12px] tracking-[0.08em] uppercase mb-4">
              PERFORMANCE SNAPSHOT
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'VISITORS', value: displayVisitors, icon: Users, change: '+7.08%' },
                { label: 'ORDERS', value: displayOrders, icon: ShoppingBag, change: '+8.35%' },
                { label: 'REVENUE', value: displayRevenue, icon: IndianRupee, change: '+6.29%' },
                { label: 'SCANS', value: displayScans, icon: QrCode, change: '+14.2%' }
              ].map((card, idx) => {
                const Icon = card.icon
                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      if (card.label === 'ORDERS' && typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('ordersModalToggle', { detail: true }))
                      }
                    }}
                    className={`bg-white border border-[#EEEEEE] rounded-[12px] p-4 flex flex-col items-center text-center justify-center shadow-sm ${card.label === 'ORDERS' ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#F47B3E]/10 text-[#F47B3E] flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4 stroke-[1.5]" />
                    </div>
                    <span className="text-[24px] font-bold text-[#1A1A1A] tracking-tight leading-none mb-1">
                      {card.value}
                    </span>
                    <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                      {card.label}
                    </span>
                    <span className="text-[12px] font-bold text-[#22C55E] flex items-center gap-0.5">
                      ↑ {card.change}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Restaurant Gallery */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#1A1A1A] font-bold text-[12px] tracking-[0.08em] uppercase">
                RESTAURANT GALLERY
              </h3>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('spaNavigate', { detail: { tab: 'menu', href: '/dashboard/menu' } }))}
                className="text-[#F47B3E] font-bold text-xs hover:underline cursor-pointer"
              >
                View
              </button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-1">
              {[
                'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80',
                'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=200&q=80',
                'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=200&q=80'
              ].map((imgUrl, index) => (
                <div key={index} className="w-[120px] h-[120px] rounded-[8px] overflow-hidden border border-[#EEEEEE] shrink-0 bg-white">
                  <img 
                    src={imgUrl} 
                    alt={`Gallery ${index + 1}`} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Connected Platforms */}
          <div>
            <h3 className="text-[#1A1A1A] font-bold text-[12px] tracking-[0.08em] uppercase mb-4">
              CONNECTED PLATFORMS
            </h3>
            
            {connectedPlatforms.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {connectedPlatforms.map((plat, idx) => (
                  <div 
                    key={idx}
                    className="bg-white border border-[#EEEEEE] rounded-[12px] p-4 flex flex-col items-center text-center justify-center min-h-[120px] shadow-sm"
                  >
                    <div className={`w-8 h-8 rounded-full ${plat.logoBg} flex items-center justify-center font-bold text-xs select-none shadow-sm mb-3`}>
                      {plat.logoName}
                    </div>
                    
                    <span className="text-[13px] font-bold text-[#1A1A1A] mb-1">
                      {plat.name}
                    </span>
                    <span className="text-[11px] text-[#6B7280] leading-none">
                      {plat.desc}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#EEEEEE] border-dashed rounded-[12px] h-auto lg:h-[158px] py-6 lg:py-0 flex flex-col items-center text-center justify-center shadow-sm px-6">
                <Link2 className="w-5 h-5 text-slate-300 mb-2 shrink-0" />
                <h4 className="text-[13px] font-bold text-[#1A1A1A] mb-1 shrink-0">No Platforms Connected</h4>
                <p className="text-[11px] text-[#6B7280] max-w-[280px] mb-3 shrink-0 line-clamp-2">
                  You haven't connected any platforms yet. Connect them from settings.
                </p>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('spaNavigate', { detail: { tab: 'settings', href: '/dashboard/settings' } }))}
                  className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-[#1A1A1A] text-white rounded-[8px] text-[11px] font-bold transition-all shadow-sm cursor-pointer hover:bg-black shrink-0"
                >
                  <Link2 className="w-3 h-3" />
                  Connect Now
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* QR Code Download Modal */}
      <AnimatePresence>
        {isQRModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Download QR Code</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">Ready for print or social media</p>
                </div>
                <button 
                  onClick={() => setIsQRModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center mb-8">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-48 h-48 mix-blend-multiply"
                />
              </div>

              <button
                onClick={handleDownloadQR}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Download className="w-5 h-5" />
                Confirm Download
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
