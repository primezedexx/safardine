'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Utensils, X, ChevronDown, Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface OrdersHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  restaurantId: string
}

export default function OrdersHistoryModal({
  isOpen,
  onClose,
  restaurantId
}: OrdersHistoryModalProps) {
  const [ordersHistory, setOrdersHistory] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [ordersHistoryDays, setOrdersHistoryDays] = useState(7)
  const [isOrdersDaysFilterOpen, setIsOrdersDaysFilterOpen] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    if (!isOpen || !restaurantId) return;
    
    const fetchOrdersHistory = async () => {
      setIsLoadingOrders(true)
      
      // Fetch menu items for images if not already fetched
      if (menuItems.length === 0) {
        const { data: menuData } = await supabase
          .from('menu_items')
          .select('name, image_url')
          .eq('restaurant_id', restaurantId)
        if (menuData) {
          setMenuItems(menuData)
        }
      }

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - ordersHistoryDays)
      startDate.setHours(0, 0, 0, 0)
      
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('type', 'order')
        
      if (ordersHistoryDays !== 999) {
        query = query.gte('created_at', startDate.toISOString())
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
        
      if (data) {
        setOrdersHistory(data)
      }
      setIsLoadingOrders(false)
    }

    fetchOrdersHistory()
  }, [isOpen, restaurantId, supabase, ordersHistoryDays])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
          />
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full md:w-[480px] h-full bg-[#FAFAFA] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 bg-white border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-slate-800 leading-tight">Orders History</h2>
                  <p className="text-[12px] text-slate-500 font-medium mt-0.5">Comprehensive log of all received orders</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Days Filter Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsOrdersDaysFilterOpen(!isOrdersDaysFilterOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#F1F1F1] hover:border-slate-300 rounded-full text-[12px] font-medium text-[#9A9A9A] bg-white transition-colors duration-200 whitespace-nowrap cursor-pointer"
                  >
                    {ordersHistoryDays === 999 ? 'All Time' : `Last ${ordersHistoryDays} Days`}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <AnimatePresence>
                    {isOrdersDaysFilterOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute right-0 top-full mt-2 w-36 bg-white border border-[#F1F1F1] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] z-50 py-1 overflow-hidden"
                      >
                        {[
                          { label: 'Last 7 Days', value: 7 }, 
                          { label: 'Last 30 Days', value: 30 }, 
                          { label: 'All Time', value: 999 }
                        ].map((option) => (
                          <button
                            key={option.label}
                            onClick={() => {
                              setOrdersHistoryDays(option.value)
                              setIsOrdersDaysFilterOpen(false)
                            }}
                            className={`w-full text-left px-4 py-2 text-[12px] font-medium transition-colors cursor-pointer ${
                              ordersHistoryDays === option.value 
                                ? 'bg-[#10B981]/10 text-[#10B981]' 
                                : 'text-[#666666] hover:bg-slate-50 hover:text-[#111111]'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingOrders ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3">
                  <div className="w-8 h-8 border-4 border-[#10B981]/20 border-t-[#10B981] rounded-full animate-spin" />
                  <p className="text-[13px] font-semibold text-slate-400">Loading historical orders...</p>
                </div>
              ) : ordersHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 pb-10">
                  <Utensils className="w-12 h-12 text-slate-200" />
                  <p className="text-sm font-semibold text-slate-500">No orders found in history</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ordersHistory.map((order, idx) => {
                    const parts = (order.description || "").split("\nSpecial Instructions: ")
                    const mainDesc = parts[0]
                    const instructions = parts[1]

                    // Extract item name to get image
                    const match = mainDesc.match(/for (.+?) from Table/);
                    const dishName = match ? match[1] : null;
                    const dish = menuItems.find(item => item.name === dishName);
                    const imageUrl = dish?.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80';

                    return (
                      <div key={order.id || idx} className="bg-white border border-gray-100 rounded-[20px] p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Order #{order.id.toString().slice(-4)}</p>
                            <p className="text-[14px] font-bold text-slate-800">
                              {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-block px-2.5 py-1 bg-[#10B981]/10 text-[#10B981] text-[10px] font-bold rounded-md uppercase tracking-wide">Completed</span>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <img src={imageUrl} alt={dishName || 'Dish'} className="w-[60px] h-[60px] md:w-[72px] md:h-[72px] rounded-[14px] object-cover shrink-0 border border-slate-100" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold text-slate-600 leading-relaxed mb-3">
                              {mainDesc}
                            </div>

                            {instructions && (
                              <div className="mb-2 px-3 py-2.5 bg-orange-50/50 rounded-xl border border-orange-100">
                                <div className="flex items-start gap-2">
                                  <Flame className="w-4 h-4 text-[#F47B3E] shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-[11px] font-bold text-orange-800 uppercase tracking-wider mb-0.5">Cooking Instructions</p>
                                    <p className="text-[13px] font-medium text-orange-900 leading-snug">
                                      {instructions}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
