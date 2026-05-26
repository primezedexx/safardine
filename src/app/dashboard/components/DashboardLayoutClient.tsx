'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, Utensils, BarChart3, Store, Settings, Bell, ChevronDown,
  X, QrCode, Sparkles, Heart, Zap, Trash2, CheckCircle2, Calendar, Check, ShoppingBag,
  User, CreditCard, Link2, Clock, Megaphone, HelpCircle, MessageSquare, LogOut, Users, Loader2
} from 'lucide-react'
import { signout } from '@/app/(auth)/actions'
import { createClient } from '@/lib/supabase/client'
import OrdersHistoryModal from './OrdersHistoryModal'
import DashboardClient from './DashboardClient'
import dynamic from 'next/dynamic'
import OneSignalProvider from '@/components/providers/OneSignalProvider'
import NotificationPromptModal from '@/components/ui/NotificationPromptModal'

// TabSkeleton — matches the height of the real content to prevent CLS
const TabSkeleton = () => (
  <div className="animate-pulse space-y-4 p-4 w-full">
    <div className="h-32 bg-gray-200 rounded-lg w-full" />
    <div className="h-24 bg-gray-200 rounded-lg w-full" />
    <div className="h-24 bg-gray-200 rounded-lg w-full" />
  </div>
)

// SPA Tab Components (Hidden tabs are lazy loaded to drop bundle size but SSR is enabled for direct routing)
const MenuClient = dynamic(() => import('../menu/components/MenuClient'), { loading: () => <TabSkeleton /> })
const AnalyticsClient = dynamic(() => import('../analytics/components/AnalyticsClient'), { loading: () => <TabSkeleton /> })
const ProfileClient = dynamic(() => import('../profile/components/ProfileClient'), { loading: () => <TabSkeleton /> })
const SettingsClient = dynamic(() => import('../settings/components/SettingsClient'), { loading: () => <TabSkeleton /> })
const OnboardingPending = dynamic(() => import('./OnboardingPending'), { loading: () => <TabSkeleton /> })

interface DashboardLayoutClientProps {
  children: React.ReactNode
  restaurant: any
  userEmail: string
  trialBanner: React.ReactNode
  dashboardData?: any
  menuData?: any
  analyticsData?: any
}

