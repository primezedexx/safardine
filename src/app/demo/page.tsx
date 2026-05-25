import DashboardLayoutClient from "../dashboard/components/DashboardLayoutClient"
import Link from "next/link"
import { SubscriptionProvider } from "../dashboard/context/SubscriptionContext"
import { mockMenuData } from "./mockMenuData"

export const dynamic = 'force-dynamic';

export default function DemoDashboardPage() {
  const mockRestaurant = {
    id: "demo_id_skip_db", // Give it a dummy ID if needed, but keeping it undefined or a string that won't trigger real DB queries is better. Let's not provide an ID so supabase queries abort early.
    restaurant_name: "Safar Dine Cafe",
    restaurant_description: "A gorgeous modern fusion restaurant located in Maharashtra, Mumbai, powered by Safar Dine.",
    setup_completed: true,
    restaurant_logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&h=150&q=80",
    restaurant_category: "Modern Indian Fusion",
    restaurant_cover: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&h=300&q=80",
    currency: 'USD'
  }

  const mockRecentActivities = [
    { 
      id: "init1", 
      type: "visit", 
      title: "Guest Session Active", 
      detail: "Guest selected English language", 
      time: "2 mins ago", 
      color: "bg-blue-50 text-blue-700 border-blue-100" 
    },
    { 
      id: "init2", 
      type: "scan", 
      title: "QR Code Scanned", 
      detail: "QR scanned at Table 4", 
      time: "5 mins ago", 
      color: "bg-orange-50 text-orange-700 border-orange-100" 
    },
    { 
      id: "init3", 
      type: "order", 
      title: "New Order Placed", 
      detail: "Truffle Wagyu Burger ordered! ($24.99)", 
      time: "12 mins ago", 
      color: "bg-emerald-50 text-emerald-700 border-emerald-100" 
    }
  ]

  const publicMenuUrl = "/demo/menu"
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent("https://menuai-ten.vercel.app/demo/menu")}`

  const dashboardData = {
    restaurant: mockRestaurant,
    restaurantId: "demo",
    publicMenuUrl,
    qrCodeUrl,
    initialScans: 342,
    initialVisitors: 189,
    initialOrders: 96,
    initialMenuItems: 50,
    initialRevenue: 1824.50,
    recentActivities: mockRecentActivities,
    menuItems: mockMenuData,
    chartData: [
      { day: "May 10", value: 120 },
      { day: "May 11", value: 145 },
      { day: "May 12", value: 130 },
      { day: "May 13", value: 180 },
      { day: "May 14", value: 190 },
      { day: "May 15", value: 240 },
      { day: "May 16", value: 210 }
    ],
    reviewCount: 45,
    avgRating: 4.8,
    growth: {
      visitors: 18.6,
      orders: 16.3,
      revenue: 21.8,
      scans: 14.2
    }
  }

  const menuData = {
    items: mockMenuData,
    currencySymbol: '₹',
    restaurantId: "demo"
  }

  const analyticsData = {
    scansCount: 342, visitsCount: 189, ordersCount: 96, revenue: 1824.50,
    ordersTimestamps: [], scansTimestamps: [], ordersRaw: [],
    averageOrderValue: 19,
    conversionRate: 28,
    revPerScan: 5,
    growth30: {
      visitors: 45,
      orders: 40,
      revenue: 55,
      scans: 35
    }
  }

  const trialBanner = (
    <div className="bg-slate-900 text-white text-xs font-semibold py-2.5 px-4 flex items-center justify-between sticky top-0 z-[100] shadow-md w-full">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
        <span className="hidden sm:inline"><strong>Sandbox Demo Mode:</strong> You are exploring a simulated live account with fake restaurant transactions.</span>
        <span className="sm:hidden"><strong>Demo Mode</strong></span>
      </div>
      <div className="flex gap-3 sm:gap-4 items-center">
        <Link href="/signup" className="text-amber-400 hover:text-amber-300 font-extrabold underline transition-colors whitespace-nowrap">
          Claim Account
        </Link>
        <Link href="/" className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1 rounded-lg transition-colors border border-white/10 text-center">
          Exit
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <SubscriptionProvider 
        initialPlan="business_pro"
        hasWebsiteAddon={true}
        restaurantId="demo"
      >
        <DashboardLayoutClient
          restaurant={mockRestaurant}
          userEmail="demo@example.com"
          trialBanner={trialBanner}
          dashboardData={dashboardData}
          menuData={menuData}
          analyticsData={analyticsData}
        >
          <div className="p-8 text-center text-slate-500">
            This feature is disabled in Demo Mode.
          </div>
        </DashboardLayoutClient>
      </SubscriptionProvider>
    </div>
  )
}
