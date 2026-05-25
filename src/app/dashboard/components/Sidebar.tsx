'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Menu as MenuItemIcon, Menu as HamburgerIcon, BarChart3, Settings, LogOut as LogOutIcon, Utensils, Sparkles, X as CloseIcon, Lock } from 'lucide-react'
import { signout } from '../../(auth)/actions'
import { useSubscription } from '../context/SubscriptionContext'

interface SidebarProps {
  restaurantName: string
  userEmail: string
  setupCompleted?: boolean
}

export default function Sidebar({ restaurantName, userEmail, setupCompleted = false }: SidebarProps) {
  const pathname = usePathname()
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false)

  const { hasAccessTo, triggerUpgrade } = useSubscription()

  const navItems = [
    ...(!setupCompleted ? [{ label: "🚀 Set Up Now", href: "/restaurant-setup", icon: <Sparkles className="w-5 h-5 animate-pulse" />, highlight: true }] : []),
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Menu Items", href: "/dashboard/menu", icon: <MenuItemIcon className="w-5 h-5" /> },
    { label: "Analytics", href: "/dashboard/analytics", icon: <BarChart3 className="w-5 h-5" />, featureKey: "analytics_basic" },
    { label: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> }
  ]

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <div className="md:hidden w-full h-16 bg-white  border-b border-slate-200/60 px-4 flex items-center justify-between sticky top-0 z-40 select-none shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/10 shrink-0">
            <Utensils className="w-4.5 h-4.5 text-white " />
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold text-sm text-slate-800 tracking-tight leading-tight truncate max-w-[150px]">
              {restaurantName}
            </h2>
            <span className="text-[8px] text-orange-500 font-extrabold uppercase tracking-widest flex items-center gap-0.5 mt-0.5">
              <Sparkles className="w-2 h-2" /> Owner Portal
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setIsSidebarDrawerOpen(true)}
          className="p-2 text-slate-500 hover:text-orange-500 hover:bg-slate-50 rounded-xl border border-slate-200/80 transition-all active:scale-95 cursor-pointer shadow-sm"
          aria-label="Toggle Navigation"
        >
          <HamburgerIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Glassmorphic Overlay Drawer */}
      <AnimatePresence>
        {isSidebarDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/60 z-45 md:hidden"
            />
            
            {/* Sliding Sidebar Container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white  border-r border-slate-200/60 z-50 flex flex-col p-4 shadow-2xl md:hidden select-none font-sans"
            >
              {/* Subtle ambient warm glow inside mobile drawer */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/[0.03] rounded-full blur-[40px] pointer-events-none z-0" />

              {/* Drawer Title & Close Button */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 z-10 relative">
                <div className="flex items-center gap-2.5">
                  <div className="w-8.5 h-8.5 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/10 shrink-0">
                    <Utensils className="w-4.5 h-4.5 text-white " />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-extrabold text-sm text-slate-800 tracking-tight leading-tight truncate max-w-[130px]">
                      {restaurantName}
                    </h2>
                    <span className="text-[8px] text-orange-500 font-extrabold uppercase tracking-widest flex items-center gap-0.5 mt-0.5">
                      <Sparkles className="w-2 h-2" /> Owner Portal
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsSidebarDrawerOpen(false)} 
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 border border-slate-200/80 cursor-pointer shadow-sm animate-pulse"
                >
                  <CloseIcon className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="flex-1 space-y-1.5 z-10 relative">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  
                  const isLocked = item.featureKey && !hasAccessTo(item.featureKey)
                  
                  const handleClick = (e: React.MouseEvent) => {
                    if (isLocked) {
                      e.preventDefault()
                      triggerUpgrade(item.label, item.featureKey!)
                      setIsSidebarDrawerOpen(false)
                    } else {
                      setIsSidebarDrawerOpen(false)
                    }
                  }

                  return (
                    <Link 
                      key={item.label} 
                      href={isLocked ? "#" : item.href}
                      onClick={handleClick}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm tracking-wide group relative ${
                        isActive 
                          ? 'bg-orange-500/[0.08] text-orange-600 border-l-[3px] border-orange-500' 
                          : item.highlight
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 hover:scale-[1.02] border border-orange-400/30'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:translate-x-0.5'
                      }`}
                    >
                      <div className={`transition-colors duration-150 ${
                        isActive 
                          ? 'text-orange-500' 
                          : item.highlight
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-slate-600'
                      }`}>
                        {item.icon}
                      </div>
                      <span className="flex-1">{item.label}</span>
                      
                      {isLocked && (
                        <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 transition-colors ml-auto shrink-0" />
                      )}

                      {isActive && (
                        <span className="absolute right-4 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                      )}
                    </Link>
                  )
                })}
              </nav>

              {/* Drawer Profile Card & Logout */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 z-10 relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-200 flex items-center justify-center font-bold text-orange-600 text-sm shadow-sm shrink-0">
                    {userEmail?.charAt(0).toUpperCase() || 'O'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{userEmail}</p>
                    <span className="text-[10px] text-slate-400 font-bold tracking-tight block">Active Session</span>
                  </div>
                </div>

                <form action={signout} className="shrink-0">
                  <button 
                    type="submit"
                    title="Sign Out"
                    className="p-2.5 bg-white  hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200/80 hover:border-red-200 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
                  >
                    <LogOutIcon className="w-4.5 h-4.5" />
                  </button>
                </form>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sticky Sidebar (Hidden on mobile) */}
      <aside className="hidden md:flex w-64 bg-white  border-r border-slate-200/60 flex-col h-screen sticky top-0 z-30 font-sans tracking-tight relative overflow-hidden select-none shrink-0">
        
        {/* Subtle Ambient Light Glow */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/[0.03] rounded-full blur-[40px] pointer-events-none z-0" />
        
        {/* Brand & Owner Portal Banner */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/10 shrink-0">
              <Utensils className="w-4 h-4 text-white " />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-base text-slate-800 tracking-tight leading-tight truncate max-w-[140px]">
                {restaurantName}
              </h2>
              <span className="text-[9px] text-orange-500 font-extrabold uppercase tracking-widest flex items-center gap-0.5 mt-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Owner Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1.5 z-10 relative">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            
            const isLocked = item.featureKey && !hasAccessTo(item.featureKey)
            
            const handleClick = (e: React.MouseEvent) => {
              if (isLocked) {
                e.preventDefault()
                triggerUpgrade(item.label, item.featureKey!)
              }
            }

            return (
              <Link 
                key={item.label} 
                href={isLocked ? "#" : item.href} 
                onClick={handleClick} 
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm tracking-wide group relative ${
                  isActive 
                    ? 'bg-orange-500/[0.08] text-orange-600 border-l-[3px] border-orange-500' 
                    : item.highlight
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 hover:scale-[1.02] border border-orange-400/30 font-extrabold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:translate-x-0.5'
                }`}
              >
                <div className={`transition-colors duration-150 ${
                  isActive 
                    ? 'text-orange-500' 
                    : item.highlight
                      ? 'text-white font-extrabold'
                      : 'text-slate-400 group-hover:text-slate-600'
                }`}>
                  {item.icon}
                </div>
                <span className="flex-1">{item.label}</span>
                
                {isLocked && (
                  <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 transition-colors ml-auto shrink-0" />
                )}

                {isActive && (
                  <span className="absolute right-4 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Profile Card & Sign-Out Form */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 z-10 relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-200 flex items-center justify-center font-bold text-orange-600 text-sm shadow-sm shrink-0">
              {userEmail?.charAt(0).toUpperCase() || 'O'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{userEmail}</p>
              <span className="text-[10px] text-slate-400 font-bold tracking-tight block">Active Session</span>
            </div>
          </div>

          <form action={signout} className="shrink-0">
            <button 
              type="submit"
              title="Sign Out"
              className="p-2.5 bg-white  hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200/80 hover:border-red-200 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
            >
              <LogOutIcon className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>

      </aside>
    </>
  )
}
