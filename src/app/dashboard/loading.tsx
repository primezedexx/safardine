export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-[#10B981] border-t-transparent animate-spin"></div>
        <p className="text-sm font-semibold text-slate-400">Loading Safardine...</p>
      </div>
    </div>
  )
}
