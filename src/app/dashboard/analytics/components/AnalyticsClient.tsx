'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IndianRupee,
  Users,
  ShoppingBag,
  QrCode,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Clock,
  Smartphone,
  Tag,
  UserPlus,
  Lock,
  Utensils,
} from 'lucide-react'
import { useSubscription } from '../../context/SubscriptionContext'

// ─── LazyRender ──────────────────────────────────────────────────────
function LazyRender({ children, height = 300 }: { children: React.ReactNode, height?: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="h-full" style={{ minHeight: isVisible ? 'auto' : height }}>
      {isVisible ? children : null}
    </div>
  )
}

// ─── Types ───────────────────────────────────────────────────────────
interface AnalyticsData {
  scansCount: number
  visitsCount: number
  ordersCount: number
  revenue: number
  ordersTimestamps: string[]
  scansTimestamps: string[]
  ordersRaw: { created_at: string, total: number }[]
  averageOrderValue: number
  conversionRate: number
  revPerScan: number
  growth30?: { visitors: number, orders: number, revenue: number, scans: number }
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  change: string
  onClick?: () => void
  className?: string
}

// ─── StatCard ────────────────────────────────────────────────────────
const StatCard = React.memo(function StatCard({ icon, label, value, change, onClick, className = '' }: StatCardProps) {
  const isNegative = change.startsWith('-');
  const isZero = change === '0%';
  const textColor = isNegative ? 'text-red-500' : isZero ? 'text-gray-400' : 'text-emerald-500';
  const displayChange = isNegative ? change.replace('-', '') : change.replace('+', '');

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
    >
      <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-800">{value}</span>
          <span className={`flex items-center text-xs font-medium ${textColor}`}>
            {!isZero && (isNegative ? <ArrowDown className="w-3 h-3 mr-0.5" /> : <ArrowUp className="w-3 h-3 mr-0.5" />)}
            {displayChange}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">vs last 30 days</p>
      </div>
    </div>
  )
})

