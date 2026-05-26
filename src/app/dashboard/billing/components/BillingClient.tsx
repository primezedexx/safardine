'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CreditCard, Crown, Zap, CheckCircle2, ChevronRight, Clock, 
  Shield, Sparkles, Receipt, Download, ArrowRight, Star,
  Smartphone, ShieldCheck, Check, Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface BillingClientProps {
  restaurant: any
  userEmail: string
  isSubscribed: boolean
  isTrialActive: boolean
  trialDaysRemaining: number
  subscriptionDaysRemaining: number
  planDurationDays: number
}

const plans = {
  basic: {
    rank: 1,
    name: 'Basic',
    tagline: 'Try it with no strings attached',
    description: 'Perfect for restaurants just getting started. Explore the full SafarDine experience.',
    badgeText: 'BEST TO START',
    extraNote: 'No commitment. Cancel anytime.',
    duration: '1 Month',
    price: '₹1,499',
    monthly: '₹1,499/mo',
    priceNumber: 1499,
    durationDays: 30,
    features: ['Dynamic QR Menu', 'Restaurant branding', 'Unlimited menu items', 'Multi-language support'],
    color: '#3B82F6',
    bgLight: '#EFF6FF',
  },
  starter: {
    rank: 2,
    name: 'Starter',
    tagline: 'Getting serious? This is your plan',
    description: 'Ideal for growing restaurants ready to commit. Three months to build your digital presence.',
    savings: 'You save ₹598',
    extraNote: 'Save ₹199 every month vs Basic.',
    duration: '3 Months',
    price: '₹2,999',
    monthly: '₹999/mo',
    priceNumber: 2999,
    durationDays: 90,
    features: ['Dynamic QR Menu', 'Restaurant branding', 'Unlimited menu items', 'Multi-language support'],
    color: '#6B7280',
    bgLight: '#F9FAFB',
  },
  growth: {
    rank: 3,
    name: 'Growth',
    tagline: 'The sweet spot for smart restaurants',
    description: 'Our most popular choice. Six months to fully transform your restaurant operations.',
    savings: 'You save ₹2,195',
    extraNote: 'Save ₹666 every month vs Basic.',
    duration: '6 Months',
    price: '₹4,999',
    monthly: '₹833/mo',
    priceNumber: 4999,
    durationDays: 180,
    features: ['Everything in Starter', 'AI Dish Descriptions', 'Advanced Analytics', 'Premium Custom Themes'],
    color: '#F47B3E',
    bgLight: '#FFF7ED',
    badge: 'RECOMMENDED',
  },
  pro: {
    rank: 4,
    name: 'Business Pro',
    tagline: 'Go all in and save the most',
    description: 'For restaurants serious about growth. Lock in the lowest rate.',
    savings: 'You save ₹5,389',
    addOn: '🌐 Website Development add-on available — ₹3,000',
    extraNote: 'Save ₹750 every month vs Basic.',
    duration: '12 Months',
    price: '₹8,999',
    monthly: '₹749/mo',
    priceNumber: 8999,
    durationDays: 365,
    features: ['Everything in Growth', 'Custom Domain Branding', 'Multi-QR Layout support', 'Dedicated Onboarding'],
    color: '#7C3AED',
    bgLight: '#F5F3FF',
  },
}

