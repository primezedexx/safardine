'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Sparkles, ShieldCheck, ChevronDown, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupClient({ error, signupAction }: { error?: string; signupAction: (formData: FormData) => Promise<void> }) {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // =========================================================================
  // Google OAuth Mode Switcher
  // Set to 'true' to trigger real Google OAuth prompts for your live end-users.
  // Set to 'false' to use our frictionless Developer Mock Bypass for easy phone testing!
  // =========================================================================
  const useRealGoogleOAuth = true

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleSubmitting(true)
      setLocalError(null)
      const supabase = createClient()
      const origin = window.location.origin
      
      if (useRealGoogleOAuth) {
        // ============================================================
        // PRODUCTION MODE: Real Google OAuth for actual end-users!
        // ============================================================
        const { error: oAuthError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${origin}/api/auth/callback`
          }
        })

        if (oAuthError) {
          console.error("Google production OAuth error:", oAuthError)
          setLocalError(oAuthError.message)
          setIsGoogleSubmitting(false)
        }
      } else {
        // ============================================================
        // DEVELOPMENT & DEMO MODE: Frictionless Developer Mock Bypass!
        // ============================================================
        const demoEmail = 'google-dev-active@safardine.com'
        const demoPassword = 'developerpassword123!'

        // Attempt to sign in silently with the mock Google Developer Account
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPassword
        })

        // Sign up if user does not exist
        if (signInError && signInError.message.toLowerCase().includes('invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: demoEmail,
            password: demoPassword
          })

          if (!signUpError) {
            // Retry signing in
            const { error: retryError } = await supabase.auth.signInWithPassword({
              email: demoEmail,
              password: demoPassword
            })
            if (retryError) {
              if (retryError.message.toLowerCase().includes('email not confirmed')) {
                throw new Error("EMAIL_NOT_CONFIRMED")
              }
              throw retryError
            }
          } else {
            if (signUpError.message.toLowerCase().includes('email not confirmed')) {
              throw new Error("EMAIL_NOT_CONFIRMED")
            }
            throw signUpError
          }
        } else if (signInError) {
          if (signInError.message.toLowerCase().includes('email not confirmed')) {
            throw new Error("EMAIL_NOT_CONFIRMED")
          }
          throw signInError
        }

        // Provision restaurant profile for the new mock user if not already linked
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: role } = await supabase
            .from('user_roles')
            .select('restaurant_id')
            .eq('id', user.id)
            .maybeSingle()

          // Fetch profile details from restaurant_profiles to check setup
          const { data: profile } = await supabase
            .from('restaurant_profiles')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle()

          if (!profile) {
            await supabase
              .from('restaurant_profiles')
              .insert({
                user_id: user.id,
                restaurant_name: 'Google Premium Bistro',
                restaurant_description: 'A luxurious experimental bistro fueled by Google recommendations and Safar Dine experiences.',
                restaurant_slug: 'google-premium-bistro',
                restaurant_category: 'Fine Dining',
                setup_completed: true
              })
          }
        }

        window.location.href = '/dashboard'
      }

    } catch (e: any) {
      console.error("Google Developer bypass exception:", e)
      
      if (e.message === "EMAIL_NOT_CONFIRMED") {
        setLocalError(
          "⚠️ Email confirmation is still active or you have a stale unconfirmed user. " + 
          "To test: Go to Supabase Dashboard > Authentication > Users, find the old 'google-developer' emails, " + 
          "delete them, and click Continue with Google again!"
        )
      } else {
        setLocalError(e.message || "Failed to initiate Google session.")
      }
      
      setIsGoogleSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-white font-sans tracking-tight text-slate-700 flex flex-col justify-between items-center py-12 px-4 select-none relative">
      
      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-1.5 text-[13px] font-bold text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>
      
      {/* Spacer top */}
      <div />

      {/* Main Form Box Container */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 100, damping: 18 }}
        className="w-full max-w-[380px] flex flex-col items-center space-y-6 text-center"
      >
        
        {/* Centered Top Hand-Drawn Neo-Brutalist Logo */}
        <div className="w-12 h-12 rounded-xl border-2 border-slate-900 bg-white flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] select-none">
          <Sparkles className="w-5.5 h-5.5 text-slate-900 fill-slate-900" />
        </div>

        {/* Headlines */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create an account.</h1>
          <p className="text-sm font-semibold text-slate-400">Start managing your interactive menu</p>
        </div>

        {/* Error message banner */}
        {(error || localError) && (
          <div className="w-full p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold flex items-start gap-2.5 leading-normal text-left">
            <ShieldCheck className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{decodeURIComponent(error || localError || "")}</span>
          </div>
        )}

        {/* Signup Form */}
        <form 
          onSubmit={() => setIsSubmitting(true)} 
          action={signupAction} 
          className="w-full space-y-4"
        >
          {/* Restaurant Name field */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="restaurantName">
              Restaurant Name
            </label>
            <input 
              id="restaurantName" 
              name="restaurantName" 
              type="text" 
              placeholder="Enter your restaurant name..."
              required 
              className="w-full px-3 py-3 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-lg outline-none text-sm text-slate-800 placeholder-slate-300 font-medium transition-all bg-white shadow-sm" 
            />
          </div>

          {/* Email field */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="email">
              Email
            </label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="Enter your email address..."
              required 
              className="w-full px-3 py-3 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-lg outline-none text-sm text-slate-800 placeholder-slate-300 font-medium transition-all bg-white shadow-sm" 
            />
            <p className="text-[10px] text-slate-400 font-medium leading-normal">
              Use your business or restaurant email.
            </p>
          </div>

          {/* Password field */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input 
                id="password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="Choose a strong password..."
                required 
                className="w-full pl-3 pr-10 py-3 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-lg outline-none text-sm text-slate-800 placeholder-slate-300 font-medium transition-all bg-white shadow-sm" 
              />
              
              {/* Show/Hide password toggler */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action button */}
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm rounded-lg transition-all cursor-pointer flex items-center justify-center active:scale-[0.99] shadow-sm shadow-orange-500/5 mt-2"
          >
            {isSubmitting ? 'Registering...' : 'Sign up'}
          </button>

        </form>

        {/* Divider */}
        <div className="relative flex py-1 w-full items-center select-none">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-4 text-[10.5px] font-extrabold text-slate-400 uppercase tracking-widest">
            or
          </span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        {/* Single Full-Width High-End Google OAuth Button */}
        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleSubmitting}
          className="w-full flex items-center justify-center py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer text-xs font-bold text-slate-700 gap-2.5 bg-white shadow-sm disabled:opacity-50 active:scale-[0.99]"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>{isGoogleSubmitting ? 'Connecting...' : 'Continue with Google'}</span>
        </button>

        {/* Redirect log in */}
        <div className="text-[12.5px] font-bold text-slate-400 pt-1">
          Already have an account?{' '}
          <Link href="/login" className="text-slate-700 underline hover:text-slate-800 transition-colors">
            Log in
          </Link>
        </div>

        {/* Disclaimers terms & privacy */}
        <p className="text-[9.5px] text-slate-400 font-semibold leading-relaxed max-w-[280px]">
          By registering, you acknowledge that you understand and agree to the{' '}
          <Link href="/terms" className="underline hover:text-slate-500">Terms & Conditions</Link> and{' '}
          <Link href="/privacy" className="underline hover:text-slate-500">Privacy Policy</Link>.
        </p>

      </motion.div>

      {/* Language footer drop-down */}
      <footer className="w-full flex justify-center text-[11px] font-bold text-slate-400 gap-1 mt-12 select-none">
        <span className="flex items-center gap-1 cursor-pointer hover:text-slate-500 transition-colors">
          🌐 Language: English (US) <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </span>
      </footer>

    </div>
  )
}
