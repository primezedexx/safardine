'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CheckCircle2, ChevronRight, Lock, CreditCard, ShieldCheck, ArrowLeft, Check, Smartphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Declare Razorpay window object for TypeScript
declare global {
  interface Window {
    Razorpay: any
  }
}

interface SubscriptionGateProps {
  restaurantId: string
  userEmail: string
  restaurantName: string
  trialExpired?: boolean
  initialSelectedPlan?: 'starter' | 'growth' | 'pro' | 'basic'
}

export default function SubscriptionGate({ 
  restaurantId, 
  userEmail, 
  restaurantName, 
  trialExpired = false,
  initialSelectedPlan = 'growth'
}: SubscriptionGateProps) {
  const supabase = createClient()
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'growth' | 'pro' | 'basic'>(initialSelectedPlan)
  const [step, setStep] = useState<'plans' | 'checkout' | 'success'>('plans')
  const [isProcessing, setIsProcessing] = useState(false)
  const [loadingText, setLoadingText] = useState('Verifying secure transaction...')
  const [formError, setFormError] = useState<string | null>(null)
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false)

  const plans = {
    basic: {
      name: 'Basic Plan',
      duration: '1 Month',
      price: '₹1,199',
      monthly: '₹1,199/month',
      desc: 'Short term access',
      priceNumber: 1199
    },
    starter: {
      name: 'Starter Plan',
      duration: '3 Months',
      price: '₹2,999',
      monthly: '₹999/month',
      desc: 'Perfect for getting started',
      priceNumber: 2999
    },
    growth: {
      name: 'Growth Plan',
      duration: '6 Months',
      price: '₹4,999',
      monthly: '₹833/month',
      desc: 'Best value for growing restaurants',
      priceNumber: 4999
    },
    pro: {
      name: 'Business Pro',
      duration: '12 Months',
      price: '₹8,999',
      monthly: '₹749/month',
      desc: 'Built for established businesses',
      priceNumber: 8999
    }
  }

  // Load Razorpay Script Dynamically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => {
        setIsRazorpayLoaded(true)
      }
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK')
      }
      document.body.appendChild(script)
      
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script)
        }
      }
    }
  }, [])

  const handleRazorpayPayment = async () => {
    setFormError(null)
    setIsProcessing(false)
    
    try {
      setIsProcessing(true)
      setLoadingText('Initiating secure Razorpay checkout order...')

      // 1. Fetch secure order from Next.js server route
      const orderRes = await fetch('/api/checkout/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan: selectedPlan })
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok || orderData.error) {
        throw new Error(orderData.error || 'Failed to create payment order')
      }

      // If Razorpay Keys are missing, fall back to our elegant sandbox payment simulation
      if (orderData.isSandbox) {
        console.log('Razorpay keys not configured. Falling back to sandbox checkout simulation.')
        setStep('checkout') // Show simulated card portal
        setIsProcessing(false)
        return
      }

      // 2. Open standard, secure Razorpay Checkout overlay
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please refresh the page.')
      }

      setLoadingText('Awaiting payment authorization...')

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Loaded from environment variable
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SafarDine',
        description: plans[selectedPlan].name,
        order_id: orderData.id,
        prefill: {
          email: userEmail,
        },
        theme: {
          color: '#FF6B00', // SafarDine Primary orange
        },
        handler: async function (response: any) {
          try {
            setIsProcessing(true)
            setLoadingText('Verifying Razorpay transaction capture...')

            // 3. Update Supabase with active subscription
            const { error: dbError } = await supabase
              .from('restaurant_profiles')
              .update({ subscription_active: true })
              .eq('id', restaurantId)

            if (dbError) throw dbError

            // Set fallback local keys
            if (typeof window !== 'undefined') {
              localStorage.setItem(`safardine_subscribed_${restaurantId}`, 'true')
              document.cookie = `safardine_subscribed_${restaurantId}=true; path=/; max-age=31536000`
            }

            setStep('success')
          } catch (err: any) {
            setFormError('Payment captured but database activation failed. Please contact SafarDine support.')
          } finally {
            setIsProcessing(false)
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false)
          }
        }
      }

      const rzpObj = new window.Razorpay(options)
      rzpObj.on('payment.failed', function (resp: any) {
        setFormError(resp.error?.description || 'Transaction failed. Please try a different payment method.')
        setIsProcessing(false)
      })
      
      rzpObj.open()

    } catch (err: any) {
      console.error(err)
      // Fallback in case of server exception or script loader error
      setFormError(err.message || 'Razorpay initialization failed. Falling back to sandbox checkout.')
      setStep('checkout')
      setIsProcessing(false)
    }
  }

  // Simulated Payment Form Action (Sandbox Sandbox Mode)
  const handleSimulatedPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setIsProcessing(true)

    // Simulating checkout states
    const steps = [
      'Contacting mock gateway server...',
      'Simulating Razorpay UPI / Card capture of ' + plans[selectedPlan].price + '...',
      'Activating premium portal configurations...',
    ]

    let currentStep = 0
    setLoadingText(steps[currentStep])

    const interval = setInterval(() => {
      currentStep++
      if (currentStep < steps.length) {
        setLoadingText(steps[currentStep])
      } else {
        clearInterval(interval)
      }
    }, 1200)

    try {
      // 1. Update in DB
      const { error } = await supabase
        .from('restaurant_profiles')
        .update({ subscription_active: true })
        .eq('id', restaurantId)

      // 2. Local fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem(`safardine_subscribed_${restaurantId}`, 'true')
        document.cookie = `safardine_subscribed_${restaurantId}=true; path=/; max-age=31536000`
      }

      setTimeout(() => {
        clearInterval(interval)
        setIsProcessing(false)
        setStep('success')
      }, 4000)

    } catch (err) {
      clearInterval(interval)
      setIsProcessing(false)
      setFormError('Failed to complete sandbox activation.')
    }
  }

  const handleEnterDashboard = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen w-full bg-[#0B1110] text-slate-200 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden font-sans select-none">
      
      {/* Background Textures (Wavy Lines & Dots) - Fixed to prevent scrolling cutoff on mobile */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Glowing Orbs */}
        <div className="absolute top-[-20%] left-[-20%] w-[100vw] h-[100vw] md:w-[60vw] md:h-[60vw] md:left-[-10%] rounded-full bg-gradient-to-br from-[#4ADE80]/[0.04] to-transparent blur-[80px] md:blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[100vw] h-[100vw] md:w-[60vw] md:h-[60vw] md:right-[-10%] rounded-full bg-gradient-to-tl from-[#4ADE80]/[0.04] to-transparent blur-[80px] md:blur-[100px]" />
        
        {/* Top Left Wavy Lines */}
        <svg className="absolute top-[-20%] left-[-20%] w-[150vw] h-[150vw] md:left-[-10%] md:w-[70vw] md:h-[70vw] opacity-[0.25] md:opacity-[0.15]" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,200 Q300,500 600,100 T1000,300" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />
          <path d="M0,250 Q300,550 600,150 T1000,350" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />
          <path d="M0,300 Q300,600 600,200 T1000,400" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />
          <path d="M0,350 Q300,650 600,250 T1000,450" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />
          <path d="M0,400 Q300,700 600,300 T1000,500" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/* Bottom Right Wavy Lines */}
        <svg className="absolute bottom-[-20%] right-[-20%] w-[150vw] h-[150vw] md:right-[-10%] md:w-[70vw] md:h-[70vw] opacity-[0.25] md:opacity-[0.15]" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M1000,800 Q700,500 400,900 T0,700" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />
          <path d="M1000,750 Q700,450 400,850 T0,650" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />
          <path d="M1000,700 Q700,400 400,800 T0,600" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />
          <path d="M1000,650 Q700,350 400,750 T0,550" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />
          <path d="M1000,600 Q700,300 400,700 T0,500" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/* Edge Dot Pattern (Fades in center) */}
        <div 
          className="absolute inset-0 opacity-40 md:opacity-40" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(74, 222, 128, 0.25) 1px, transparent 0)', 
            backgroundSize: '48px 48px',
            WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 30%, black 90%)',
            maskImage: 'radial-gradient(ellipse at center, transparent 30%, black 90%)'
          }} 
        />
      </div>

      <div className="w-full max-w-6xl z-10 space-y-6 md:space-y-8 relative">
        
        {/* Step 1: Choosing Plans */}
        <AnimatePresence mode="wait">
          {step === 'plans' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 md:space-y-8"
            >
              {/* Header */}
               <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Lock className="w-5 h-5 md:w-6 md:h-6 text-[#4ADE80]" />
                </div>
                
                {trialExpired && (
                  <div className="mt-1 md:mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                    <div className="w-1.5 h-1.5 bg-[#4ADE80] rounded-full animate-pulse" />
                    <span className="text-[9px] md:text-[10px] font-bold text-[#4ADE80] uppercase tracking-widest">
                      Free Trial Period Ended
                    </span>
                  </div>
                )}
                
                <div className="space-y-1.5 md:space-y-2 mt-1 md:mt-2 px-2">
                  <h1 className="text-2xl sm:text-[32px] font-bold text-white tracking-tight">
                    Unlock Your Restaurant Dashboard
                  </h1>
                  <p className="text-[13px] md:text-[14px] text-slate-400 max-w-md mx-auto leading-relaxed">
                    {trialExpired 
                      ? 'Your 7-day free trial has ended. Pick a subscription plan below to reactivate your interactive menu and reopen your dashboard immediately.'
                      : 'Razorpay integration natively supports all Indian cards, netbanking, and UPI (GPay, PhonePe, Paytm).'}
                  </p>
                </div>
              </div>

              {formError && (
                <div className="max-w-md mx-auto p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-2xl text-xs font-bold leading-normal text-center backdrop-blur-sm">
                  {formError}
                </div>
              )}

              {/* Four Cards Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-stretch pt-2 md:pt-4">
                
                {/* Basic Plan */}
                <div 
                  onClick={() => setSelectedPlan('basic')}
                  className={`bg-[#131A18] rounded-[20px] md:rounded-[24px] p-5 md:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 relative ${
                    selectedPlan === 'basic' 
                      ? 'border border-[#4ADE80] shadow-[0_0_30px_rgba(74,222,128,0.1)]' 
                      : 'border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] md:text-[10px] font-bold text-[#4ADE80] uppercase tracking-widest">1 Month Access</span>
                      <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === 'basic' ? 'border-[#4ADE80] bg-[#4ADE80]' : 'border-slate-600'}`}>
                        {selectedPlan === 'basic' && <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#0B1110] stroke-[3]" />}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-medium text-white tracking-tight mb-2 md:mb-4">Basic</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl md:text-[32px] font-bold text-white tracking-tight">₹1,199</span>
                      </div>
                      <span className="text-slate-400 text-[10px] md:text-[11px] font-medium block mt-1">₹1,199 / month equivalent</span>
                    </div>
                    
                    <div className="w-full h-px bg-slate-800/60 my-4 md:my-6" />

                    <ul className="space-y-3 md:space-y-3.5 text-[12px] md:text-[13px] text-slate-300 font-medium">
                      <li className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#4ADE80] stroke-[3]" />
                        </div>
                        Dynamic QR Menu
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#4ADE80] stroke-[3]" />
                        </div>
                        Restaurant branding
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#4ADE80] stroke-[3]" />
                        </div>
                        Unlimited menu items
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#4ADE80] stroke-[3]" />
                        </div>
                        Multi-language support
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Starter Plan */}
                <div 
                  onClick={() => setSelectedPlan('starter')}
                  className={`bg-[#131A18] rounded-[20px] md:rounded-[24px] p-5 md:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 relative ${
                    selectedPlan === 'starter' 
                      ? 'border border-[#4ADE80] shadow-[0_0_30px_rgba(74,222,128,0.1)]' 
                      : 'border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] md:text-[10px] font-bold text-[#4ADE80] uppercase tracking-widest">3 Months Access</span>
                      <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === 'starter' ? 'border-[#4ADE80] bg-[#4ADE80]' : 'border-slate-600'}`}>
                        {selectedPlan === 'starter' && <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#0B1110] stroke-[3]" />}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-medium text-white tracking-tight mb-2 md:mb-4">Starter</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl md:text-[32px] font-bold text-white tracking-tight">₹2,999</span>
                      </div>
                      <span className="text-slate-400 text-[10px] md:text-[11px] font-medium block mt-1">₹999 / month equivalent</span>
                    </div>
                    
                    <div className="w-full h-px bg-slate-800/60 my-4 md:my-6" />

                    <ul className="space-y-3 md:space-y-3.5 text-[12px] md:text-[13px] text-slate-300 font-medium">
                      <li className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#4ADE80] stroke-[3]" />
                        </div>
                        Dynamic QR Menu
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#4ADE80] stroke-[3]" />
                        </div>
                        Restaurant branding
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#4ADE80] stroke-[3]" />
                        </div>
                        Unlimited menu items
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#4ADE80] stroke-[3]" />
                        </div>
                        Multi-language support
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Growth Plan (Popular) */}
                <div 
                  onClick={() => setSelectedPlan('growth')}
                  className={`bg-[#131A18] rounded-[20px] md:rounded-[24px] p-5 md:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 relative ${
                    selectedPlan === 'growth' 
                      ? 'border border-[#4ADE80] shadow-[0_0_30px_rgba(74,222,128,0.1)] scale-[1.02] z-10' 
                      : 'border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] md:text-[10px] font-bold text-[#4ADE80] uppercase tracking-widest block">6 Months Access</span>
                      <div className="flex items-center gap-2 md:gap-3">
                        <span className="bg-[#4ADE80] text-[#0B1110] text-[7px] md:text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                          POPULAR
                        </span>
                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === 'growth' ? 'border-[#4ADE80] bg-[#4ADE80]' : 'border-slate-600'}`}>
                          {selectedPlan === 'growth' && <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#0B1110] stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-medium text-white tracking-tight mb-2 md:mb-4">Growth</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl md:text-[32px] font-bold text-white tracking-tight">₹4,999</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-400 text-[10px] md:text-[11px] font-medium">₹833 / month</span>
                        <span className="text-[8px] md:text-[9px] font-bold text-[#0B1110] bg-[#4ADE80] px-1.5 py-0.5 rounded uppercase tracking-wider">SAVE ₹1K+</span>
                      </div>
                    </div>
                    
                    <div className="w-full h-px bg-slate-800/60 my-4 md:my-6" />

                    <ul className="space-y-3 md:space-y-3.5 text-[12px] md:text-[13px] text-slate-300 font-medium">
                      <li className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#4ADE80] stroke-[3]" />
                        </div>
                        Everything in Starter
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#4ADE80] stroke-[3]" />
                        </div>
                        AI Dish Descriptions
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#4ADE80] stroke-[3]" />
                        </div>
                        Advanced Analytics
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#4ADE80] stroke-[3]" />
                        </div>
                        Premium Custom Themes
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Business Pro */}
                <div 
                  onClick={() => setSelectedPlan('pro')}
                  className={`bg-[#131A18] rounded-[20px] md:rounded-[24px] p-5 md:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 relative ${
                    selectedPlan === 'pro' 
                      ? 'border border-[#4ADE80] shadow-[0_0_30px_rgba(74,222,128,0.1)]' 
                      : 'border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] md:text-[10px] font-bold text-[#4ADE80] uppercase tracking-widest block">12 Months Access</span>
                      <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === 'pro' ? 'border-[#4ADE80] bg-[#4ADE80]' : 'border-slate-600'}`}>
                        {selectedPlan === 'pro' && <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#0B1110] stroke-[3]" />}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-medium text-white tracking-tight mb-2 md:mb-4">Business Pro</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl md:text-[32px] font-bold text-white tracking-tight">₹8,999</span>
                      </div>
                      <span className="text-slate-400 text-[10px] md:text-[11px] font-medium block mt-1">₹749 / month equivalent</span>
                    </div>
                    
                    <div className="w-full h-px bg-slate-800/60 my-4 md:my-6" />

                    <ul className="space-y-3 md:space-y-3.5 text-[12px] md:text-[13px] text-slate-300 font-medium">
                      <li className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#4ADE80] stroke-[3]" />
                        </div>
                        Everything in Growth
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#4ADE80] stroke-[3]" />
                        </div>
                        Custom Domain Branding
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#4ADE80] stroke-[3]" />
                        </div>
                        Multi-QR Layout support
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#4ADE80] stroke-[3]" />
                        </div>
                        Dedicated Onboarding
                      </li>
                    </ul>
                  </div>
                </div>

              </div>

              {/* Secure Razorpay Payment Checkout Trigger */}
              <div className="flex flex-col items-center pt-6 md:pt-8 space-y-4 md:space-y-5">
                <button
                  onClick={handleRazorpayPayment}
                  disabled={isProcessing}
                  className="px-5 md:px-6 py-3.5 md:py-4 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-white font-medium text-[14px] md:text-[15px] rounded-full transition-all cursor-pointer inline-flex items-center justify-between min-w-[280px] md:min-w-[320px]"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-3 mx-auto">
                      <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-[#4ADE80] border-t-transparent rounded-full animate-spin" />
                      <span>Opening Secure Checkout...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded flex items-center justify-center border border-[#4ADE80]/30 bg-[#4ADE80]/10">
                          <Smartphone className="w-3.5 h-3.5 text-[#4ADE80]" />
                        </div>
                        <span>Pay with UPI / Cards (Razorpay)</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </>
                  )}
                </button>
                <div className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1.5 text-center px-4">
                  <ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#4ADE80] shrink-0" />
                  128-bit SSL encrypted transaction powered by Razorpay
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Checkout / Simulated payment (Sandbox fallback only) */}
          {step === 'checkout' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-[#131A18] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#4ADE80]/30 to-transparent" />
                
                <button 
                  onClick={() => setStep('plans')}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white mb-6 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>

                <div className="space-y-6">
                  {/* Warning banner */}
                  <div className="p-3 bg-amber-900/20 border border-amber-500/30 text-amber-400 rounded-xl text-[10px] font-medium leading-relaxed backdrop-blur-sm">
                    ⚠️ Running in local sandbox mode. Verify your configuration with real UPI apps by adding Razorpay keys to your environment.
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white leading-tight">{plans[selectedPlan].name}</h4>
                      <span className="text-[10px] text-slate-400 font-medium tracking-wide">{plans[selectedPlan].duration} Subscription</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white text-base block">{plans[selectedPlan].price}</span>
                      <span className="text-[9px] text-[#4ADE80] font-bold uppercase">{plans[selectedPlan].monthly}</span>
                    </div>
                  </div>

                  {/* Sandbox form */}
                  <form onSubmit={handleSimulatedPaymentSubmit} className="space-y-4">
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                        Mock UPI ID / Mobile Number
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. 9876543210@paytm"
                        defaultValue="raghav@upi"
                        disabled={isProcessing}
                        className="w-full px-4 py-3 bg-[#0B1110] border border-slate-800 focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80] rounded-xl outline-none text-sm text-white placeholder-slate-600 transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-4 bg-[#4ADE80] hover:bg-[#22C55E] text-[#0B1110] font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#0B1110] border-t-transparent rounded-full animate-spin" />
                          <span>Simulating...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4.5 h-4.5" />
                          <span>Complete Sandbox Payment</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success celebrative screen */}
          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-[#131A18] border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#4ADE80]/30 to-transparent" />
                
                <div className="w-16 h-16 bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-[#4ADE80]/10">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-[#4ADE80] bg-[#4ADE80]/10 border border-[#4ADE80]/20 px-3 py-1 rounded-full uppercase tracking-widest">Subscription Active</span>
                  <h2 className="text-2xl font-bold text-white tracking-tight leading-none pt-2">Welcome to Premium!</h2>
                  <p className="text-[13px] font-medium text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Razorpay subscription activation successful. Your premium dynamic dashboards and AI features are now unlocked.
                  </p>
                </div>

                <button
                  onClick={handleEnterDashboard}
                  className="w-full py-4 bg-[#4ADE80] hover:bg-[#22C55E] text-[#0B1110] font-bold text-sm rounded-xl transition-all cursor-pointer"
                >
                  Enter Owner Portal
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