// ─── RevenueChart ────────────────────────────────────────────────────
const RevenueChart = React.memo(function RevenueChart({ scansTimestamps, ordersRaw }: { scansTimestamps: string[], ordersRaw: { created_at: string, total: number }[] }) {
  const [filter, setFilter] = useState<7 | 14 | 30>(30)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const chartData = useMemo(() => {
    if (!mounted) {
      return []
    }

    const data: { date: string, timestamp: number, revenue: number, visitors: number }[] = []
    const now = new Date()
    for (let i = filter - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      
      const month = d.toLocaleString('en-US', { month: 'short' })
      const day = d.getDate().toString().padStart(2, '0')
      
      data.push({
        date: `${month} ${day}`,
        timestamp: d.getTime(),
        revenue: 0,
        visitors: 0
      })
    }

    scansTimestamps.forEach(ts => {
      const d = new Date(ts)
      d.setHours(0, 0, 0, 0)
      const t = d.getTime()
      const bin = data.find(b => b.timestamp === t)
      if (bin) bin.visitors++
    })

    ordersRaw.forEach(o => {
      const d = new Date(o.created_at)
      d.setHours(0, 0, 0, 0)
      const t = d.getTime()
      const bin = data.find(b => b.timestamp === t)
      if (bin) bin.revenue += o.total
    })

    return data
  }, [mounted, filter, scansTimestamps, ordersRaw])

  const chartParams = useMemo(() => {
    if (chartData.length === 0) {
      return {
        maxRevenue: 10, maxVisitors: 10, chartHeight: 280, chartWidth: 1200,
        paddingLeft: 60, paddingRight: 40, paddingTop: 20, paddingBottom: 30,
        xScale: () => 0, yScaleRevenue: () => 0, yScaleVisitors: () => 0,
        revenuePath: '', visitorsPath: '', revenueAreaPath: '', xLabels: []
      }
    }
    const maxRevenueVal = Math.max(...chartData.map(d => d.revenue), 10)
    const maxVisitorsVal = Math.max(...chartData.map(d => d.visitors), 5)
    
    const maxRevenue = maxRevenueVal * 1.2
    const maxVisitors = maxVisitorsVal * 1.2

    const chartHeight = 280
    const chartWidth = 1200
    const paddingLeft = 60
    const paddingRight = 40
    const paddingTop = 20
    const paddingBottom = 30

    const xScale = (index: number) =>
      paddingLeft + (index / Math.max(chartData.length - 1, 1)) * (chartWidth - paddingLeft - paddingRight)
    
    const yScaleRevenue = (value: number) =>
      paddingTop + chartHeight - paddingBottom - (value / maxRevenue) * (chartHeight - paddingTop - paddingBottom)
    
    const yScaleVisitors = (value: number) =>
      paddingTop + chartHeight - paddingBottom - (value / maxVisitors) * (chartHeight - paddingTop - paddingBottom)

    const revenuePath = chartData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScaleRevenue(d.revenue)}`)
      .join(' ')

    const visitorsPath = chartData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScaleVisitors(d.visitors)}`)
      .join(' ')

    const revenueAreaPath =
      revenuePath +
      ` L ${xScale(chartData.length - 1)} ${chartHeight - paddingBottom} L ${paddingLeft} ${chartHeight - paddingBottom} Z`

    const step = Math.max(Math.floor(chartData.length / 8), 1)
    const xLabels = chartData.filter((_, i) => i % step === 0 || i === chartData.length - 1)

    return {
      maxRevenue,
      maxVisitors,
      chartHeight,
      chartWidth,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      xScale,
      yScaleRevenue,
      yScaleVisitors,
      revenuePath,
      visitorsPath,
      revenueAreaPath,
      xLabels
    }
  }, [chartData])

  const { maxRevenue, maxVisitors, chartHeight, chartWidth, paddingLeft, paddingRight, paddingTop, paddingBottom, xScale, yScaleRevenue, yScaleVisitors, revenuePath, visitorsPath, revenueAreaPath, xLabels } = chartParams

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-gray-800">Revenue & Visitors Trend</h3>
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 cursor-pointer w-[110px] justify-between"
          >
            Last {filter} Days
            <ChevronDown className="w-3 h-3" />
          </button>
          
          <AnimatePresence>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-10 mt-1 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20"
                >
                  <div className="p-1">
                    {[7, 14, 30].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setFilter(option as 7 | 14 | 30)
                          setDropdownOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          filter === option
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Last {option} Days
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-emerald-500 rounded"></div>
          <span className="text-xs text-gray-500">Revenue (₹)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 rounded" style={{ borderTop: '1px dashed #a7f3d0' }}></div>
          <span className="text-xs text-gray-500">Visitors (Scans)</span>
        </div>
      </div>

      <div className="w-full">
        <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="block overflow-visible">
          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((tickMult) => {
            const yPos = paddingTop + chartHeight - paddingBottom - tickMult * (chartHeight - paddingTop - paddingBottom)
            const revenueVal = Math.round(tickMult * maxRevenue)
            return (
              <g key={tickMult}>
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={chartWidth - paddingRight}
                  y2={yPos}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
                <text x={paddingLeft - 8} y={yPos + 4} textAnchor="end" className="text-[11px] fill-gray-400" style={{ fontSize: 11 }}>
                  ₹{revenueVal}
                </text>
              </g>
            )
          })}

          {/* Right axis labels */}
          {[0, 0.33, 0.66, 1].map((tickMult) => {
            const yPos = paddingTop + chartHeight - paddingBottom - tickMult * (chartHeight - paddingTop - paddingBottom)
            const visitorsVal = Math.round(tickMult * maxVisitors)
            return (
              <text
                key={tickMult}
                x={chartWidth - paddingRight + 8}
                y={yPos + 4}
                textAnchor="start"
                className="text-[11px] fill-gray-400"
                style={{ fontSize: 11 }}
              >
                {visitorsVal}
              </text>
            )
          })}

          {/* Revenue area gradient */}
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={revenueAreaPath} fill="url(#revenueGradient)" />

          {/* Visitors dashed line */}
          <path d={visitorsPath} fill="none" stroke="#a7f3d0" strokeWidth="2" strokeDasharray="6 4" />

          {/* Revenue line */}
          <path d={revenuePath} fill="none" stroke="#10b981" strokeWidth="2.5" />

          {/* Data points */}
          {chartData.map((d, i) => (
            <g key={i}>
              <circle
                cx={xScale(i)}
                cy={yScaleRevenue(d.revenue)}
                r={hoveredIndex === i ? 6 : 3.5}
                fill="#10b981"
                stroke="white"
                strokeWidth="2"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-all duration-200"
              />
              {hoveredIndex === i && (
                <g>
                  <rect
                    x={xScale(i) - 40}
                    y={yScaleRevenue(d.revenue) - 44}
                    width="80"
                    height="36"
                    rx="6"
                    fill="#1f2937"
                  />
                  <text
                    x={xScale(i)}
                    y={yScaleRevenue(d.revenue) - 25}
                    textAnchor="middle"
                    className="fill-white"
                    style={{ fontSize: 12, fontWeight: 600 }}
                  >
                    ₹{d.revenue.toLocaleString()}
                  </text>
                  <text
                    x={xScale(i)}
                    y={yScaleRevenue(d.revenue) - 13}
                    textAnchor="middle"
                    className="fill-gray-400"
                    style={{ fontSize: 9 }}
                  >
                    {d.visitors} scans
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 pl-[60px] pr-[40px]">
          {xLabels.map((label, idx) => (
            <span key={idx} className="text-[11px] text-gray-400">{label.date}</span>
          ))}
        </div>
      </div>
    </div>
  )
})

// ─── PeakHours ───────────────────────────────────────────────────────
const PeakHours = React.memo(function PeakHours({ ordersTimestamps }: { ordersTimestamps: string[] }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const displayData = useMemo(() => {
    if (!mounted) {
      return [
        { time: '11 AM', count: 0, percentage: 0 },
        { time: '1 PM', count: 0, percentage: 0 },
        { time: '7 PM', count: 0, percentage: 0 },
      ]
    }

    const hoursMap: Record<number, number> = {}
    ordersTimestamps.forEach(ts => {
      const d = new Date(ts)
      const h = d.getHours()
      hoursMap[h] = (hoursMap[h] || 0) + 1
    })

    const rawData = Object.entries(hoursMap)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const maxCount = Math.max(...rawData.map(p => p.count), 1)
    
    if (rawData.length > 0) {
      return rawData.map(p => {
        const ampm = p.hour >= 12 ? 'PM' : 'AM'
        const h = p.hour % 12 || 12
        return {
          time: `${h} ${ampm}`,
          count: p.count,
          percentage: Math.round((p.count / maxCount) * 100)
        }
      })
    }

    return [
      { time: '11 AM', count: 0, percentage: 0 },
      { time: '1 PM', count: 0, percentage: 0 },
      { time: '7 PM', count: 0, percentage: 0 },
    ]
  }, [mounted, ordersTimestamps])

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col relative h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-500" />
          <h3 className="text-sm font-semibold text-gray-800">Peak Hours (Orders)</h3>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {displayData.map((item, idx) => (
          <div key={item.time + idx} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-10">{item.time}</span>
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-700 w-10 text-right">{item.count.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
})

// ─── TopCategories (Replaces DeviceUsage) ────────────────────────────
const TopCategories = React.memo(function TopCategories({ menuItems = [] }: { menuItems?: any[] }) {
  const { categoryData, circumference, hasData } = useMemo(() => {
    const viewsByCategory: Record<string, number> = {}
    let totalViews = 0

    menuItems.forEach(item => {
      const cat = item.category || 'Other'
      const views = item.views || 0
      viewsByCategory[cat] = (viewsByCategory[cat] || 0) + views
      totalViews += views
    })

    const sortedCats = Object.entries(viewsByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    // Fallback if no data
    if (totalViews === 0 || sortedCats.length === 0) {
      return {
        categoryData: [
          { label: 'Starters', percentage: 45, color: '#10b981' },
          { label: 'Mains', percentage: 35, color: '#34d399' },
          { label: 'Desserts', percentage: 20, color: '#a7f3d0' },
        ],
        circumference: 2 * Math.PI * 45,
        hasData: false
      }
    }

    const colors = ['#10b981', '#34d399', '#a7f3d0']
    
    // Convert top 3 to percentage of the top 3 total
    const top3Total = sortedCats.reduce((acc, curr) => acc + curr[1], 0)
    
    const categoryData = sortedCats.map((cat, idx) => ({
      label: cat[0].length > 12 ? cat[0].substring(0, 12) + '...' : cat[0],
      percentage: Math.round((cat[1] / top3Total) * 100),
      color: colors[idx % colors.length]
    }))

    // ensure it sums to exactly 100
    const sum = categoryData.reduce((acc, curr) => acc + curr.percentage, 0)
    if (sum !== 100 && categoryData.length > 0) {
      categoryData[0].percentage += (100 - sum)
    }

    return {
      categoryData,
      circumference: 2 * Math.PI * 45,
      hasData: true
    }
  }, [menuItems])

  let offset = 0

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Utensils className="w-5 h-5 text-emerald-500" />
          <h3 className="text-sm font-semibold text-gray-800">Top Categories</h3>
        </div>
      </div>

      {!hasData && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center rounded-2xl">
           <p className="text-xs font-semibold text-gray-500 mt-6">Not enough data yet</p>
        </div>
      )}

      <div className={`flex items-center justify-center gap-6 flex-1 ${!hasData ? 'opacity-30' : ''}`}>
        <div className="relative w-32 h-32">
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="45" fill="none" stroke="#f3f4f6" strokeWidth="18" />
            {categoryData.map((cat) => {
              const dashLength = (cat.percentage / 100) * circumference
              const segment = (
                <circle
                  key={cat.label}
                  cx="64"
                  cy="64"
                  r="45"
                  fill="none"
                  stroke={cat.color}
                  strokeWidth="18"
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                  transform="rotate(-90 64 64)"
                  className="transition-all duration-1000 ease-out"
                />
              )
              offset += dashLength
              return segment
            })}
          </svg>
        </div>

        <div className="space-y-3">
          {categoryData.map((cat) => (
            <div key={cat.label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-xs text-gray-600 w-16 truncate">{cat.label}</span>
              <span className="text-xs font-semibold text-gray-800">{cat.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

// ─── CustomerInsights ────────────────────────────────────────────────
const CustomerInsights = React.memo(function CustomerInsights({ aov, conversionRate, revPerScan }: { aov: number, conversionRate: number, revPerScan: number }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5">
        <Tag className="w-5 h-5 text-emerald-500" />
        <h3 className="text-sm font-semibold text-gray-800">Customer Insights</h3>
      </div>

      <div className="space-y-5 flex-1">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-emerald-600 text-sm font-semibold">₹</span>
            <div>
              <p className="text-xs text-gray-500">Average Order Value</p>
            </div>
          </div>
          <span className="text-sm font-bold text-gray-800">₹{aov.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <QrCode className="w-4 h-4 text-emerald-500" />
            <div>
              <p className="text-xs text-gray-800 font-medium">Scan-to-Order</p>
              <p className="text-[10px] text-gray-400">conversion rate</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-gray-800">{conversionRate}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
            <div>
              <p className="text-xs text-gray-800 font-medium">Revenue per Scan</p>
              <p className="text-[10px] text-gray-400">average</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-gray-800">₹{revPerScan}</span>
          </div>
        </div>
      </div>
    </div>
  )
})

// ─── Helper: format large numbers ────────────────────────────────────
function formatValue(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

// ─── Main AnalyticsClient ────────────────────────────────────────────
export default function AnalyticsClient({ restaurantId, ...data }: AnalyticsData & { restaurantId?: string }) {
  const { hasAccessTo, triggerUpgrade } = useSubscription()
  const hasBasic = hasAccessTo('analytics_basic')
  const hasAdvanced = hasAccessTo('analytics_advanced')
  
  const growth = data.growth30 || { visitors: 0, orders: 0, revenue: 0, scans: 0 }
  
  const formatGrowth = useCallback((val: number) => {
    if (val === 0) return '0%';
    return val > 0 ? `+${val}%` : `${val}%`;
  }, []);

  const handleOrdersClick = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ordersModalToggle', { detail: true }))
    }
  }, []);

  return (
    <div className="w-full text-left">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Analytics</h1>
        <p className="text-sm text-gray-500">Track customer behavior and restaurant performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<IndianRupee className="w-5 h-5" />}
          label="Total Revenue"
          value={data.revenue > 0 ? `₹${formatValue(data.revenue)}` : '₹0'}
          change={formatGrowth(growth.revenue)}
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Visitors"
          value={data.visitsCount > 0 ? formatValue(data.visitsCount) : '0'}
          change={formatGrowth(growth.visitors)}
        />
        <StatCard
          icon={<ShoppingBag className="w-5 h-5" />}
          label="Total Orders"
          value={data.ordersCount > 0 ? data.ordersCount.toLocaleString() : '0'}
          change={formatGrowth(growth.orders)}
          onClick={handleOrdersClick}
        />
        <StatCard
          icon={<QrCode className="w-5 h-5" />}
          label="Total Scans"
          value={data.scansCount > 0 ? formatValue(data.scansCount) : '0'}
          change={formatGrowth(growth.scans)}
        />
      </div>

      {/* Revenue Chart */}
      <div className="mb-6 relative">
        {!hasBasic && (
          <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[4px] rounded-2xl flex flex-col items-center justify-center p-6 border border-gray-100/50">
            <Lock className="w-8 h-8 text-slate-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">Basic Analytics Locked</h3>
            <p className="text-sm text-slate-500 mb-4 text-center max-w-sm">Upgrade to Starter to unlock detailed revenue and visitor trends.</p>
            <button 
              onClick={() => triggerUpgrade('Basic Analytics', 'analytics_basic')}
              className="px-5 py-2.5 bg-[#F47B3E] hover:bg-[#e06b30] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#F47B3E]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Upgrade to Starter
            </button>
          </div>
        )}
        <div className={!hasBasic ? "opacity-30 pointer-events-none select-none blur-[2px]" : ""}>
          <RevenueChart scansTimestamps={data.scansTimestamps} ordersRaw={data.ordersRaw} />
        </div>
      </div>

      {/* Bottom Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <LazyRender height={300}>
          <div className="relative h-full">
            {!hasAdvanced && (
              <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[4px] rounded-2xl flex flex-col items-center justify-center p-6 border border-gray-100/50">
                <Lock className="w-6 h-6 text-slate-400 mb-2" />
                <h3 className="text-sm font-bold text-slate-800 mb-1 text-center leading-tight">Peak Hours Locked</h3>
                <button 
                  onClick={() => triggerUpgrade('Peak Hours', 'analytics_advanced')}
                  className="mt-2 px-4 py-2 bg-[#F47B3E] hover:bg-[#e06b30] text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Upgrade
                </button>
              </div>
            )}
            <div className={`h-full ${!hasAdvanced ? 'opacity-30 pointer-events-none select-none blur-[2px]' : ''}`}>
              <PeakHours ordersTimestamps={data.ordersTimestamps} />
            </div>
          </div>
        </LazyRender>
        <LazyRender height={300}>
          <div className="relative h-full">
            {!hasAdvanced && (
              <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[4px] rounded-2xl flex flex-col items-center justify-center p-6 border border-gray-100/50">
                <Lock className="w-6 h-6 text-slate-400 mb-2" />
                <h3 className="text-sm font-bold text-slate-800 mb-1 text-center leading-tight">Top Categories Locked</h3>
                <button 
                  onClick={() => triggerUpgrade('Top Categories', 'analytics_advanced')}
                  className="mt-2 px-4 py-2 bg-[#F47B3E] hover:bg-[#e06b30] text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Upgrade
                </button>
              </div>
            )}
            <div className={`h-full ${!hasAdvanced ? 'opacity-30 pointer-events-none select-none blur-[2px]' : ''}`}>
              <TopCategories menuItems={(data as any).menuItems} />
            </div>
          </div>
        </LazyRender>
        <LazyRender height={300}>
          <div className="relative h-full">
            {!hasAdvanced && (
              <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[4px] rounded-2xl flex flex-col items-center justify-center p-6 border border-gray-100/50">
                <Lock className="w-6 h-6 text-slate-400 mb-2" />
                <h3 className="text-sm font-bold text-slate-800 mb-1 text-center leading-tight">Customer Insights Locked</h3>
                <button 
                  onClick={() => triggerUpgrade('Customer Insights', 'analytics_advanced')}
                  className="mt-2 px-4 py-2 bg-[#F47B3E] hover:bg-[#e06b30] text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Upgrade
                </button>
              </div>
            )}
            <div className={`h-full ${!hasAdvanced ? 'opacity-30 pointer-events-none select-none blur-[2px]' : ''}`}>
              <CustomerInsights aov={data.averageOrderValue} conversionRate={data.conversionRate} revPerScan={data.revPerScan} />
            </div>
          </div>
        </LazyRender>
      </div>
    </div>
  )
}
