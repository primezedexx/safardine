'use client'

import { motion } from 'framer-motion'
import { Sparkles, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function OnboardingPending() {
  return (
    <div className="min-h-[85vh] w-full flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden bg-slate-50/50">
      
      {/* Ambient decorative glowing backdrops */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[600px] h-[400px] bg-gradient-to-tr from-orange-200/20 to-amber-200/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className="z-10 max-w-2xl space-y-8 px-4"
      >
        {/* Top decorative badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 font-extrabold text-[10px] uppercase tracking-widest shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
          Safar Dine Awaits You
        </div>
        
        {/* Modern bold and cursive mixed typography title */}
        <div className="space-y-2 leading-tight">
          <span className="block text-slate-400 font-bold uppercase tracking-widest text-[11px] mb-1">Step into the future of dining</span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Your culinary <span className="font-serif italic text-orange-500 font-light" style={{ fontFamily: "'Alex Brush', cursive, 'Dancing Script', serif" }}>journey</span> begins here.
          </h1>
        </div>
        
        {/* Centered enlarged message in bold and cursive mixed style */}
        <div className="p-8 bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-100/50 space-y-6 relative overflow-hidden">
          <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
          
          <p className="text-base sm:text-xl md:text-2xl font-extrabold text-slate-700 leading-relaxed">
            Complete your <span className="text-orange-500 font-serif italic font-light tracking-wide text-2xl sm:text-3xl" style={{ fontFamily: "'Alex Brush', cursive, 'Dancing Script', serif" }}>onboarding setup</span> to unlock your premium digital menus, custom domain, and <span className="text-amber-600 font-serif italic font-light tracking-wide text-2xl sm:text-3xl" style={{ fontFamily: "'Alex Brush', cursive, 'Dancing Script', serif" }}>real-time analytics</span>.
          </p>
          
          <p className="text-xs sm:text-sm font-semibold text-slate-400 max-w-md mx-auto leading-normal">
            Give your diners an elegant, automated, and personalized menu experience powered by AI recommendations.
          </p>
        </div>

        {/* Premium CTA Button to Complete Setup */}
        <div className="pt-2">
          <Link
            href="/restaurant-setup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-orange-500/10 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          >
            🚀 Complete Setup Now
          </Link>
        </div>
      </motion.div>
      
      {/* Cursive CSS injection inside head dynamically */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Dancing+Script:wght@700&display=swap" 
        rel="preload" 
        as="style" 
        onLoad={(e) => {
          (e.target as HTMLLinkElement).onload = null;
          (e.target as HTMLLinkElement).rel = 'stylesheet';
        }}
      />
      <noscript>
        <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Dancing+Script:wght@700&display=swap" rel="stylesheet" />
      </noscript>
    </div>
  )
}
