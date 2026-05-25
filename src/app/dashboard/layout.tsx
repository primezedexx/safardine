import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import SubscriptionGate from './components/SubscriptionGate'
import DashboardLayoutClient from './components/DashboardLayoutClient'
import { SubscriptionProvider } from './context/SubscriptionContext'
import { PlanType } from '@/lib/features'

import { unstable_cache } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const getCachedRestaurant = unstable_cache(
    async (userId: string) => {
      const { data } = await supabase
        .from('restaurant_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      return data
    },
    [`restaurant-profile-${user.id}`],
    { revalidate: 30, tags: [`restaurant-${user.id}`] }
  )

  const restaurant = await getCachedRestaurant(user.id)

  const cookieStore = await cookies()
  const fallbackSubscribed = restaurant?.id 
    ? cookieStore.get(`safardine_subscribed_${restaurant.id}`)?.value === 'true'
    : false

  const isSubscribed = restaurant?.subscription_active === true || fallbackSubscribed

  let isTrialActive = false
  if (restaurant && restaurant.created_at) {
    const createdDate = new Date(restaurant.created_at)
    const currentDate = new Date()
    const diffDays = (currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays <= 7.0) {
      isTrialActive = true
    }
  }

  if (restaurant && restaurant.setup_completed && !isSubscribed && !isTrialActive) {
    return (
      <SubscriptionGate 
        restaurantId={restaurant.id} 
        userEmail={user.email || ''} 
        restaurantName={restaurant.restaurant_name || 'Safar Dine'}
        trialExpired={true}
      />
    )
  }

  const trialBanner = null

  if (!restaurant) {
    return (
      <DashboardLayoutClient restaurant={null} userEmail={user.email || ''} trialBanner={trialBanner}>
        {children}
      </DashboardLayoutClient>
    )
  }

  const restaurantId = restaurant.id

  // FETCH ALL DATA FOR SPA IN PARALLEL WITH INDIVIDUAL CACHES
  const getMenuData = unstable_cache(
    async (restId: string) => await supabase.from('menu_items').select('*').eq('restaurant_id', restId).order('created_at', { ascending: false }),
    [`spa-menu-${restaurantId}`], { revalidate: 30 }
  )
  const getAnalyticsData = unstable_cache(
    async (restId: string) => await supabase.from('analytics').select('item_views').eq('restaurant_id', restId).maybeSingle(),
    [`spa-analytics-${restaurantId}`], { revalidate: 30 }
  )
  const getScansData = unstable_cache(
    async (restId: string) => await supabase.from('qr_scans').select('id, created_at', { count: 'exact' }).eq('restaurant_id', restId),
    [`spa-scans-${restaurantId}`], { revalidate: 30 }
  )
  const getVisitsData = unstable_cache(
    async (restId: string) => await supabase.from('restaurant_visits').select('id, visitor_id, created_at', { count: 'exact' }).eq('restaurant_id', restId),
    [`spa-visits-${restaurantId}`], { revalidate: 30 }
  )
  const getOrdersData = unstable_cache(
    async (restId: string) => await supabase.from('orders').select('id, order_total, created_at').eq('restaurant_id', restId),
    [`spa-orders-${restaurantId}`], { revalidate: 30 }
  )
  const getReviewsData = unstable_cache(
    async (restId: string) => await supabase.from('reviews').select('rating').eq('restaurant_id', restId),
    [`spa-reviews-${restaurantId}`], { revalidate: 30 }
  )

  const [
    { data: menuItems },
    { data: analytics },
    { data: scansData, count: scansCount },
    { data: visitsData, count: visitsCount },
    { data: orders },
    { data: reviews }
  ] = await Promise.all([
    getMenuData(restaurantId),
    getAnalyticsData(restaurantId),
    getScansData(restaurantId),
    getVisitsData(restaurantId),
    getOrdersData(restaurantId),
    getReviewsData(restaurantId)
  ])
  
  const viewsMap = (analytics?.item_views as Record<string, number>) || {}
  const menuItemsWithViews = (menuItems || []).map(item => ({ ...item, views: viewsMap[item.id] || 0 }))
  const sortedMenuItems = [...menuItemsWithViews].sort((a, b) => (b.views || 0) - (a.views || 0))

  const ordersCount = orders?.length || 0
  const revenue = orders?.reduce((acc, curr) => acc + Number(curr.order_total), 0) || 0
  const reviewCount = reviews?.length || 0
  const avgRating = reviewCount > 0 ? Math.round((reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10 : 0

  const recentVisits = [...(visitsData || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)
  const recentOrders = [...(orders || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)
  const recentScans = [...(scansData || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)

  const activities: any[] = []
  recentVisits.forEach(v => activities.push({ id: v.id, type: 'visit', title: 'Guest Entered Menu', detail: `Diner session`, createdAt: v.created_at, color: 'bg-blue-50 text-blue-700 border-blue-100' }))
  recentOrders.forEach(o => activities.push({ id: o.id, type: 'order', title: 'New Order Placed', detail: `Total: $${Number(o.order_total).toFixed(2)}`, createdAt: o.created_at, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' }))
  recentScans.forEach(s => activities.push({ id: s.id, type: 'scan', title: 'QR Code Scanned', detail: 'A customer opened the digital menu!', createdAt: s.created_at, color: 'bg-orange-50 text-orange-700 border-orange-100' }))

  activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  const dedupedActivities: any[] = []
  activities.forEach(act => {
    if (act.type === 'scan' && dedupedActivities.some(d => d.type === 'visit' && Math.abs(new Date(d.createdAt).getTime() - new Date(act.createdAt).getTime()) < 5000)) return
    if (act.type === 'visit' && dedupedActivities.some(d => d.type === 'scan' && Math.abs(new Date(d.createdAt).getTime() - new Date(act.createdAt).getTime()) < 5000)) return
    dedupedActivities.push(act)
  })
  const recentActivities = dedupedActivities.slice(0, 5)

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const chartVisits = visitsData?.filter(v => new Date(v.created_at) >= sevenDaysAgo) || []
  const visitsByDay: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    visitsByDay[`${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`] = 0
  }
  chartVisits.forEach(v => {
    const d = new Date(v.created_at)
    const key = `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`
    if (visitsByDay[key] !== undefined) visitsByDay[key]++
  })
  const chartData = Object.entries(visitsByDay).map(([day, value]) => ({ day, value }))

  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('192.168.') ? 'http' : 'https'
  const menuIdentifier = restaurant.restaurant_slug || restaurantId
  const publicMenuUrl = `${protocol}://${host}/menu/${menuIdentifier}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicMenuUrl)}`

  const ordersTimestamps = orders?.map(o => o.created_at) || []
  const scansTimestamps = scansData?.map(s => s.created_at) || []
  const ordersRaw = orders?.map(o => ({ created_at: o.created_at, total: Number(o.order_total) || 0 })) || []
  const validScansCount = scansCount || 0

  const calculateGrowth = (data: any[], days: number, dateField = 'created_at', valueField?: string) => {
    if (!data || data.length === 0) return 0;
    const now = new Date();
    const periodAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const doublePeriodAgo = new Date(now.getTime() - (days * 2) * 24 * 60 * 60 * 1000);

    let currentPeriod = 0;
    let prevPeriod = 0;

    data.forEach(item => {
      const d = new Date(item[dateField]);
      const val = valueField ? Number(item[valueField]) || 0 : 1;
      if (d >= periodAgo) currentPeriod += val;
      else if (d >= doublePeriodAgo && d < periodAgo) prevPeriod += val;
    });

    if (prevPeriod === 0) return currentPeriod > 0 ? 100 : 0;
    return Math.round(((currentPeriod - prevPeriod) / prevPeriod) * 100 * 10) / 10;
  };

  const dashboardData = {
    restaurant, restaurantId, publicMenuUrl, qrCodeUrl,
    initialScans: validScansCount, initialVisitors: visitsCount || 0,
    initialOrders: ordersCount, initialMenuItems: (menuItems || []).length,
    initialRevenue: revenue, recentActivities, menuItems: sortedMenuItems, chartData,
    reviewCount, avgRating,
    growth: {
      visitors: calculateGrowth(visitsData || [], 7),
      orders: calculateGrowth(orders || [], 7),
      revenue: calculateGrowth(orders || [], 7, 'created_at', 'order_total'),
      scans: calculateGrowth(scansData || [], 7)
    }
  }

  const analyticsData = {
    scansCount: validScansCount, visitsCount: visitsCount || 0, ordersCount, revenue,
    ordersTimestamps, scansTimestamps, ordersRaw,
    averageOrderValue: ordersCount > 0 ? Math.round(revenue / ordersCount) : 0,
    conversionRate: validScansCount > 0 ? Math.round((ordersCount / validScansCount) * 100) : 0,
    revPerScan: validScansCount > 0 ? Math.round(revenue / validScansCount) : 0,
    growth30: {
      visitors: calculateGrowth(visitsData || [], 30),
      orders: calculateGrowth(orders || [], 30),
      revenue: calculateGrowth(orders || [], 30, 'created_at', 'order_total'),
      scans: calculateGrowth(scansData || [], 30)
    }
  }

  const menuData = {
    items: menuItems || [],
    currencySymbol: restaurant.currency === 'INR' ? '₹' : restaurant.currency === 'EUR' ? '€' : restaurant.currency === 'GBP' ? '£' : '$',
    restaurantId
  }

  return (
    <SubscriptionProvider 
      initialPlan={(restaurant.subscription_plan as PlanType) || 'basic'}
      hasWebsiteAddon={restaurant.has_website_addon || false}
      restaurantId={restaurantId}
    >
      <DashboardLayoutClient
        restaurant={restaurant}
        userEmail={user.email || ''}
        trialBanner={trialBanner}
        dashboardData={dashboardData}
        menuData={menuData}
        analyticsData={analyticsData}
      >
        {children}
      </DashboardLayoutClient>
    </SubscriptionProvider>
  )
}
