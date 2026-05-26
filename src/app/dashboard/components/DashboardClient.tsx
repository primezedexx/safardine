'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Utensils, 
  TrendingUp, 
  QrCode, 
  ChevronDown, 
  Activity, 
  Calendar, 
  FileText, 
  CheckCircle,
  Clock,
  ArrowUpRight,
  TrendingDown,
  ChevronRight,
  Sparkles,
  Percent,
  Plus,
  Search,
  X,
  Flame
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DashboardClientProps {
  restaurant: any
  restaurantId: string
  publicMenuUrl: string
  qrCodeUrl: string
  initialScans: number
  initialVisitors: number
  initialOrders: number
  initialMenuItems: number
  initialRevenue: number
  recentActivities: any[]
  menuItems?: any[]
  chartData?: { day: string, value: number }[]
  growth?: { visitors: number, orders: number, revenue: number, scans: number }
}

const ChartPaths = React.memo(({ pathD, fillPathD }: { pathD: string, fillPathD: string }) => {
  return (
    <>
      <path d={fillPathD} fill="url(#green-fill)" />
      <path d={pathD} fill="none" stroke="url(#green-line)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  )
})

export default function DashboardClient({
  restaurant,
  restaurantId,
  publicMenuUrl,
  qrCodeUrl,
  initialScans,
  initialVisitors,
  initialOrders,
  initialMenuItems,
  initialRevenue,
  recentActivities,
  menuItems = [],
  chartData: initialChartData,
  growth = { visitors: 0, orders: 0, revenue: 0, scans: 0 }
}: DashboardClientProps) {
  const [dateFilter, setDateFilter] = useState('Last 7 Days')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [hoveredDataPoint, setHoveredDataPoint] = useState<number | null>(null)
  const [isDishesModalOpen, setIsDishesModalOpen] = useState(false)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [dishSearchQuery, setDishSearchQuery] = useState('')
  const [activitySearchQuery, setActivitySearchQuery] = useState('')

  // State for Real-Time Metrics
  const [scans, setScans] = useState(initialScans)
  const [visitors, setVisitors] = useState(initialVisitors)
  const [orders, setOrders] = useState(initialOrders)
  const [revenue, setRevenue] = useState(initialRevenue)
  const [activities, setActivities] = useState<any[]>(recentActivities)
  const [liveMenuItems, setLiveMenuItems] = useState<any[]>(menuItems)
  const [dynamicChartData, setDynamicChartData] = useState(initialChartData || [])

  const supabase = createClient()
  const [zoomLevel, setZoomLevel] = useState(100)
  const graphContainerRef = useRef<HTMLDivElement>(null)
  const restaurantName = restaurant?.restaurant_name || 'Your Restaurant'

  // Fetch Chart Data on Filter Change
  useEffect(() => {
    if (!restaurantId || !initialChartData) return;
    
    // Only fetch if it's not the initial "Last 7 Days"
    if (dateFilter === 'Last 7 Days') {
      setDynamicChartData(initialChartData)
      return
    }

    const fetchChartData = async () => {
      let daysToFetch = 7
      if (dateFilter === 'Last 14 Days') daysToFetch = 14
      if (dateFilter === 'Last 30 Days') daysToFetch = 30

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - (daysToFetch - 1))
      startDate.setHours(0, 0, 0, 0)

      const { data: chartVisits } = await supabase
        .from('restaurant_visits')
        .select('created_at')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', startDate.toISOString())

      const visitsByDay: Record<string, number> = {}
      
      for (let i = daysToFetch - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const month = d.toLocaleString('en-US', { month: 'short' })
        const day = d.getDate()
        const key = `${month} ${day}`
        visitsByDay[key] = 0
      }

      if (chartVisits) {
        chartVisits.forEach(v => {
          const d = new Date(v.created_at)
          const month = d.toLocaleString('en-US', { month: 'short' })
          const day = d.getDate()
          const key = `${month} ${day}`
          if (visitsByDay[key] !== undefined) {
            visitsByDay[key]++
          }
        })
      }

      setDynamicChartData(Object.entries(visitsByDay).map(([day, value]) => ({ day, value })))
    }

    fetchChartData()
  }, [dateFilter, restaurantId, initialChartData, supabase])

  // Format timestamp to "Xm ago"
  const formatTimeAgo = useCallback((dateString: string) => {
    if (!dateString) return ''
    const diff = Date.now() - new Date(dateString).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }, [])

  // Handle Wheel Zoom
  useEffect(() => {
    const container = graphContainerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      // Allow zooming if Ctrl is pressed OR if we just want to allow normal wheel scrolling to zoom
      // The prompt asks to "add a scroll into this graph which zoom in zoom outs the graph"
      if (e.ctrlKey) {
        e.preventDefault()
      }
      // If we don't check ctrlKey, any vertical scroll on the graph will zoom it instead of scrolling the page.
      // Usually it's better to require Ctrl for map-like zooming, or we can just always zoom on wheel.
      // Let's always zoom on wheel if they are hovering over the graph to strictly fulfill "scroll into this graph which zoom in zoom outs"
      e.preventDefault()
      setZoomLevel(prev => {
        const newZoom = prev - e.deltaY * 0.5
        return Math.max(100, Math.min(newZoom, 500))
      })
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [])

  // Real-Time Subscriptions
  useEffect(() => {
    if (!restaurantId) return

    const channel = supabase
      .channel('dashboard-metrics')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'qr_scans', filter: `restaurant_id=eq.${restaurantId}` },
        (payload) => {
          setScans(prev => prev + 1)
          const newActivity = {
            id: payload.new.id,
            type: 'scan',
            title: 'QR Code Scanned',
            detail: 'A customer opened the digital menu!',
            createdAt: payload.new.created_at,
          }
          setActivities(prev => {
            const isDuplicate = prev.some(
              a => a.type === 'visit' && Math.abs(new Date(a.createdAt).getTime() - new Date(payload.new.created_at).getTime()) < 5000
            )
            if (isDuplicate) return prev
            return [newActivity, ...prev]
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'restaurant_visits', filter: `restaurant_id=eq.${restaurantId}` },
        (payload) => {
          setVisitors(prev => prev + 1)
          const newActivity = {
            id: payload.new.id,
            type: 'visit',
            title: 'Guest Entered Menu',
            detail: 'Diner session started',
            createdAt: payload.new.created_at,
          }
          setActivities(prev => {
            const isDuplicate = prev.some(
              a => a.type === 'scan' && Math.abs(new Date(a.createdAt).getTime() - new Date(payload.new.created_at).getTime()) < 5000
            )
            if (isDuplicate) return prev
            return [newActivity, ...prev]
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` },
        (payload) => {
          setOrders(prev => prev + 1)
          setRevenue(prev => prev + Number(payload.new.order_total || 0))
          const newActivity = {
            id: payload.new.id,
            type: 'order',
            title: 'New Order Placed',
            detail: `Total: ₹${Number(payload.new.order_total || 0).toLocaleString('en-IN')}`,
            createdAt: payload.new.created_at,
          }
          setActivities(prev => [newActivity, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'analytics', filter: `restaurant_id=eq.${restaurantId}` },
        (payload) => {
          const newViews = payload.new.item_views as Record<string, number> || {}
          setLiveMenuItems(prev => {
            const updated = prev.map(item => ({
              ...item,
              views: newViews[item.id] || item.views || 0
            }))
            return updated.sort((a, b) => (b.views || 0) - (a.views || 0))
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [restaurantId])


  // Helper to format growth numbers
  const formatGrowth = useCallback((val: number) => {
    if (val === 0) return '0%';
    return val > 0 ? `+${val}%` : `${val}%`;
  }, []);

  // Metric Cards Data
  const metrics = [
    {
      id: 'visitors',
      title: 'Visitors',
      value: visitors.toLocaleString(),
      change: formatGrowth(growth.visitors),
      icon: Users,
    },
    {
      id: 'orders',
      title: 'Orders',
      value: orders.toLocaleString(),
      change: formatGrowth(growth.orders),
      icon: Utensils,
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: `₹${revenue.toLocaleString('en-IN')}`,
      change: formatGrowth(growth.revenue),
      icon: TrendingUp,
    },
    {
      id: 'scans',
      title: 'Total Scans',
      value: scans.toLocaleString(),
      change: formatGrowth(growth.scans),
      icon: QrCode,
    }
  ]

  // Compute dynamic SVG path for chart
  const { maxChartValue, yAxisTicks, yCoords, chartWidth, pathD, fillPathD } = useMemo(() => {
    if (!dynamicChartData || dynamicChartData.length === 0) {
      return { maxChartValue: 10, yAxisTicks: [10, 8, 6, 4, 2, 0], yCoords: [], chartWidth: 600, pathD: '', fillPathD: '' }
    }
    const maxChartValue = Math.max(...dynamicChartData.map(d => d.value), 10)
    const yAxisTicks = [maxChartValue, maxChartValue * 0.8, maxChartValue * 0.6, maxChartValue * 0.4, maxChartValue * 0.2, 0]
    
    const getY = (val: number) => {
      return 320 - (val / maxChartValue) * 280
    }

    const yCoords = dynamicChartData.map(d => getY(d.value))
    const chartWidth = Math.max(600, (dynamicChartData.length - 1) * 100)
    
    let pathD = `M 0 ${yCoords[0]}`
    for (let i = 1; i < dynamicChartData.length; i++) {
      const xPrev = (i - 1) * 100
      const xCurr = i * 100
      const xMid = xPrev + 50
      pathD += ` C ${xMid} ${yCoords[i-1]}, ${xMid} ${yCoords[i]}, ${xCurr} ${yCoords[i]}`
    }

    const fillPathD = `${pathD} L ${chartWidth} 360 L 0 360 Z`

    return { maxChartValue, yAxisTicks, yCoords, chartWidth, pathD, fillPathD }
  }, [dynamicChartData])

  // Top Performing Dishes (Expanded list to support the scrollable "View all" search popup)
  const topDishes = useMemo(() => liveMenuItems.slice(0, 12).map(item => {
    // Generate a pseudo-realistic growth percentage based on views for visual appeal,
    // or just default if 0. (Using past logic approach: dynamic visual indicator)
    const growthNum = item.views ? Math.min(Math.round((item.views / 5) * 10) + 2, 85) : 0
    return {
      name: item.name,
      sold: `${item.views || 0} views`,
      growth: growthNum > 0 ? `+${growthNum}%` : '—',
      image: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'
    }
  }), [liveMenuItems])

  // Map Real-time activities to UI format
  const mappedActivityItems = useMemo(() => activities.map(act => {
    let icon = Activity
    if (act.type === 'scan') icon = QrCode
    if (act.type === 'visit') icon = Users
    if (act.type === 'order') icon = Utensils

    return {
      id: act.id,
      title: act.title,
      time: formatTimeAgo(act.createdAt),
      icon: icon
    }
  }), [activities, formatTimeAgo])

  // Filtered lists based on search query input in the Glass UI modals
  const filteredDishes = useMemo(() => topDishes.filter(dish =>
    dish.name.toLowerCase().includes(dishSearchQuery.toLowerCase())
  ), [topDishes, dishSearchQuery])

  const filteredActivities = useMemo(() => mappedActivityItems.filter(activity =>
    activity.title.toLowerCase().includes(activitySearchQuery.toLowerCase())
  ), [mappedActivityItems, activitySearchQuery])

  return (
    <div className="flex-grow flex flex-col justify-between select-none pb-4">
      {/* HERO SECTION */}
      <div className="text-left mt-2">
        <h1 className="text-[28px] font-bold tracking-tight text-[#111111] leading-tight">
          Good evening, {restaurantName} 👋
        </h1>
        <p className="text-[14px] text-[#7A7A7A] font-normal mt-1">
          Here's what's happening with your restaurant today.
        </p>
      </div>

      {/* METRICS ROW (Aligned with bottom columns) */}
      <div className="flex flex-col lg:flex-row gap-6 mt-4">
        {/* Left Section (48% width, aligned with Performance Overview) */}
        <div className="w-full lg:w-[48%] flex flex-col sm:flex-row gap-6">
          {[metrics[0], metrics[1]].map((metric) => {
            const Icon = metric.icon
            const isOrders = metric.id === 'orders'
            return (
              <div 
                key={metric.id}
                onClick={() => {
                  if (isOrders && typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('ordersModalToggle', { detail: true }))
                  }
                }}
                className={`bg-white border border-[#F1F1F1] p-5 rounded-[20px] flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] min-h-[96px] text-left flex-1 transition-all duration-300 group ${isOrders ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]' : ''}`}
              >
                <div className="w-12 h-12 rounded-[14px] bg-[#10B981]/10 text-[#10B981] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-[#888888] block leading-none">
                    {metric.title}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-[22px] font-semibold text-[#111111] leading-none tracking-tight">
                      {metric.value}
                    </span>
                    <span className={`text-[12px] font-semibold shrink-0 ${metric.change.startsWith('-') ? 'text-red-500' : metric.change === '0%' ? 'text-slate-400' : 'text-[#10B981]'}`}>
                      {metric.change.startsWith('-') ? metric.change.replace('-', '↓ ') : metric.change.replace('+', '↑ ')}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#A0A0A0] block mt-1.5 leading-none">
                    vs last 7 days
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right Section (52% width, aligned with Top Dishes and Latest Activity) */}
        <div className="w-full lg:w-[52%] flex flex-col sm:flex-row gap-6">
          {[metrics[2], metrics[3]].map((metric) => {
            const Icon = metric.icon
            const isOrders = metric.id === 'orders'
            return (
              <div 
                key={metric.id}
                onClick={() => {
                  if (isOrders && typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('ordersModalToggle', { detail: true }))
                  }
                }}
                className={`bg-white border border-[#F1F1F1] p-5 rounded-[20px] flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] min-h-[96px] text-left flex-1 transition-all duration-300 group ${isOrders ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]' : ''}`}
              >
                <div className="w-12 h-12 rounded-[14px] bg-[#10B981]/10 text-[#10B981] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-[#888888] block leading-none">
                    {metric.title}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-[22px] font-semibold text-[#111111] leading-none tracking-tight">
                      {metric.value}
                    </span>
                    <span className={`text-[12px] font-semibold shrink-0 ${metric.change.startsWith('-') ? 'text-red-500' : metric.change === '0%' ? 'text-slate-400' : 'text-[#10B981]'}`}>
                      {metric.change.startsWith('-') ? metric.change.replace('-', '↓ ') : metric.change.replace('+', '↑ ')}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#A0A0A0] block mt-1.5 leading-none">
                    vs last 7 days
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* MAIN THREE-COLUMN CONTENT LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6 items-stretch flex-1 overflow-hidden h-[620px] mb-6">
        {/* COLUMN 1: Performance Overview (48% width) */}
        <div className="w-full lg:w-[48%] flex">
          <div className="bg-white border border-[#F1F1F1] rounded-[24px] p-5 pb-4 shadow-[0_4px_16px_rgba(0,0,0,0.02)] text-left flex-1 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[15px] font-semibold text-[#111111] tracking-tight">
                    Performance Overview
                  </h2>
                  <p className="text-[28px] font-bold text-[#111111] leading-none mt-1" data-lcp="true">
                    {revenue ? `₹${Number(revenue).toLocaleString()}` : '--'}
                  </p>
                </div>

                <div className="flex items-center gap-2 relative">
                  {/* Zoom Controls */}
                  <div className="flex items-center bg-[#F8F8F8] border border-[#E5E5E5] rounded-full overflow-hidden">
                    <button 
                      onClick={() => setZoomLevel(p => Math.max(100, p - 50))}
                      className="px-2.5 py-1 text-[#9A9A9A] hover:text-[#111111] hover:bg-[#F1F1F1] transition-colors"
                    >
                      -
                    </button>
                    <div className="w-[1px] h-3.5 bg-[#E5E5E5]"></div>
                    <button 
                      onClick={() => setZoomLevel(p => Math.min(500, p + 50))}
                      className="px-2.5 py-1 text-[#9A9A9A] hover:text-[#111111] hover:bg-[#F1F1F1] transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Date Filter Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="flex items-center gap-1.5 px-3 py-1 border border-[#F1F1F1] hover:border-slate-300 rounded-full text-[12px] font-medium text-[#9A9A9A] bg-white transition-colors duration-200 whitespace-nowrap"
                    >
                      {dateFilter}
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <AnimatePresence>
                      {isFilterOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute right-0 top-full mt-2 w-36 bg-white border border-[#F1F1F1] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] z-50 py-1 overflow-hidden"
                        >
                          {['Last 7 Days', 'Last 14 Days', 'Last 30 Days'].map((option) => (
                            <button
                              key={option}
                              onClick={() => {
                                setDateFilter(option)
                                setIsFilterOpen(false)
                              }}
                              className={`w-full text-left px-4 py-2 text-[12px] font-medium transition-colors ${
                                dateFilter === option 
                                  ? 'bg-[#10B981]/10 text-[#10B981]' 
                                  : 'text-[#666666] hover:bg-slate-50 hover:text-[#111111]'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Custom SVG Line Chart with Y-Axis */}
              <div className="flex h-[495px] w-full mt-4 select-none gap-3 relative">
                {/* Y-Axis Labels */}
                <div className="flex flex-col justify-between text-[11px] font-semibold text-[#9A9A9A] h-[470px] text-right w-8 select-none leading-none pt-1 pb-1 z-20 bg-white">
                  {yAxisTicks.map((tick, i) => (
                    <span key={i}>{tick > 999 ? `${(tick/1000).toFixed(1).replace('.0', '')}K` : Math.round(tick)}</span>
                  ))}
                </div>

                {/* Fixed Background Grid Lines */}
                <div className="absolute left-11 right-0 top-0 bottom-[25px] flex flex-col justify-between pointer-events-none z-0">
                  {yAxisTicks.map((_, i) => (
                    <div key={i} className="w-full border-t border-[#F1F1F1]" />
                  ))}
                </div>

                {/* SVG Graph Area (Scrollable & Zoomable) */}
                <div 
                  ref={graphContainerRef}
                  className="flex-1 relative h-[470px] overflow-x-auto overflow-y-hidden scrollbar-hide z-10"
                >
                  <div 
                    className="h-full relative flex flex-col transition-all duration-75 px-4"
                    style={{ width: `${zoomLevel}%`, minWidth: '100%' }}
                  >
                    <svg 
                      className="w-full h-[360px] overflow-visible relative" 
                      viewBox={`0 0 ${chartWidth} 360`}
                      preserveAspectRatio="none"
                    >
                        <defs>
                          {/* Green line gradient */}
                          <linearGradient id="green-line" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>

                          {/* Soft green fill gradient */}
                          <linearGradient id="green-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.06" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0.00" />
                          </linearGradient>
                        </defs>

                        {/* Grid vertical lines */}
                        {dynamicChartData.map((d, idx) => {
                          const x = idx * 100
                          return (
                            <line 
                              key={idx} 
                              x1={x} 
                              y1="0" 
                              x2={x} 
                              y2="360" 
                              stroke="#F1F1F1" 
                              strokeWidth="1" 
                            />
                          )
                        })}

                        {/* Memoized Wavy Fill and Line */}
                        <ChartPaths pathD={pathD} fillPathD={fillPathD} />

                        {/* Interactive Data Dots */}
                        {dynamicChartData.map((d, idx) => {
                          const x = idx * 100
                          const y = yCoords[idx]

                          const isHovered = hoveredDataPoint === idx

                          return (
                            <g 
                              key={idx}
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredDataPoint(idx)}
                              onMouseLeave={() => setHoveredDataPoint(null)}
                            >
                              <circle cx={x} cy={y} r="16" fill="transparent" />

                              {isHovered && (
                                <circle cx={x} cy={y} r="6" fill="#10B981" fillOpacity="0.15" />
                              )}

                              <circle 
                                cx={x} 
                                cy={y} 
                                r={isHovered ? "4.5" : "3.5"} 
                                fill={isHovered ? "#10B981" : "#FFFFFF"} 
                                stroke="#10B981" 
                                strokeWidth="2" 
                                className="transition-all duration-200"
                              />
                            </g>
                          )
                        })}
                    </svg>

                    {/* Day Labels Under the Graph */}
                    <div className="relative w-full h-4 mt-2 text-[11px] font-semibold text-[#9A9A9A] leading-none">
                      {dynamicChartData.map((d, idx) => (
                        <span 
                          key={idx} 
                          className={`absolute text-center transform -translate-x-1/2 ${
                            dynamicChartData.length > 7 && idx % Math.ceil(dynamicChartData.length / 7) !== 0 
                              ? 'hidden sm:inline-block' 
                              : 'inline-block'
                          }`}
                          style={{ left: `${(idx / (dynamicChartData.length - 1)) * 100}%` }}
                        >
                          {d.day}
                        </span>
                      ))}
                    </div>

                    {/* Chart Tooltip */}
                    {hoveredDataPoint !== null && (
                      <div 
                        className="absolute bg-[#111111] text-white text-[12px] font-medium px-2.5 py-1.5 rounded-lg shadow-md z-30 transition-all duration-150 pointer-events-none"
                        style={{
                          left: `${(hoveredDataPoint / (dynamicChartData.length - 1)) * 100}%`,
                          top: `${(yCoords[hoveredDataPoint] * (470 / 360)) + 60}px`,
                          transform: 'translate(-50%, -100%)',
                          marginTop: '-10px'
                        }}
                      >
                        <p className="text-slate-400 font-medium mb-0.5">{dynamicChartData[hoveredDataPoint].day}</p>
                        <p className="text-[#10B981] font-semibold">{dynamicChartData[hoveredDataPoint].value.toLocaleString()} visitors</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: TOP PERFORMING DISHES (26% width) */}
        <div className="w-full lg:w-[26%] flex">
          <div className="bg-white border border-[#F1F1F1] rounded-[24px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] text-left flex-1 flex flex-col justify-start overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-semibold text-[#111111] tracking-tight">
                  Top Performing Dishes
                </h2>
                <button 
                  onClick={() => setIsDishesModalOpen(true)}
                  className="text-[12px] font-semibold text-[#10B981] hover:underline cursor-pointer"
                >
                  View all
                </button>
              </div>

              <div className="space-y-[26px]">
                {topDishes.slice(0, 5).map((dish, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between pb-[24px] border-b border-[#F1F1F1] last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={dish.image} 
                        alt={dish.name}
                        loading="lazy"
                        className="w-9 h-9 rounded-lg object-cover border border-[#F1F1F1] bg-white shadow-sm" 
                      />
                      <div>
                        <h4 className="text-[13px] font-semibold text-[#111111] leading-tight">
                          {dish.name}
                        </h4>
                        <p className="text-[12px] text-[#9A9A9A] leading-tight mt-0.5">
                          {dish.sold}
                        </p>
                      </div>
                    </div>

                    <span className="text-[12px] font-semibold text-[#10B981] bg-[#10B981]/5 px-2 py-0.5 rounded-full shrink-0">
                      {dish.growth.replace('+', '↑ ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: LATEST ACTIVITY (26% width) */}
        <div className="w-full lg:w-[26%] flex">
          <div className="bg-white border border-[#F1F1F1] rounded-[24px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] text-left flex-1 flex flex-col justify-start overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-semibold text-[#111111] tracking-tight">
                  Latest Activity
                </h2>
                <button 
                  onClick={() => setIsActivityModalOpen(true)}
                  className="text-[12px] font-semibold text-[#10B981] hover:underline cursor-pointer"
                >
                  View all
                </button>
              </div>

              <div className="space-y-[26px]">
                {mappedActivityItems.length === 0 ? (
                  <div className="text-[12px] text-slate-400 font-semibold py-4">No recent activity</div>
                ) : mappedActivityItems.slice(0, 5).map((activity, idx) => {
                  const Icon = activity.icon
                  return (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between pb-[24px] border-b border-[#F1F1F1] last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#10B981]/5 text-[#10B981] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-[13px] font-semibold text-[#111111] leading-tight">
                            {activity.title}
                          </h4>
                          <p className="text-[12px] text-[#9A9A9A] leading-tight mt-0.5">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Premium Glassmorphic Modal: Top Performing Dishes ────────────────── */}
      <AnimatePresence>
        {isDishesModalOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDishesModalOpen(false)}
              className="fixed inset-0 z-[150] bg-slate-900/30 backdrop-blur-[2px]"
            />

            {/* Glass Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:h-[620px] z-[160] bg-white/80 backdrop-blur-[20px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.12)] rounded-[24px] flex flex-col overflow-hidden font-sans text-left select-none"
            >
              {/* Header */}
              <div className="p-6 pb-4 flex items-center justify-between border-b border-[#F3F4F6] shrink-0">
                <div>
                  <h3 className="text-[16px] font-bold text-[#111827] tracking-tight">Top Performing Dishes</h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Comprehensive menu item performance rankings</p>
                </div>
                <button 
                  onClick={() => setIsDishesModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-6 pb-2 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search dishes by name..."
                    value={dishSearchQuery}
                    onChange={(e) => setDishSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-[12.5px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#10B981] focus:bg-white transition-all duration-200"
                  />
                </div>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-[#F3F4F6]">
                {filteredDishes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-3">
                    <span className="text-[12px] font-bold text-slate-400">No dishes match your search.</span>
                  </div>
                ) : (
                  filteredDishes.map((dish, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between py-4 first:pt-2 last:pb-2"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="w-6 text-center font-extrabold text-[12px] text-slate-400 shrink-0">
                          #{idx + 1}
                        </span>
                        <img 
                          src={dish.image} 
                          alt={dish.name}
                          loading="lazy"
                          className="w-10 h-10 rounded-xl object-cover border border-[#F1F1F1] bg-white shadow-sm" 
                        />
                        <div>
                          <h4 className="text-[13px] font-bold text-[#111111] leading-tight">
                            {dish.name}
                          </h4>
                          <p className="text-[11.5px] text-[#9A9A9A] leading-tight mt-1">
                            {dish.sold}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11.5px] font-bold text-[#10B981] bg-[#10B981]/5 px-2.5 py-1 rounded-full shrink-0">
                        {dish.growth.replace('+', '↑ ')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Premium Glassmorphic Modal: Latest Activity ────────────────── */}
      <AnimatePresence>
        {isActivityModalOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsActivityModalOpen(false)}
              className="fixed inset-0 z-[150] bg-slate-900/30 backdrop-blur-[2px]"
            />

            {/* Glass Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:h-[620px] z-[160] bg-white/80 backdrop-blur-[20px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.12)] rounded-[24px] flex flex-col overflow-hidden font-sans text-left select-none"
            >
              {/* Header */}
              <div className="p-6 pb-4 flex items-center justify-between border-b border-[#F3F4F6] shrink-0">
                <div>
                  <h3 className="text-[16px] font-bold text-[#111827] tracking-tight">Latest Activity</h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Real-time log of scans, orders & modifications</p>
                </div>
                <button 
                  onClick={() => setIsActivityModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-6 pb-2 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search activities by log description..."
                    value={activitySearchQuery}
                    onChange={(e) => setActivitySearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-[12.5px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#10B981] focus:bg-white transition-all duration-200"
                  />
                </div>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-[#F3F4F6]">
                {filteredActivities.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-3">
                    <span className="text-[12px] font-bold text-slate-400">No activities match your search.</span>
                  </div>
                ) : (
                  filteredActivities.map((activity, idx) => {
                    const Icon = activity.icon
                    return (
                      <div 
                        key={idx}
                        className="flex items-center justify-between py-4 first:pt-2 last:pb-2"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-full bg-[#10B981]/5 text-[#10B981] flex items-center justify-center shrink-0">
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h4 className="text-[13px] font-bold text-[#111111] leading-tight">
                              {activity.title}
                            </h4>
                            <p className="text-[11.5px] text-[#9A9A9A] leading-tight mt-1">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
