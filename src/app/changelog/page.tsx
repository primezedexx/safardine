'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Sparkles, Zap, Award, Calendar, Check } from "lucide-react"

export default function ChangelogPage() {
  const changelogs = [
    {
      version: "v0.1.0",
      title: "The Official Beta Launch — What's Shipping Today!",
      date: "May 19, 2026",
      tagline: "Empowering restaurants across Maharashtra, Mumbai to launch intelligent QR code menus instantly.",
      description: "Today, we are incredibly excited to officially open up Safar Dine's beta phase. Our mission is simple: to make dining out more interactive, seamless, and global. Here is a breakdown of the core modules deployed and fully active starting today:",
      features: [
        {
          name: "Automatic Desi & Global Translations",
          detail: "Say goodbye to multiple paper menus. Guests can scan and instantly translate the entire menu into Hindi, Spanish, French, German, and Japanese natively without downloading any app."
        },
        {
          name: "AI-Powered Upselling Engine",
          detail: "Integrated with OpenAI's gpt-4o-mini, our smart recommendations engine analyzes diner selections in real-time to suggest the perfect complimentary side dishes and beverages."
        },
        {
          name: "Live Analytics & Tracking Dashboard",
          detail: "Restaurant owners get real-time metrics on scan frequency, visitor counts, popular items, language preferences, and simulated conversion indicators."
        },
        {
          name: "Custom High-End Printed QR Packs",
          detail: "Generate and configure customized dining assets featuring custom logos, table QR designations, and brand identifiers ready for printing."
        }
      ],
      author: {
        name: "Saurabh Verma",
        role: "Founder, Safar Dine",
        avatar: "/founder.jpg"
      }
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
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors duration-200 mb-8 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>

        {/* Header Hero Area */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center md:text-left mb-16"
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-semibold uppercase tracking-wider mb-4 animate-pulse">
            <Zap className="w-3.5 h-3.5" /> Product Updates & Logs
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-none">
            The Safar Dine Changelog
          </h1>
          <p className="text-slate-500 mt-4 text-base sm:text-lg max-w-2xl leading-relaxed">
            Follow our chronological progress as we ship next-generation features and updates to dining tables across the globe.
          </p>
        </motion.div>

        {/* Chronological logs list */}
        <div className="relative border-l-2 border-slate-100 pl-6 sm:pl-10 space-y-12">
          {changelogs.map((log, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 * idx }}
              className="relative group"
            >
              {/* Timeline pin point */}
              <div className="absolute -left-[35px] sm:-left-[51px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-orange-500 shadow-md flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse" />
              </div>

              {/* Log Card Box */}
              <div className="bg-white/85 backdrop-blur-xl border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-100/30 space-y-6">
                
                {/* Release metadata */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1 rounded-xl bg-orange-500 text-white font-extrabold text-xs">
                      {log.version}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                      <Calendar className="w-3.5 h-3.5" /> {log.date}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-0.5">
                    🚀 Fully Live
                  </span>
                </div>

                {/* Content info */}
                <div className="space-y-4">
                  <h2 className="text-xl sm:text-3xl font-black text-slate-900 leading-snug tracking-tight">
                    {log.title}
                  </h2>
                  <p className="text-sm sm:text-base font-bold text-slate-700 italic leading-relaxed">
                    "{log.tagline}"
                  </p>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    {log.description}
                  </p>
                </div>

                {/* Features list */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Key Deployed Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {log.features.map((feat, fIdx) => (
                      <div key={fIdx} className="p-4 bg-slate-50/55 rounded-2xl border border-slate-100/80 space-y-1 hover:border-slate-200 transition-colors">
                        <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-orange-500 stroke-[3]" />
                          {feat.name}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium pl-5.5">
                          {feat.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Author Card info */}
                <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
                  <img 
                    src={log.author.avatar} 
                    alt={log.author.name} 
                    className="w-10 h-10 rounded-full border border-slate-200 object-cover" 
                  />
                  <div>
                    <span className="text-xs font-extrabold text-slate-800 block">{log.author.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">{log.author.role}</span>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