export default function DashboardLayoutClient({
  children,
  restaurant,
  userEmail,
  trialBanner,
  dashboardData,
  menuData,
  analyticsData
}: DashboardLayoutClientProps) {
  const pathname = usePathname()
  const router = useRouter()

  const restaurantName = restaurant?.restaurant_name || 'Bella Italia'
  const restaurantLogo = restaurant?.restaurant_logo || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=150&q=80'

  // Navigation tabs mapping
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu Items', href: '/dashboard/menu', icon: Utensils },
    { id: 'analytics', label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { id: 'profile', label: 'Restaurant Profile', href: '/dashboard/profile', icon: Store },
    { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  // Check which tab is active
  const getInitialTab = (): 'dashboard' | 'menu' | 'analytics' | 'profile' | 'settings' | 'other' => {
    if (pathname === '/dashboard' || pathname === '/demo') return 'dashboard'
    if (pathname === '/dashboard/menu') return 'menu'
    if (pathname === '/dashboard/analytics') return 'analytics'
    if (pathname === '/dashboard/profile') return 'profile'
    if (pathname === '/dashboard/settings') return 'settings'
    return 'other'
  }

  const [activeTab, setActiveTab] = useState<'dashboard' | 'menu' | 'analytics' | 'profile' | 'settings' | 'other'>(getInitialTab())

  // Keep activeTab in sync with Next.js navigation
  useEffect(() => {
    setActiveTab(getInitialTab())
    if (process.env.NODE_ENV === 'development') {
      console.log('Router State Consistency Check:', {
        pathname: pathname,
        browser: typeof window !== 'undefined' ? window.location.pathname : null
      })
    }
  }, [pathname])

  // Multi-tab logout synchronization
  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [router])


  // ─── Notification States ─────────────────────────────────────────
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [activeNotifTab, setActiveNotifTab] = useState<'All' | 'Unread' | 'Updates' | 'System'>('All')
  const [showNotifSettings, setShowNotifSettings] = useState(false)
  
  const [notifications, setNotifications] = useState<any[]>([])
  const [clearedAt, setClearedAt] = useState<number>(0)
  
  useEffect(() => {
    const stored = localStorage.getItem('notificationsClearedAt')
    if (stored) setClearedAt(Number(stored))
  }, [])
  
  const [selectedOrderNotification, setSelectedOrderNotification] = useState<any | null>(null)
  const [selectedOrderItems, setSelectedOrderItems] = useState<any[]>([])
  const [selectedOrderInstructions, setSelectedOrderInstructions] = useState("")
  const [isLoadingOrderItems, setIsLoadingOrderItems] = useState(false)
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false)
  const [isBottomNavHidden, setIsBottomNavHidden] = useState(false)

  useEffect(() => {
    const handleHideNav = (e: any) => {
      setIsBottomNavHidden(e.detail)
    }
    window.addEventListener('hideBottomNav', handleHideNav)
    return () => window.removeEventListener('hideBottomNav', handleHideNav)
  }, [])

  useEffect(() => {
    const handleOrdersModalToggle = (e: any) => {
      setIsOrdersModalOpen(e.detail)
    }
    window.addEventListener('ordersModalToggle', handleOrdersModalToggle)
    return () => window.removeEventListener('ordersModalToggle', handleOrdersModalToggle)
  }, [])

  const supabase = createClient()
  
  const audioContextRef = React.useRef<AudioContext | null>(null)

  // Format timestamp to "Xm ago"
  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return ''
    const diff = Date.now() - new Date(dateString).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  // Initialize AudioContext on first user interaction to bypass mobile autoplay policies
  React.useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
        }
      }
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };
    
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  // Fetch notifications on mount & Setup Realtime
  React.useEffect(() => {
    if (!restaurant?.id) return

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (!error && data) {
        const formatted = data.map(n => ({
          ...n,
          time: formatTimeAgo(n.created_at)
        })).filter(n => new Date(n.created_at).getTime() > clearedAt)
        setNotifications(formatted)
      }
    }

    fetchNotifications()

    // Web Audio API for a pleasant "ding" sound
    const playNotificationSound = () => {
      try {
        const audioCtx = audioContextRef.current;
        if (!audioCtx) return;

        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Create a pleasant double-chime "ding-ding" effect
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        oscillator.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.1); // A5

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.3);
      } catch (e) {
        console.warn('Audio playback blocked or not supported');
      }
    }

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `restaurant_id=eq.${restaurant.id}`
        },
        (payload) => {
          const newNotif = {
            ...payload.new,
            time: 'just now'
          }
          setNotifications(prev => [newNotif, ...prev])
          playNotificationSound() // Play the sound!
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `restaurant_id=eq.${restaurant.id}`
        },
        (payload) => {
          setNotifications(prev => prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new, time: n.time } : n))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [restaurant?.id])

  // Filtered notifications count for badge
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.is_read).length
  }, [notifications])

  // Filter based on active tab
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (activeNotifTab === 'All') return true
      if (activeNotifTab === 'Unread') return !n.is_read
      if (activeNotifTab === 'Updates') {
        return n.type === 'order' || n.type === 'scan' || n.type === 'reservation' || n.type === 'menu'
      }
      if (activeNotifTab === 'System') {
        return n.type === 'report' || n.type === 'system'
      }
      return true
    })
  }, [notifications, activeNotifTab])

  const toggleRead = async (id: string, currentReadStatus: boolean) => {
    if (currentReadStatus) return // Already read

    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    
    // DB update
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    await supabase.from('notifications').update({ is_read: true }).eq('restaurant_id', restaurant.id).eq('is_read', false)
  }

  const clearAllNotifications = async () => {
    const now = Date.now()
    localStorage.setItem('notificationsClearedAt', now.toString())
    setClearedAt(now)
    setNotifications([])
    
    // Delete non-order notifications to save space
    await supabase.from('notifications').delete().eq('restaurant_id', restaurant.id).neq('type', 'order')
    // Mark order notifications as read so they don't show unread badges, but keep them in DB for Order History
    await supabase.from('notifications').update({ is_read: true }).eq('restaurant_id', restaurant.id).eq('type', 'order')
  }

  // Fetch Order Details when selected
  React.useEffect(() => {
    if (!selectedOrderNotification || selectedOrderNotification.type !== 'order') return

    const fetchOrderDetails = async () => {
      setIsLoadingOrderItems(true)
      
      const desc = selectedOrderNotification.description || ""
      
      if (desc.includes("Special Instructions: ")) {
        setSelectedOrderInstructions(desc.split("Special Instructions: ")[1])
      } else {
        setSelectedOrderInstructions("")
      }

      const itemsMatch = desc.match(/Order received for (.*?) from Table/)
      
      if (itemsMatch && itemsMatch[1]) {
        const itemsStr = itemsMatch[1]
        const itemsList = itemsStr.split(',').map((s: string) => s.trim())
        
        const parsedItems = itemsList.map((itemStr: string) => {
          const match = itemStr.match(/^(\d+)x\s+(.+)$/)
          if (match) {
            return { qty: parseInt(match[1], 10), name: match[2] }
          }
          return { qty: 1, name: itemStr }
        })

        const names = parsedItems.map((pi: any) => pi.name)

        const { data: menuItems } = await supabase
          .from('menu_items')
          .select('id, name, image_url, description, price')
          .eq('restaurant_id', restaurant.id)
          .in('name', names)

        const finalItems = parsedItems.map((pi: any) => {
          const dbItem = menuItems?.find(mi => mi.name === pi.name)
          return {
            ...pi,
            ...dbItem
          }
        })

        setSelectedOrderItems(finalItems)
      } else {
        setSelectedOrderItems([])
      }
      setIsLoadingOrderItems(false)
    }

    fetchOrderDetails()
  }, [selectedOrderNotification, restaurant?.id, supabase])

  const handleDropdownNav = (e: React.MouseEvent<HTMLAnchorElement>, tab: string, href: string) => {
    e.preventDefault();
    setIsProfileOpen(false);
    setActiveTab(tab as any);
    router.push(href);
  }

  // ─── Profile Dropdown Menu State ─────────────────────────────────
  const [isProfileOpen, setIsProfileOpen] = useState(false)



  return (
    <div className={`h-screen flex flex-col overflow-hidden font-sans antialiased text-[#111827] bg-[#F5F5F5]`}>
      {/* Push Notification Providers & Prompts */}
      <OneSignalProvider userId={restaurant?.id} />
      <NotificationPromptModal />

      {/* Trial Countdown Banner */}
      {trialBanner}

      {/* TOP HEADER (Locked to height 72px) - Pure White background, no shadow, no border */}
      <header className="sticky top-0 z-40 bg-white  h-[72px] shrink-0 select-none">
        <div className="max-w-[1440px] w-full h-full mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Left: Safardine Logo (Cropped and Scaled to make typography prominent) */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center group h-10 w-[130px] relative overflow-hidden">
              <Image 
                src="/logo.png" 
                alt="Safardine" 
                width={180}
                height={120}
                priority
                className="absolute left-[-26px] top-[-38px] w-[180px] max-w-none h-[120px] object-contain select-none" 
              />
            </Link>
          </div>

          {/* Right: Notifications and Profile */}
          <div className="flex items-center gap-6">
          {/* Notification bell icon (Outline style) with green dot */}
          <button 
            onClick={() => setIsNotificationOpen(true)}
            className="relative p-1.5 text-[#6B7280] hover:text-[#22C55E] transition-colors duration-200 cursor-pointer"
          >
            <Bell className="w-5 h-5 stroke-[1.5]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#22C55E] rounded-full border border-white animate-pulse" />
            )}
          </button>

          {/* Restaurant Profile Section */}
          <div className="relative">
            <div 
              onClick={() => setIsProfileOpen(prev => !prev)}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <img
                src={restaurantLogo}
                alt={restaurantName}
                fetchPriority="high"
                loading="eager"
                decoding="sync"
                className="w-8 h-8 rounded-full object-cover border border-[#EEEEEE] bg-white  group-hover:border-[#22C55E] transition-colors duration-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=100&q=80'
                }}
              />
              <div className="text-left hidden sm:block">
                <h4 className="text-[13px] font-bold text-[#111827] leading-none group-hover:text-[#22C55E] transition-colors duration-200">
                  {restaurantName}
                </h4>
                <p className="text-[11px] text-[#6B7280] leading-none mt-1">
                  Restaurant Owner
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Profile Dropdown Popover */}
            <AnimatePresence>
              {isProfileOpen && (
                <>
                  {/* Backdrop Click Close */}
                  <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileOpen(false)} />
                  
                  {/* Dropdown Container */}
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3.5 w-[290px] bg-white  border border-[#EEEEEE] rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50 p-4 font-sans select-none flex flex-col gap-1 max-h-[85vh] overflow-y-auto"
                  >
                    {/* Header profile details */}
                    <div className="flex items-center gap-3 p-2 mb-2">
                      <img
                        src={restaurantLogo}
                        alt={restaurantName}
                        loading="lazy"
                        decoding="async"
                        className="w-11 h-11 rounded-full object-cover border border-[#EEEEEE] bg-white "
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=100&q=80'
                        }}
                      />
                      <div className="text-left">
                        <h4 className="text-[14px] font-extrabold text-[#111827] leading-none">
                          {restaurantName}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-bold leading-none mt-1.5">
                          Restaurant Owner
                        </p>
                      </div>
                    </div>

                    {/* Section 1 Links */}
                    <div className="flex flex-col gap-0.5">
                      {/* Profile Overview (Active Style if matching profile pathname) */}
                      <a href="/dashboard/profile" onClick={(e) => handleDropdownNav(e, 'profile', '/dashboard/profile')}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                          pathname === '/dashboard/profile'
                            ? 'bg-[#E8F8EE] text-[#1B8E4C]'
                            : 'text-[#374151] hover:bg-slate-50 hover:text-[#111827]'
                        }`}
                      >
                        <User className={`w-[18px] h-[18px] ${pathname === '/dashboard/profile' ? 'text-[#1B8E4C]' : 'text-slate-500'}`} />
                        Profile Overview
                      </a>

                      <a href="/dashboard/profile" onClick={(e) => handleDropdownNav(e, 'profile', '/dashboard/profile')}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-bold text-[#374151] hover:bg-slate-50 hover:text-[#111827] transition-all"
                      >
                        <Store className="w-[18px] h-[18px] text-slate-500" />
                        Restaurant Information
                      </a>

                      <a href="/dashboard/settings" onClick={(e) => handleDropdownNav(e, 'settings', '/dashboard/settings')}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-bold text-[#374151] hover:bg-slate-50 hover:text-[#111827] transition-all"
                      >
                        <Settings className="w-[18px] h-[18px] text-slate-500" />
                        Account Settings
                      </a>

                      <a href="/dashboard/billing" onClick={(e) => handleDropdownNav(e, 'other', '/dashboard/billing')}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                          pathname === '/dashboard/billing'
                            ? 'bg-[#E8F8EE] text-[#1B8E4C]'
                            : 'text-[#374151] hover:bg-slate-50 hover:text-[#111827]'
                        }`}
                      >
                        <CreditCard className={`w-[18px] h-[18px] ${pathname === '/dashboard/billing' ? 'text-[#1B8E4C]' : 'text-slate-500'}`} />
                        Subscription & Billing
                      </a>

                      <a href="/dashboard/settings" onClick={(e) => handleDropdownNav(e, 'settings', '/dashboard/settings')}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-bold text-[#374151] hover:bg-slate-50 hover:text-[#111827] transition-all"
                      >
                        <Link2 className="w-[18px] h-[18px] text-slate-500" />
                        Connected Services
                      </a>

                      <a href="/dashboard/analytics" onClick={(e) => handleDropdownNav(e, 'analytics', '/dashboard/analytics')}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-bold text-[#374151] hover:bg-slate-50 hover:text-[#111827] transition-all"
                      >
                        <Clock className="w-[18px] h-[18px] text-slate-500" />
                        Business Hours
                      </a>

                      <a href="/dashboard/menu" onClick={(e) => handleDropdownNav(e, 'menu', '/dashboard/menu')}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-bold text-[#374151] hover:bg-slate-50 hover:text-[#111827] transition-all"
                      >
                        <QrCode className="w-[18px] h-[18px] text-slate-500" />
                        QR & Menu Settings
                      </a>
                    </div>

                    {/* Divider */}
                    <div className="my-2 border-t border-[#F3F4F6]" />

                    {/* Section 2 Links */}
                    <div className="flex flex-col gap-0.5">
                      <a href="/changelog" target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-bold text-[#374151] hover:bg-slate-50 hover:text-[#111827] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Megaphone className="w-[18px] h-[18px] text-slate-500" />
                          What's New
                        </div>
                        <span className="w-2 h-2 bg-[#F47B3E] rounded-full mr-1.5" />
                      </a>

                      <a href="mailto:vermasaurabh4343@gmail.com"
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-bold text-[#374151] hover:bg-slate-50 hover:text-[#111827] transition-all"
                      >
                        <HelpCircle className="w-[18px] h-[18px] text-slate-500" />
                        Help & Support
                      </a>

                      <a href="mailto:vermasaurabh4343@gmail.com?subject=Feedback"
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-bold text-[#374151] hover:bg-slate-50 hover:text-[#111827] transition-all"
                      >
                        <MessageSquare className="w-[18px] h-[18px] text-slate-500" />
                        Send Feedback
                      </a>
                    </div>

                    {/* Logout Button inside a red border box */}
                    <form action={signout} className="mt-3">
                      <button 
                        type="submit"
                        className="w-full py-2.5 bg-white  hover:bg-red-50/50 border border-red-200 hover:border-red-300 text-red-500 hover:text-red-600 rounded-xl transition-all font-bold text-xs flex items-center justify-center gap-2 cursor-pointer select-none"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Logout
                      </button>
                    </form>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
        </div>
      </header>

      {/* MAIN CONTAINER (Single-page view optimized, padded at bottom for bar) */}
      <main 
        className="max-w-[1440px] w-full mx-auto px-4 md:px-8 pt-6 flex-1 flex flex-col overflow-x-hidden"
        style={{ overflowY: 'auto', height: 'calc(100vh - 72px)', paddingBottom: '112px' }}
      >
        {/* SPA IndexedStack container - keeps tabs alive */}
        {!restaurant || !restaurant.setup_completed ? (
          <OnboardingPending />
        ) : (
          <>

        <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
          {dashboardData && <DashboardClient {...dashboardData} />}
        </div>
        <div style={{ display: activeTab === 'menu' ? 'block' : 'none' }}>
          {menuData && <MenuClient {...menuData} />}
        </div>
        <div style={{ display: activeTab === 'analytics' ? 'block' : 'none' }}>
          {analyticsData && <AnalyticsClient {...analyticsData} restaurantId={dashboardData?.restaurantId} />}
        </div>
        <div style={{ display: activeTab === 'profile' ? 'block' : 'none' }}>
          {activeTab === 'profile' && restaurant && (
            <div className="bg-white border border-[#EEEEEE] border-b-0 rounded-t-[12px] overflow-hidden relative">
              <div className="relative h-[140px] w-full overflow-hidden bg-slate-100 rounded-t-[12px]">
                {(restaurant?.restaurant_cover || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80') && (
                  <img
                    src={restaurant?.restaurant_cover || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80'}
                    alt="Restaurant cover"
                    fetchPriority="high"
                    loading="eager"
                    className="w-full h-full object-cover rounded-t-[12px]"
                  />
                )}
                <div className="absolute inset-0 bg-black/5 rounded-t-[12px]" />
              </div>
            </div>
          )}
          {restaurant && <ProfileClient 
            restaurant={restaurant}
            publicMenuUrl={dashboardData?.publicMenuUrl || ''}
            qrCodeUrl={dashboardData?.qrCodeUrl || ''}
            visitors={dashboardData?.initialVisitors || 0}
            orders={dashboardData?.initialOrders || 0}
            revenue={dashboardData?.initialRevenue || 0}
            scans={dashboardData?.initialScans || 0}
            reviewCount={dashboardData?.reviewCount || 0}
            avgRating={dashboardData?.avgRating || 0}
            growth={dashboardData?.growth}
          />}
        </div>
        <div style={{ display: activeTab === 'settings' ? 'block' : 'none' }}>
          {restaurant && <SettingsClient restaurant={restaurant} />}
        </div>

        {/* Render children for non-SPA pages (e.g. billing) */}
        <div style={{ display: activeTab === 'other' ? 'block' : 'none' }}>
          {children}
        </div>
        </>
        )}
      </main>

      {/* FLOATING BOTTOM NAVIGATION BAR */}
      <div className={`fixed bottom-6 left-0 right-0 flex justify-center z-[100] pointer-events-none px-4 select-none transition-all duration-300 ${isNotificationOpen || isOrdersModalOpen || isBottomNavHidden || !restaurant || !restaurant.setup_completed ? 'translate-y-24 opacity-0 md:translate-y-0 md:opacity-100' : 'translate-y-0 opacity-100'}`}>
        <nav className="pointer-events-auto bg-white border border-[#EEEEEE] rounded-[16px] h-[64px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] grid grid-cols-5 w-full max-w-[80vw] sm:max-w-[720px] overflow-hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault()
              setActiveTab(tab.id as any)
              router.push(tab.href)
            }

            return (
              <a
                key={tab.id}
                href={tab.href}
                onClick={handleTabClick}
                className={`relative flex flex-col items-center justify-center pt-1.5 pb-2 transition-all duration-200 group cursor-pointer ${
                  isActive 
                    ? 'text-[#22C55E]' 
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-[#22C55E]' : 'text-[#6B7280] group-hover:text-[#111827]'}`} />

                <span className="text-[11px] font-bold tracking-tight mt-1 text-center leading-none">
                  {tab.id === 'dashboard' && (
                    <><span className="sm:hidden">Home</span><span className="hidden sm:inline">{tab.label}</span></>
                  )}
                  {tab.id === 'menu' && (
                    <><span className="sm:hidden">Menu</span><span className="hidden sm:inline">{tab.label}</span></>
                  )}
                  {tab.id === 'analytics' && (
                    <><span className="sm:hidden">Stats</span><span className="hidden sm:inline">{tab.label}</span></>
                  )}
                  {tab.id === 'profile' && (
                    <><span className="sm:hidden">Profile</span><span className="hidden sm:inline">{tab.label}</span></>
                  )}
                  {tab.id === 'settings' && tab.label}
                </span>

                {/* Green Underline / Dot */}
                {isActive && (
                  <motion.div
                    layoutId="active-dot"
                    className="absolute bottom-1 w-1.5 h-1.5 bg-[#22C55E] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            )
          })}
        </nav>
      </div>

      {/* ─── Pixel-Perfect Notification Sidebar Panel ──────────────────── */}
      <AnimatePresence>
        {isNotificationOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-[2px]"
            />

            {/* Sliding Sidebar Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[420px] bg-white  border-l border-[#EEEEEE] shadow-[-10px_0_50px_rgba(0,0,0,0.08)] flex flex-col font-sans select-none overflow-hidden"
            >
              {/* Panel Header */}
              <div className="p-6 pb-4 flex items-center justify-between shrink-0">
                <h3 className="text-[18px] font-bold text-[#111827] tracking-tight">Notifications</h3>
                <button 
                  onClick={() => setIsNotificationOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Navigation Tabs (All, Unread, Updates, System) */}
              <div className="px-6 border-b border-[#EEEEEE] flex gap-6 text-[13px] font-bold text-slate-500 shrink-0 select-none">
                {(['All', 'Unread', 'Updates', 'System'] as const).map((tab) => {
                  const isActive = activeNotifTab === tab
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveNotifTab(tab)}
                      className={`pb-3 relative transition-colors cursor-pointer ${
                        isActive ? 'text-[#F47B3E]' : 'hover:text-slate-800'
                      }`}
                    >
                      {tab}
                      {isActive && (
                        <motion.div
                          layoutId="active-notif-tab"
                          className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#F47B3E] rounded-full"
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Panel Body (Filtered List) */}
              <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-[#F3F4F6]">
                {filteredNotifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                    <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">All caught up!</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] leading-normal font-semibold">No alerts found in this section.</p>
                    </div>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => {
                    // Custom mapping for icons and circular backgrounds
                    let circleBg = 'bg-[#FAFAFA]'
                    let iconColor = 'text-slate-500'
                    let IconComponent = Bell

                    if (notif.type === 'order') {
                      circleBg = 'bg-[#E8F5E9]' // Light Green
                      iconColor = 'text-[#2E7D32]'
                      IconComponent = ShoppingBag
                    } else if (notif.type === 'scan') {
                      circleBg = 'bg-[#E3F2FD]' // Light Blue
                      iconColor = 'text-[#1565C0]'
                      IconComponent = QrCode
                    } else if (notif.type === 'reservation') {
                      circleBg = 'bg-[#F3E5F5]' // Light Purple
                      iconColor = 'text-[#6A1B9A]'
                      IconComponent = Calendar
                    } else if (notif.type === 'menu') {
                      circleBg = 'bg-[#FFF3E0]' // Light Orange
                      iconColor = 'text-[#E65100]'
                      IconComponent = Utensils
                    } else if (notif.type === 'report') {
                      circleBg = 'bg-[#E0F2F1]' // Light Teal
                      iconColor = 'text-[#00695C]'
                      IconComponent = BarChart3
                    } else if (notif.type === 'system') {
                      circleBg = 'bg-[#FFFDE7]' // Light Yellow
                      iconColor = 'text-[#F57F17]'
                      IconComponent = Bell
                    }

                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.is_read) toggleRead(notif.id, notif.is_read)
                          if (notif.type === 'order') {
                            setSelectedOrderNotification(notif)
                            setIsNotificationOpen(false) // Close the sidebar
                          }
                        }}
                        className={`py-4.5 flex gap-4 transition-colors duration-200 cursor-pointer ${
                          !notif.is_read ? 'bg-white' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        {/* Dynamic Round Icon Badge */}
                        <div className={`w-10 h-10 rounded-full ${circleBg} shrink-0 flex items-center justify-center transition-transform hover:scale-105 duration-200`}>
                          <IconComponent className={`w-[18px] h-[18px] ${iconColor}`} />
                        </div>

                        {/* Title, Details, Actions */}
                        <div className="flex-1 space-y-1 text-left min-w-0">
                          <div className="flex justify-between items-baseline gap-2">
                            <div className="flex items-center min-w-0">
                              <h4 className="text-[13px] font-bold text-[#111827] truncate leading-tight">
                                {notif.title}
                              </h4>
                              {!notif.is_read && (
                                <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-extrabold text-[#F47B3E] bg-[#FFF3ED] rounded-md ml-2 tracking-wide uppercase">
                                  New
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-[11.5px] text-slate-500 leading-normal font-semibold line-clamp-2">
                            {notif.description.split("\nSpecial Instructions:")[0]}
                          </p>
                        </div>

                        {/* Orange Dot Indicator */}
                        {!notif.is_read && (
                          <div className="shrink-0 flex items-center justify-center pl-2">
                            <span className="w-2 h-2 bg-[#F47B3E] rounded-full shrink-0" />
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Panel Footer (Mark All as Read & Settings Icon) */}
              <div className="border-t border-[#EEEEEE] px-6 py-4.5 bg-white  shrink-0 flex items-center justify-between">
                <button 
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 text-[12px] font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer select-none"
                >
                  <Check className="w-4 h-4 text-slate-500" />
                  Mark all as read
                </button>
                
                <div className="flex items-center gap-4">
                  {showNotifSettings && notifications.length > 0 && (
                    <motion.button 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => {
                        clearAllNotifications()
                        setShowNotifSettings(false)
                      }}
                      className="flex items-center gap-1.5 text-[12px] font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer select-none"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear all
                    </motion.button>
                  )}
                  <button 
                    onClick={() => setShowNotifSettings(prev => !prev)}
                    className={`transition-colors cursor-pointer ${showNotifSettings ? 'text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Settings className={`w-[18px] h-[18px] transition-transform duration-300 ${showNotifSettings ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── DETAILED ORDER NOTIFICATION MODAL (GLASS UI) ───────────── */}
      <AnimatePresence>
        {selectedOrderNotification && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrderNotification(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            
            {/* Glass Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white/85 backdrop-blur-xl border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[24px] overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/40 flex items-center justify-between shrink-0 bg-gradient-to-r from-emerald-50/50 to-teal-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center shadow-sm">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
                      {selectedOrderNotification.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      {selectedOrderNotification.time}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrderNotification(null)}
                  className="w-8 h-8 rounded-full bg-white/50 hover:bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center shadow-sm transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Order Details
                </h4>

                {isLoadingOrderItems ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    <span className="text-sm font-semibold text-slate-500">Loading order items...</span>
                  </div>
                ) : selectedOrderItems.length > 0 ? (
                  <div className="space-y-4">
                    {selectedOrderItems.map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-4 bg-white/60 rounded-[16px] border border-white/40 shadow-sm hover:shadow-md transition-shadow">
                        {/* Image */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 shadow-inner">
                          <img 
                            src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'} 
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Info */}
                        <div className="flex flex-col justify-center flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-bold text-slate-800 text-[15px] truncate">{item.name}</h5>
                            <span className="font-black text-emerald-600 text-sm whitespace-nowrap bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                              x{item.qty}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-[13px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                          {item.price !== undefined && (
                            <p className="text-sm font-black text-slate-800 mt-2">
                              ₹{(item.price * item.qty).toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Special Instructions Alert */}
                    {selectedOrderInstructions && (
                      <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100/80 text-orange-600 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-orange-800 text-[13px] tracking-tight mb-0.5">Cooking Instructions</h5>
                          <p className="text-xs font-semibold text-orange-700/80 leading-relaxed">
                            "{selectedOrderInstructions}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-sm font-semibold text-slate-600">
                      Could not parse items from this order.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2 max-w-[80%] mx-auto leading-relaxed">
                      Raw log: {selectedOrderNotification.description}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/40 bg-slate-50/50 shrink-0">
                <button
                  onClick={() => setSelectedOrderNotification(null)}
                  className="w-full py-3 bg-[#111111] hover:bg-[#222222] text-white font-bold text-[13px] rounded-[12px] transition-all shadow-md active:scale-[0.98] cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Orders History Global Modal */}
      <OrdersHistoryModal 
        isOpen={isOrdersModalOpen} 
        onClose={() => {
          setIsOrdersModalOpen(false)
          window.dispatchEvent(new CustomEvent('ordersModalToggle', { detail: false }))
        }} 
        restaurantId={restaurant?.id} 
      />
    </div>
  )
}