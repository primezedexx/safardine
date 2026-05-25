'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ShieldCheck, Sparkles, Lock, Eye } from "lucide-react"

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      content: "We collect two categories of information: Account data you provide directly (such as your name, restaurant name, restaurant location, email, and password) and operational menu data (such as dish titles, pricing, descriptions, and pictures) needed to generate and translate your interactive diner sites."
    },
    {
      title: "2. How We Collect Visitor/Diner Data",
      content: "When diners scan your restaurant QR codes, we track anonymous transaction telemetry (scan timestamp, visitor browser language preference, selected menu categories, and anonymous session IDs). We DO NOT collect personal identifiable details (PII) of your diners unless they explicitly place a digital order, in which case their mobile number is retained solely to facilitate the dining transaction."
    },
    {
      title: "3. OpenAI and Machine Learning Processing",
      content: "To power our state-of-the-art multilingual auto-translation and smart AI upselling recommendations, uploaded menu descriptions are securely transmitted to OpenAI API servers. No personal user credentials or analytics tracking parameters are shared with AI sub-processors. All external processing complies with strict corporate data protection mandates."
    },
    {
      title: "4. Cookies & Local Storage",
      content: "We utilize primary essential cookies and local browser storage to keep you securely authenticated on your dashboard and to remember the preferred translation language of diners as they browse your live digital menus. You can configure your browser to reject cookies, though some platform features may operate with reduced performance."
    },
    {
      title: "5. Data Retention & Erasure",
      content: "Your uploaded menu resources, logs, and account metadata are retained as long as your restaurant profile is active. You hold the absolute right to modify, download, or permanently delete your account and associated database records directly from your dashboard settings panel at any time."
    },
    {
      title: "6. Operational Data Safety & Protection",
      content: "Safar Dine utilizes industry-leading PostgreSQL database safeguards, Supabase SSL transport encryption, and granular Row Level Security (RLS) policies to isolate and protect your restaurant profile. We will never sell, trade, or distribute your customer metrics or restaurant data to third parties."
    }
  ]

  return (
    <div className="relative min-h-screen w-full bg-white text-slate-800 selection:bg-orange-500 selection:text-white overflow-hidden py-12 px-4 sm:px-6">
      
      {/* Radial Glowing Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[90vw] max-w-[800px] h-[500px] bg-gradient-to-tr from-orange-100/35 to-amber-100/25 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-100px] left-0 -translate-x-1/3 w-[45vw] h-[45vw] bg-amber-50/20 rounded-full blur-[120px]" />
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
            <Lock className="w-3.5 h-3.5" /> Security & Trust
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-slate-500 mt-3 text-base sm:text-lg max-w-2xl leading-relaxed">
            At Safar Dine, we hold your business trust and data integrity in the highest regard. Review how we protect and govern restaurant records.
          </p>
          <div className="text-xs text-slate-400 mt-2 font-medium">
            Last Updated: May 19, 2026
          </div>
        </motion.div>

        {/* Structured privacy details */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-100/50 space-y-8"
        >
          <div className="flex items-center gap-2 pb-5 border-b border-slate-100">
            <Eye className="w-5.5 h-5.5 text-orange-500" />
            <h2 className="text-lg font-bold text-slate-900">How We Govern & Protect Data</h2>
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
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 stroke-[2.5]" />
              <span>Granular RLS (Row Level Security) Active</span>
            </div>
            <Link 
              href="/signup"
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-orange-500/10 active:scale-95"
            >
              Confirm Acceptance
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