export default function BillingClient({
  restaurant,
  userEmail,
  isSubscribed,
  isTrialActive,
  trialDaysRemaining,
  subscriptionDaysRemaining,
  planDurationDays,
}: BillingClientProps) {
  const supabase = createClient()
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'starter' | 'growth' | 'pro'>('growth')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  
  const [invoices, setInvoices] = useState<any[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(true)
  const [invoicesError, setInvoicesError] = useState(false)

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch('/api/invoices')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setInvoices(data.invoices || [])
      } catch (error) {
        console.error('Error fetching invoices:', error)
        setInvoicesError(true)
      } finally {
        setInvoicesLoading(false)
      }
    }
    fetchInvoices()
  }, [])

  const currentPlanString = restaurant.subscription_plan || 'basic'
  let activePlanKey: 'basic' | 'starter' | 'growth' | 'pro' | null = null
  if (isSubscribed) {
    if (currentPlanString.includes('growth')) activePlanKey = 'growth'
    else if (currentPlanString.includes('pro')) activePlanKey = 'pro'
    else if (currentPlanString.includes('starter')) activePlanKey = 'starter'
    else activePlanKey = 'basic'
  }
  const currentRank = activePlanKey ? plans[activePlanKey].rank : 0

  const daysRemaining = isSubscribed ? subscriptionDaysRemaining : isTrialActive ? trialDaysRemaining : 0
  const totalDays = isSubscribed ? planDurationDays : 7
  const progressPercent = totalDays > 0 ? Math.min(100, Math.round(((totalDays - daysRemaining) / totalDays) * 100)) : 100
  const circumference = 2 * Math.PI * 54

  const handleCheckout = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault()
    setFormError(null)
    setIsProcessing(true)

    try {
      if (!(window as any).Razorpay) {
        throw new Error('Razorpay SDK is still initializing. Please wait a moment or try again.')
      }

      const isUpgrade = currentRank > 0 && plans[selectedPlan].rank > currentRank
      const amountToCharge = isUpgrade && activePlanKey ? plans[selectedPlan].priceNumber - plans[activePlanKey].priceNumber : plans[selectedPlan].priceNumber

      // Create Order
      const orderRes = await fetch('/api/checkout/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountToCharge,
          receipt: `rcpt_${restaurant.id.substring(0, 8)}_${Date.now()}`
        })
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create payment order.')
      }

      const options = {
        key: orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '', // Enter the Key ID generated from the Dashboard
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Safardine',
        description: `${plans[selectedPlan].name} Subscription`,
        image: restaurant.logo_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80',
        order_id: orderData.order.id,
        handler: async function (response: any) {
          setIsProcessing(true)
          try {
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                restaurant_id: restaurant.id,
                plan_name: plans[selectedPlan].name,
                plan_amount: amountToCharge,
                plan_duration_days: plans[selectedPlan].durationDays
              })
            })

            const verifyData = await verifyRes.json()

            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment verification failed.')
            }

            if (typeof window !== 'undefined') {
              localStorage.setItem(`safardine_subscribed_${restaurant.id}`, 'true')
              document.cookie = `safardine_subscribed_${restaurant.id}=true; path=/; max-age=31536000`
            }

            setIsProcessing(false)
            setCheckoutSuccess(true)
          } catch (err: any) {
            console.error('Verification Error:', err)
            setIsProcessing(false)
            setFormError(err.message || 'Verification failed. Please contact support.')
          }
        },
        prefill: {
          name: restaurant.name || 'Restaurant Owner',
          email: userEmail || '',
        },
        theme: {
          color: '#F47B3E',
        },
      }

      const paymentObject = new (window as any).Razorpay(options)
      paymentObject.on('payment.failed', function (response: any) {
        setIsProcessing(false)
        setFormError(response.error.description || 'Payment failed.')
      })
      paymentObject.open()
    } catch (err: any) {
      console.error(err)
      setIsProcessing(false)
      setFormError(err.message || 'Failed to initialize checkout.')
    }
  }

  const handleSuccessReload = () => {
    window.location.reload()
  }

  return (
    <div className="w-full select-none animate-fadeIn">
      {/* Page Header */}
      <div className="mb-8 text-left">
        <h1 className="text-[32px] font-bold text-[#111827] leading-tight">Subscription & Billing</h1>
        <p className="text-[13px] text-[#6B7280] mt-1">Manage your plan, view invoices, and explore upgrade options.</p>
      </div>

      {/* Top Row: Current Plan + Days Remaining */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 mb-6">
        {/* Current Plan Card */}
        <div className="bg-white rounded-2xl border border-[#EEEEEE] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#F47B3E]/[0.04] to-transparent rounded-full -translate-y-12 translate-x-12 pointer-events-none" />
          
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-[#F47B3E] to-[#E8590C] rounded-xl flex items-center justify-center shadow-lg shadow-[#F47B3E]/10">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#111827]">Current Plan</h3>
                <p className="text-[12px] text-[#6B7280] mt-0.5">
                  {isSubscribed && activePlanKey ? `${plans[activePlanKey].name} Plan — Active` : isTrialActive ? '7-Day Free Trial — Active' : 'No Active Plan'}
                </p>
              </div>
            </div>
            {isSubscribed && (
              <span className="px-3 py-1 bg-[#ECFDF5] text-[#059669] text-[11px] font-bold rounded-full uppercase tracking-wider">Active</span>
            )}
            {!isSubscribed && isTrialActive && (
              <span className="px-3 py-1 bg-[#FFF7ED] text-[#F47B3E] text-[11px] font-bold rounded-full uppercase tracking-wider animate-pulse">Trial</span>
            )}
            {!isSubscribed && !isTrialActive && (
              <span className="px-3 py-1 bg-red-50 text-red-500 text-[11px] font-bold rounded-full uppercase tracking-wider">Expired</span>
            )}
          </div>

          {/* Plan Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Plan', value: isSubscribed && activePlanKey ? plans[activePlanKey].name : isTrialActive ? 'Free Trial' : '—', icon: Sparkles },
              { label: 'Billing Cycle', value: isSubscribed && activePlanKey ? plans[activePlanKey].duration : isTrialActive ? '7 Days' : '—', icon: Clock },
              { label: 'Amount', value: isSubscribed && activePlanKey ? plans[activePlanKey].price : '₹0', icon: CreditCard },
              { label: 'Next Renewal', value: isSubscribed ? `${subscriptionDaysRemaining}d left` : '—', icon: Receipt },
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#F3F4F6]">
                <div className="flex items-center gap-1.5 mb-2">
                  <item.icon className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">{item.label}</span>
                </div>
                <p className="text-[16px] font-bold text-[#111827]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Countdown Ring Card */}
        <div className="bg-white rounded-2xl border border-[#EEEEEE] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#F47B3E]/[0.02] to-transparent pointer-events-none" />
          
          <div className="relative w-[130px] h-[130px] mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#F3F4F6" strokeWidth="8" />
              <motion.circle
                cx="60" cy="60" r="54" fill="none"
                stroke={daysRemaining > 7 ? '#22C55E' : daysRemaining > 0 ? '#F47B3E' : '#EF4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference * (progressPercent / 100) }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[28px] font-black text-[#111827] leading-none">{daysRemaining}</span>
              <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mt-1">Days Left</span>
            </div>
          </div>
          
          <p className="text-[12px] font-semibold text-[#6B7280] leading-relaxed max-w-[200px]">
            {isSubscribed && activePlanKey
              ? `Your ${plans[activePlanKey].name} Plan renews in ${daysRemaining} days.`
              : isTrialActive
                ? `Free trial expires in ${trialDaysRemaining} day${trialDaysRemaining > 1 ? 's' : ''}.`
                : 'Your trial has expired. Subscribe to continue.'}
          </p>
        </div>
      </div>

      {/* Subscription Offers */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 bg-[#FFF3ED] rounded-xl flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-[#F47B3E]" />
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-[#111827]">{isSubscribed ? 'Upgrade or Change Plan' : 'Choose a Plan'}</h3>
            <p className="text-[12px] text-[#6B7280]">All plans include SSL encryption and Indian payment support via Razorpay.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {Object.entries(plans).map(([key, plan]) => {
            const isSelected = selectedPlan === key
            const isActive = activePlanKey === key
            const isDowngrade = currentRank > 0 && plan.rank < currentRank
            const isUpgrade = currentRank > 0 && plan.rank > currentRank
            
            const upgradePrice = isUpgrade && activePlanKey ? plan.priceNumber - plans[activePlanKey].priceNumber : plan.priceNumber

            return (
              <motion.div
                key={key}
                whileHover={{ y: -4, scale: 1.01 }}
                onClick={() => !isDowngrade && setSelectedPlan(key as any)}
                className={`relative rounded-3xl p-6 cursor-pointer border-2 transition-all duration-300 flex flex-col ${
                  isSelected 
                    ? 'border-transparent shadow-2xl bg-white' 
                    : 'border-transparent bg-white shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-[#F47B3E]/30'
                }`}
                style={{
                  boxShadow: isSelected ? `0 20px 40px -10px ${plan.color}30, 0 0 0 2px ${plan.color}` : undefined
                }}
              >
                {('badge' in plan && plan.badge) && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#F47B3E] to-[#E8590C] text-white text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-full shadow-lg shadow-[#F47B3E]/30">
                    {plan.badge}
                  </div>
                )}
                
                <div className="flex-grow">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: plan.color }}>{plan.duration}</span>
                    <h4 className="text-[20px] font-black text-[#111827] mt-1">{plan.name}</h4>
                    <p className="text-[11px] italic text-[#9CA3AF] mt-0.5">{plan.tagline}</p>
                  </div>

                  <div>
                    <div className="flex items-baseline">
                      <span className="text-[32px] font-black text-[#111827] tracking-tight">{plan.price}</span>
                      <span className="text-[12px] font-bold text-[#9CA3AF] ml-1.5">{plan.monthly}</span>
                    </div>

                    {'savings' in plan && plan.savings && (
                      <div className="mt-2 mb-1 inline-block bg-[#F47B3E] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {plan.savings}
                      </div>
                    )}
                    {'badgeText' in plan && plan.badgeText && (
                      <div className="mt-2 mb-1 inline-block bg-gray-100 text-gray-500 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {plan.badgeText}
                      </div>
                    )}

                    <p className="text-[13px] text-[#6B7280] leading-snug mt-2">{plan.description}</p>

                    {'addOn' in plan && plan.addOn && (
                      <p className="text-[12px] font-bold text-[#F47B3E] mt-1.5">{plan.addOn}</p>
                    )}

                    {'extraNote' in plan && plan.extraNote && (
                      <p className="text-[11px] italic text-[#9CA3AF] mt-1.5">{plan.extraNote}</p>
                    )}
                  </div>

                  <div className="text-center text-[13px] text-[#6B7280] font-medium pt-2">
                    ✅ All features included — no restrictions
                  </div>
                </div>

                {!isActive && !isDowngrade && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedPlan(key as any); setShowCheckout(true) }}
                    className="mt-5 w-full py-3 rounded-xl text-[13px] font-bold transition-all cursor-pointer"
                    style={{
                      background: isSelected ? plan.color : 'transparent',
                      color: isSelected ? '#fff' : plan.color,
                      border: isSelected ? 'none' : `2px solid ${plan.color}20`,
                    }}
                  >
                    {isUpgrade ? `Upgrade — ₹${upgradePrice.toLocaleString('en-IN')}` : 'Get Started'}
                  </button>
                )}
                {isDowngrade && (
                  <div className="mt-5 w-full py-3 rounded-xl text-[13px] font-bold text-center text-[#9CA3AF] bg-gray-50 border border-gray-200 opacity-60">
                    Unavailable (Downgrade)
                  </div>
                )}
                {isActive && (
                  <div className="mt-5 w-full py-3 rounded-xl text-[13px] font-bold text-center text-[#22C55E] bg-[#ECFDF5] border border-[#22C55E]/10">
                    ✓ Active Plan
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden mb-6">
        <div className="flex items-center justify-between p-5 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#F0FDF4] rounded-xl flex items-center justify-center">
              <Receipt className="w-4.5 h-4.5 text-[#22C55E]" />
            </div>
            <h3 className="text-[16px] font-bold text-[#111827]">Billing History</h3>
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_100px_80px] gap-2 px-5 py-3 border-b border-[#F3F4F6]">
          {['Invoice', 'Date', 'Plan', 'Amount', ''].map((h, i) => (
            <span key={i} className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {invoicesLoading ? (
          <div className="py-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_100px_80px] gap-2 items-center px-5 py-4 border-b border-[#F5F5F5] animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-24"></div>
                <div className="h-4 bg-slate-100 rounded w-20"></div>
                <div className="h-4 bg-slate-100 rounded w-28"></div>
                <div className="h-4 bg-slate-100 rounded w-16"></div>
                <div className="h-4 bg-slate-100 rounded w-4"></div>
              </div>
            ))}
          </div>
        ) : invoicesError ? (
          <div className="py-12 text-center">
            <p className="text-[13px] font-semibold text-red-600">⚠️ Could not load billing history.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-[12px] font-bold text-[#F47B3E] hover:underline"
            >
              Please try again
            </button>
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-12 text-center">
            <Receipt className="w-8 h-8 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[13px] font-semibold text-[#6B7280]">No invoices yet</p>
            <p className="text-[11px] text-[#9CA3AF] mt-1">Invoices will appear here after your first subscription.</p>
          </div>
        ) : (
          invoices.map((inv) => (
            <div key={inv.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_100px_80px] gap-2 items-center px-5 py-4 border-b border-[#F5F5F5] hover:bg-[#FAFAFA] transition-colors">
              <span className="text-[13px] font-semibold text-[#111827]">{inv.invoice_number}</span>
              <span className="text-[13px] text-[#6B7280]">{inv.date}</span>
              <span className="text-[13px] text-[#6B7280]">{inv.plan}</span>
              <span className="text-[13px] font-bold text-[#111827]">{inv.amount}</span>
              <a href={inv.download_url} download className="text-[#F47B3E] hover:text-[#E8590C] transition-colors cursor-pointer">
                <Download className="w-4 h-4" />
              </a>
            </div>
          ))
        )}
      </div>

      {/* Security Footer */}
      <div className="flex items-center justify-center gap-2 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
        <Shield className="w-3.5 h-3.5" />
        <span>128-bit SSL encrypted · Razorpay Secure · PCI-DSS Compliant</span>
      </div>

      {/* Checkout Overlay Modal */}
      <AnimatePresence>
        {showCheckout && !checkoutSuccess && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setShowCheckout(false)}
              className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-2xl w-full max-w-md p-7 relative overflow-hidden">
                <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#F47B3E]/20 to-transparent" />

                <h3 className="text-[18px] font-bold text-[#111827] mb-1">Complete Subscription</h3>
                <p className="text-[12px] text-[#6B7280] mb-5">Activate <span className="font-bold text-[#111827]">{plans[selectedPlan].name}</span> — {plans[selectedPlan].duration} for {plans[selectedPlan].price}</p>

                {formError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[11px] font-bold">{formError}</div>
                )}

                <div className="p-4 bg-[#FAFAFA] border border-[#F3F4F6] rounded-2xl mb-5 flex items-center justify-between">
                  <div>
                    <h4 className="text-[14px] font-bold text-[#111827]">{plans[selectedPlan].name}</h4>
                    <span className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest">{plans[selectedPlan].duration} Subscription</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[18px] font-black text-[#111827] block">{plans[selectedPlan].price}</span>
                    <span className="text-[9px] text-[#F47B3E] font-extrabold uppercase">{plans[selectedPlan].monthly}</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-[10px] font-bold leading-normal mb-5">
                  ⚠️ Test Mode: Use Razorpay's test credentials to simulate a payment.
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-gradient-to-r from-[#F47B3E] to-[#E8590C] hover:from-[#E06B30] hover:to-[#D4540A] text-white font-extrabold text-[12px] uppercase tracking-widest rounded-xl transition-all cursor-pointer active:scale-[0.98] shadow-lg shadow-[#F47B3E]/10 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : (
                      <><ShieldCheck className="w-4.5 h-4.5" /> Proceed to Secure Payment</>
                    )}
                  </button>
                </div>

                {!isProcessing && (
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="w-full mt-3 py-2.5 text-[12px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}

        {/* Success Modal */}
        {checkoutSuccess && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-2xl w-full max-w-md p-8 text-center relative overflow-hidden">
                <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#22C55E]/20 to-transparent" />
                
                <div className="w-16 h-16 bg-[#ECFDF5] text-[#22C55E] border border-[#22C55E]/10 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce shadow-lg shadow-[#22C55E]/10">
                  <Check className="w-8 h-8 stroke-[3.5]" />
                </div>
                <span className="text-[9px] font-black text-[#059669] bg-[#ECFDF5] border border-[#22C55E]/10 px-3 py-1 rounded-full uppercase tracking-widest">Subscription Active</span>
                <h2 className="text-[22px] font-black text-[#111827] tracking-tight mt-3">Welcome to {plans[selectedPlan].name}!</h2>
                <p className="text-[12px] text-[#6B7280] font-semibold mt-2 max-w-xs mx-auto leading-relaxed">
                  Your premium features are now unlocked. Enjoy AI-powered analytics, custom themes, and more.
                </p>

                <button
                  onClick={handleSuccessReload}
                  className="mt-6 w-full py-3.5 bg-gradient-to-r from-[#F47B3E] to-[#E8590C] text-white font-extrabold text-[12px] uppercase tracking-widest rounded-xl transition-all cursor-pointer active:scale-[0.98] shadow-lg shadow-[#F47B3E]/10"
                >
                  Continue to Dashboard
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
    </div>
  )
}
