'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { hasAccess, getPlanLimits, PlanType } from '@/lib/features'
import { useRouter } from 'next/navigation'
import { Lock, Sparkles } from 'lucide-react'

type SubscriptionContextType = {
  plan: PlanType
  hasWebsiteAddon: boolean
  hasAccessTo: (featureKey: string) => boolean
  limits: { maxMenuItems: number; maxCategories: number }
  triggerUpgrade: (featureName: string, featureKey: string) => void
  isPopupOpen: boolean
  closePopup: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ 
  children, 
  initialPlan, 
  hasWebsiteAddon,
  restaurantId
}: { 
  children: ReactNode
  initialPlan: PlanType
  hasWebsiteAddon: boolean
  restaurantId: string
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [attemptedFeature, setAttemptedFeature] = useState<{name: string, key: string} | null>(null)
  const router = useRouter()

  const handleTriggerUpgrade = async (featureName: string, featureKey: string) => {
    setAttemptedFeature({ name: featureName, key: featureKey })
    setIsPopupOpen(true)
    
    // Log attempt to backend
    try {
      await fetch('/api/track-feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          plan: initialPlan,
          feature: featureKey,
          page: window.location.pathname
        })
      })
    } catch (e) {
      console.error('Failed to log feature attempt', e)
    }
  }

  const value = {
    plan: initialPlan,
    hasWebsiteAddon,
    hasAccessTo: (featureKey: string) => hasAccess(initialPlan, featureKey),
    limits: getPlanLimits(initialPlan),
    triggerUpgrade: handleTriggerUpgrade,
    isPopupOpen,
    closePopup: () => setIsPopupOpen(false)
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
      {isPopupOpen && attemptedFeature && (
        <UpgradePopup 
          featureName={attemptedFeature.name} 
          featureKey={attemptedFeature.key}
          currentPlan={initialPlan}
          onClose={() => setIsPopupOpen(false)}
          onUpgrade={() => {
            setIsPopupOpen(false)
            router.push('/dashboard/billing')
          }}
        />
      )}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

function UpgradePopup({ featureName, featureKey, currentPlan, onClose, onUpgrade }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0B1110] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md w-full relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#F97316]/10 blur-[50px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-[#131A18] border border-slate-800 rounded-2xl flex items-center justify-center shadow-lg relative">
            <Lock className="w-8 h-8 text-[#F97316]" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#F97316] rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white tracking-tight">Upgrade Plan</h3>
            <p className="text-[14px] text-slate-400 leading-relaxed">
              Get the same features for less — upgrade to a longer plan and save up to ₹5,389.
            </p>
          </div>
          
          <div className="flex flex-col w-full gap-3 pt-4">
            <button
              onClick={onUpgrade}
              className="w-full py-3.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-xl transition-colors text-[14px]"
            >
              Upgrade Now
            </button>
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 font-medium rounded-xl transition-colors text-[14px]"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
