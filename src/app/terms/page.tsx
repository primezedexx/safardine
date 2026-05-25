'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Shield, Sparkles, Scale, BookOpen } from "lucide-react"

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By creating an account, accessing, or using Safar Dine (the 'Service'), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services. Safar Dine provides an AI-powered QR menu creation, translation, and analytics SaaS platform for restaurants and food services."
    },
    {
      title: "2. Account Security & Verification",
      content: "When registering, you must provide accurate, current, and complete information. You are solely responsible for safeguarding the credentials you use to access the Service. Any actions taken through your account are your responsibility. In our beta phase, we reserve the right to verify and limit registrations to active food establishments."
    },
    {
      title: "3. Service Availability & AI Translations",
      content: "Safar Dine utilizes cutting-edge artificial intelligence, including OpenAI, to automatically translate menus and recommend pairings. While we strive for extreme accuracy, translations are provided 'as-is'. Establishments must review AI-generated allergen descriptions and translated dish descriptions to ensure correct representation to diners."
    },
    {
      title: "4. Intellectual Property & Menu Ownership",
      content: "You retain all intellectual property rights to the menu content, images, and brand assets you upload. By uploading them, you grant Safar Dine a worldwide, non-exclusive license to host, translate, analyze, and display your menu to diners scanning your generated QR codes."
    },
    {
      title: "5. Subscriptions, Payments & Cancellations",
      content: "Subscription plans (Starter, Pro, Enterprise) are billed on a recurring monthly or annual basis. You can cancel your subscription at any time. Upon cancellation, your digital menus will remain active until the end of the billing period. Refunds are subject to our operational discretion."
    },
    {
      title: "6. Limitation of Liability",
      content: "Safar Dine, its founders, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or guest goodwill arising out of your access to or use of the AI menu platform."
    }
  ]

  return (
    <div className="relative min-h-screen w-full bg-white text-slate-800 selection:bg-orange-500 selection:text-white overflow-hidden py-12 px-4 sm:px-6">
      
      {/* Radial Glowing Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[90vw] max-w-[800px] h-[500px] bg-gradient-to-tr from-orange-100/35 to-amber-100/25 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-100px] right-0 translate-x-1/3 w-[45vw] h-[45vw] bg-orange-50/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto z-10 relative">
        {/* Back navigation */}
        <Link 
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors duration-200 mb-8 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Login</span>
        </Link>

        {/* Header Hero Area */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center md:text-left mb-12"
        >
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-semibold uppercase tracking-wider mb-4">
            <Scale className="w-3.5 h-3.5" /> Legal Framework
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Terms & Conditions
          </h1>
          <p className="text-slate-500 mt-3 text-base sm:text-lg max-w-2xl leading-relaxed">
            Welcome to Safar Dine. Please read these terms carefully before utilizing our AI-powered interactive QR menu platform.
          </p>
          <div className="text-xs text-slate-400 mt-2 font-medium">
            Last Updated: May 19, 2026
          </div>
        </motion.div>

        {/* Structured legal terms */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-100/50 space-y-8"
        >
          <div className="flex items-center gap-2 pb-5 border-b border-slate-100">
            <BookOpen className="w-5.5 h-5.5 text-orange-500" />
            <h2 className="text-lg font-bold text-slate-900">Platform Agreement & Guidelines</h2>
          </div>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-base font-extrabold text-slate-800 tracking-tight">{section.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Secure platform hosting.</span>
            </div>
            <Link 
              href="/signup"
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-orange-500/10 active:scale-95"
            >
              Accept & Sign Up
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
