'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Safardine Dashboard Error:', error)
  }, [error])

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-[#EEEEEE] rounded-3xl p-8 text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#F47B3E]" />
        
        <div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto mb-5 text-[#F47B3E] shadow-sm">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <span className="px-2.5 py-0.5 bg-[#FFF7ED] text-[#F47B3E] text-[10px] font-extrabold uppercase tracking-widest rounded-full">
          Module Error
        </span>

        <h2 className="text-[20px] font-black text-[#111827] mt-3 tracking-tight">Could not load this section</h2>
        <p className="text-[12px] text-[#6B7280] font-medium mt-2 leading-relaxed max-w-xs mx-auto">
          An error occurred in this dashboard component. You can reload this section or navigate to other tabs using the menu.
        </p>

        {error.message && (
          <div className="mt-4 p-3 bg-[#FAFAFA] border border-[#F3F4F6] rounded-xl text-[11px] font-mono text-[#6B7280] text-left max-h-[80px] overflow-y-auto">
            {error.message}
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => reset()}
            className="w-full py-3 bg-gradient-to-r from-[#F47B3E] to-[#E8590C] hover:from-[#E06B30] hover:to-[#D4540A] text-white font-extrabold text-[12px] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-[#F47B3E]/10 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <RefreshCcw className="w-4 h-4" />
            Reload Section
          </button>
        </div>
      </div>
    </div>
  )
}
