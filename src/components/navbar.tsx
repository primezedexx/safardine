import Link from "next/link";
import { QrCode, ArrowUpRight } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] sm:w-[90%] max-w-5xl z-50 rounded-2xl bg-white/75 backdrop-blur-xl border border-slate-200/80 px-4 md:px-6 py-3 flex items-center justify-between shadow-lg shadow-slate-100/40">
      
      {/* Brand logo */}
      <Link href="/" className="flex items-center justify-center group h-12 w-[160px] relative">
        <img 
          src="/logo-transparent.png" 
          alt="Safar Dine Logo" 
          className="w-full h-full object-contain scale-[2.8] origin-center select-none pointer-events-none group-hover:scale-[2.85] transition-transform duration-200" 
        />
      </Link>

      {/* Nav Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/login" className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-orange-500 transition-colors">
          Log in
        </Link>
        <Link 
          href="/signup" 
          className="flex items-center gap-1 px-3.5 py-1.5 sm:px-4.5 sm:py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-extrabold text-[11px] sm:text-xs rounded-xl transition-all duration-200 shadow-md shadow-orange-500/10 active:scale-95"
        >
          Get started <ArrowUpRight className="w-3.5 h-3.5 text-white stroke-[2.5]" />
        </Link>
      </div>

    </nav>
  );
}
