'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Safardine Global Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-[#EEEEEE] rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-[#F47B3E] to-amber-500" />
        
        <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 shadow-lg shadow-red-500/5">
          <AlertCircle className="w-8 h-8" />
        </div>

        <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-extrabold uppercase tracking-widest rounded-full">
          System Error
        </span>

        <h1 className="text-[22px] font-black text-[#111827] mt-4 tracking-tight">Something went wrong</h1>
        <p className="text-[12px] text-[#6B7280] font-medium mt-2 leading-relaxed max-w-xs mx-auto">
          An unexpected error occurred while loading this page. Our team has been notified.
        </p>

        {error.message && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-mono text-slate-500 text-left max-h-[100px] overflow-y-auto">
            {error.message}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-[#F47B3E] to-[#E8590C] hover:from-[#E06B30] hover:to-[#D4540A] text-white font-extrabold text-[12px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#F47B3E]/10 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <a
            href="/"
            className="flex-1 py-3 px-4 bg-white border border-[#E5E7EB] hover:bg-slate-50 text-slate-700 font-extrabold text-[12px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
}
