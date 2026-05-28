'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Search,
  ChevronDown,
  Pencil,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Plus,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  Zap,
  ArrowUpDown,
  Upload,
  FileSpreadsheet,
  QrCode,
  Printer,
  Pizza,
  Coffee,
  Beef,
  IceCreamCone,
  Soup,
  PackageOpen,
  Salad,
  MoreHorizontal,
  Trash2,
  Lock
} from 'lucide-react'
import { createMenuItem, updateMenuItem, deleteMenuItem, bulkCreateMenuItems, updateItemOrders } from '../actions'
import { useSubscription } from '../../context/SubscriptionContext'
import NewMenuFormClient from './NewMenuFormClient'
import EditMenuFormClient from './EditMenuFormClient'
import { QRCodeSVG } from 'qrcode.react'
import Papa from 'papaparse'


// ─── Types ───────────────────────────────────────────────────────────
interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  image_url: string | null
  available?: boolean
  is_available?: boolean // keep matching columns
  tags?: string[]
  ingredients?: string[]
  calories?: number
  sort_order?: number
}

interface MenuClientProps {
  items: MenuItem[]
  currencySymbol: string
  restaurantId: string
}

// ─── Constants ───────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 6

const categoryIcons: Record<string, React.ReactNode> = {
  pizza: <Pizza className="w-4 h-4 text-[#F47B3E]" />,
  drinks: <Coffee className="w-4 h-4 text-[#F47B3E]" />,
  burger: <Beef className="w-4 h-4 text-[#F47B3E]" />,
  desserts: <IceCreamCone className="w-4 h-4 text-[#F47B3E]" />,
  pasta: <Soup className="w-4 h-4 text-[#F47B3E]" />,
  combos: <PackageOpen className="w-4 h-4 text-[#F47B3E]" />,
  appetizers: <Salad className="w-4 h-4 text-[#F47B3E]" />,
  others: <MoreHorizontal className="w-4 h-4 text-[#F47B3E]" />,
}

const MenuRow = React.memo(({
  item,
  currencySymbol,
  isHighlighted,
  onEdit,
  onDeleteClick,
  setHighlightedRow,
  isReorderMode,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: {
  item: MenuItem
  currencySymbol: string
  isHighlighted: boolean
  onEdit: (id: string) => void
  onDeleteClick: (item: MenuItem) => void
  setHighlightedRow: (id: string | null) => void
  isReorderMode?: boolean
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
}) => {
  return (
    <div
      className={`flex flex-col sm:grid sm:grid-cols-[1fr_100px_80px_80px_80px] gap-3 sm:gap-2 sm:items-center px-4 py-4 border-b border-[#F5F5F5] transition-colors ${
        isHighlighted ? 'bg-[#FFF8F3]' : 'hover:bg-[#FAFAFA]'
      }`}
    >
      {/* Item info */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F5F5F5] shrink-0 border border-slate-100">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50">
              <ShoppingBag className="w-5 h-5 text-[#F47B3E]/40" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-[#111827] truncate">{item.name}</p>
          <p className="text-[12px] text-[#6B7280] line-clamp-2 leading-relaxed mt-0.5">{item.description || 'No description'}</p>
        </div>
      </div>

      {/* Mobile Row Wrapper */}
      <div className="flex items-center gap-3 w-full sm:contents mt-1 sm:mt-0">
        {/* Category */}
        <div className="order-2 sm:order-none">
          <span className="inline-block px-2.5 py-1 bg-[#FFF3ED] text-[#F47B3E] text-[12px] font-medium rounded-md">
            {item.category || 'Other'}
          </span>
        </div>

        {/* Price */}
        <div className="order-1 sm:order-none">
          <span className="text-[14px] font-bold text-[#111827]">{currencySymbol}{item.price}</span>
        </div>

        {/* Status */}
        <div className="order-3 sm:order-none">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-medium ${
            item.available !== false && item.is_available !== false
              ? 'bg-[#ECFDF5] text-[#22C55E]'
              : 'bg-red-50 text-red-500'
          }`}>
            {item.available !== false && item.is_available !== false ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Actions */}
        <div className="order-4 sm:order-none ml-auto sm:ml-0 flex items-center justify-center gap-2">
          {isReorderMode ? (
            <>
              <button
                onClick={onMoveUp}
                disabled={isFirst}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-slate-400 hover:text-[#F47B3E] hover:bg-[#FFF3ED]'}`}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={onMoveDown}
                disabled={isLast}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${isLast ? 'text-gray-300 cursor-not-allowed' : 'text-slate-400 hover:text-[#F47B3E] hover:bg-[#FFF3ED]'}`}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setHighlightedRow(item.id)
                  onEdit(item.id)
                }}
                className="p-1.5 text-[#F47B3E] hover:bg-[#FFF3ED] rounded-md transition-colors cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteClick(item)}
                className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                title="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
})
MenuRow.displayName = 'MenuRow'

// ─── Main Component ──────────────────────────────────────────────────
export default function MenuClient({ items, currencySymbol, restaurantId }: MenuClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('popular')
  const [currentPage, setCurrentPage] = useState(1)
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null)
  
  const { limits, hasAccessTo, triggerUpgrade } = useSubscription()

  // Local state for Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [editItemId, setEditItemId] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)
  
  // Quick Actions State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isReorderMode, setIsReorderMode] = useState(false)
  
  // Live items for optimistic UI
  const [liveItems, setLiveItems] = useState<MenuItem[]>(items)
  
  useEffect(() => {
    setLiveItems(items)
  }, [items])

  // Hide bottom nav when modal is open
  useEffect(() => {
    const isModalOpen = isNewModalOpen || editItemId !== null || itemToDelete !== null || isQrModalOpen || isImportModalOpen
    window.dispatchEvent(new CustomEvent('hideBottomNav', { detail: isModalOpen }))
    
    return () => {
      window.dispatchEvent(new CustomEvent('hideBottomNav', { detail: false }))
    }
  }, [isNewModalOpen, editItemId, itemToDelete, isQrModalOpen, isImportModalOpen])

  // Find the exact active item to edit
  const editItem = useMemo(() => {
    if (editItemId) {
      return liveItems.find(item => item.id === editItemId) || null
    }
    return null
  }, [liveItems, editItemId])

  // Derive categories
  const categories = useMemo(() => {
    const cats: Record<string, number> = {}
    liveItems.forEach(item => {
      const cat = item.category || 'Others'
      cats[cat] = (cats[cat] || 0) + 1
    })
    return cats
  }, [liveItems])

  const totalItems = liveItems.length
  const activeItems = liveItems.filter(i => i.available !== false && i.is_available !== false).length
  const inactiveItems = totalItems - activeItems
  const totalCategories = Object.keys(categories).length
  
  const isMenuLimitReached = totalItems >= limits.maxMenuItems
  const isCategoryLimitReached = totalCategories >= limits.maxCategories

  // Filter & sort
  const filteredItems = useMemo(() => {
    let result = [...liveItems]

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q)
      )
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(item => (item.category || 'Others') === selectedCategory)
    }

    // Sort
    if (isReorderMode) {
      result.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  }, [liveItems, searchQuery, selectedCategory, sortBy])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE))
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleCreateOptimistic = async (formData: FormData) => {
    const tempId = 'temp-' + Date.now()
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const category = formData.get('category') as string
    const image_url = formData.get('image_url') as string
    const available = formData.get('available') !== 'false'
    const tagsStr = formData.get('tags') as string
    const ingredientsStr = formData.get('ingredients') as string
    const caloriesStr = formData.get('calories') as string
    const calories = caloriesStr ? parseInt(caloriesStr) : undefined
    
    const tags = tagsStr ? tagsStr.split(',').map(s => s.trim()) : []
    const ingredients = ingredientsStr ? ingredientsStr.split(',').map(s => s.trim()) : []

    const newItem: MenuItem = {
      id: tempId,
      name,
      description: description || null,
      price,
      category: category || null,
      image_url: image_url || null,
      available,
      is_available: available,
      tags,
      ingredients,
      calories
    }
    
    setLiveItems(prev => [newItem, ...prev])
    setIsNewModalOpen(false)

    try {
      await createMenuItem(formData)
    } catch (e) {
      console.error(e)
      setLiveItems(prev => prev.filter(i => i.id !== tempId))
      alert('Failed to create item. Please try again.')
    }
  }

  const handleUpdateOptimistic = async (formData: FormData) => {
    if (!editItemId) return
    const id = editItemId
    const previousItems = [...liveItems]
    
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const category = formData.get('category') as string
    const image_url = formData.get('image_url') as string
    const available = formData.get('available') !== 'false'
    
    setLiveItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          name,
          description: description || null,
          price,
          category: category || null,
          image_url: image_url || null,
          available,
          is_available: available,
        }
      }
      return item
    }))
    
    setEditItemId(null)

    try {
      await updateMenuItem(id, formData)
    } catch (e) {
      console.error(e)
      setLiveItems(previousItems)
      alert('Failed to update item.')
    }
  }

  const handleDeleteOptimistic = async (id: string) => {
    const previousItems = [...liveItems]
    setLiveItems(prev => prev.filter(i => i.id !== id))
    setItemToDelete(null)
    if (editItemId === id) setEditItemId(null)
    
    try {
      await deleteMenuItem(id)
    } catch (e) {
      console.error(e)
      setLiveItems(previousItems)
      alert('Failed to delete item.')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const validItems = results.data.filter((item: any) => item.name && item.price)
          if (validItems.length === 0) {
            alert('No valid items found in CSV. Make sure you have "name" and "price" columns.')
            return
          }
          
          setIsImportModalOpen(false)
          
          // Optimistic UI
          const newItems = validItems.map((item: any, index) => ({
            id: `temp-bulk-${Date.now()}-${index}`,
            name: item.name,
            description: item.description || null,
            price: parseFloat(item.price) || 0,
            category: item.category || 'Others',
            image_url: item.image_url || null,
            available: true,
            is_available: true,
          }))
          
          setLiveItems(prev => [...newItems, ...prev])
          
          await bulkCreateMenuItems(validItems)
        } catch (error) {
          console.error(error)
          alert('Failed to import items. Refreshing...')
          window.location.reload()
        }
      },
      error: (error) => {
        console.error(error)
        alert('Error parsing file.')
      }
    })
  }


  // Page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1, 2, 3)
      if (totalPages > 4) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  // Category grid entries (show up to 8)
  const categoryEntries = useMemo(() => {
    const defaultCats = ['Pizza', 'Drinks', 'Burger', 'Desserts', 'Pasta', 'Combos', 'Appetizers', 'Others']
    return defaultCats.map(cat => ({
      name: cat,
      count: categories[cat] || 0,
      icon: categoryIcons[cat.toLowerCase()] || <LayoutGrid className="w-4 h-4 text-[#F47B3E]" />,
    }))
  }, [categories])

  const currencyCode = currencySymbol === '₹' ? 'INR' : currencySymbol === '$' ? 'USD' : currencySymbol === '€' ? 'EUR' : 'GBP'

  return (
    <div className="w-full text-left relative print:m-0 print:p-0">
      <div className="print:hidden">
      
      {/* Limits Warning Banner */}
      {(isMenuLimitReached || isCategoryLimitReached) && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-3">
            <Lock className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[14px] font-bold text-red-800">
                {isMenuLimitReached ? "You've reached your menu item limit." : "You've reached your category limit."}
              </h4>
              <p className="text-[13px] text-red-600 mt-0.5">
                Upgrade to Starter or above for unlimited items & categories.
              </p>
            </div>
          </div>
          <button 
            onClick={() => triggerUpgrade('Unlimited Items', 'menu_items_unlimited')}
            className="shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[13px] font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Upgrade Now
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[32px] font-bold text-[#111827] leading-tight">Menu Management</h1>
          <p className="text-[13px] text-[#6B7280] mt-1">Manage your menu items, categories and availability.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/menu/${restaurantId}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#EEEEEE] rounded-lg text-[13px] font-medium text-[#6B7280] hover:bg-gray-50 transition-colors cursor-pointer bg-white animate-in fade-in duration-200"
          >
            View Menu
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => {
              if (isMenuLimitReached || isCategoryLimitReached) {
                triggerUpgrade('Unlimited Items', 'menu_items_unlimited')
              } else {
                setIsNewModalOpen(true)
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F47B3E] hover:bg-[#e06b30] rounded-lg text-[13px] font-semibold text-white transition-colors cursor-pointer shadow-sm animate-in fade-in duration-200"
          >
            <Plus className="w-4 h-4" />
            Add New Item
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-stretch">
        {/* Left Column — Menu Table */}
        <div className="bg-white rounded-xl border border-[#EEEEEE] overflow-hidden flex flex-col h-full">
          {/* Search / Filter Bar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 border-b border-[#EEEEEE]">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                className="w-full pl-9 pr-4 py-2 border border-[#EEEEEE] rounded-lg text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#F47B3E] transition-colors"
              />
            </div>
            <div className="relative shrink-0">
              <select
                value={selectedCategory}
                onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1) }}
                className="appearance-none bg-white border border-[#EEEEEE] rounded-lg px-3 py-2 pr-8 text-[13px] text-[#111827] focus:outline-none focus:border-[#F47B3E] cursor-pointer"
              >
                <option value="All">All ({totalItems})</option>
                {Object.entries(categories).map(([cat, count]) => (
                  <option key={cat} value={cat}>{cat} ({count})</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none" />
            </div>
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                disabled={isReorderMode}
                className="appearance-none bg-white border border-[#EEEEEE] rounded-lg px-3 py-2 pr-8 text-[13px] text-[#111827] focus:outline-none focus:border-[#F47B3E] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="popular">Sort by: Popular</option>
                <option value="name">Sort by: Name</option>
                <option value="price-low">Sort by: Price ↑</option>
                <option value="price-high">Sort by: Price ↓</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none" />
            </div>
          </div>

          {/* Reorder Mode Banner */}
          {isReorderMode && (
            <div className="bg-[#FFF8F3] px-5 py-3 border-b border-[#F47B3E]/20 flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#F47B3E]">Reorder Mode Active. Use the arrows to change the item order.</span>
              <div className="flex gap-2">
                <button onClick={() => {
                   setIsReorderMode(false)
                   setLiveItems(items) // Cancel: revert
                }} className="px-3 py-1.5 rounded-lg border border-[#F47B3E]/30 text-[#F47B3E] text-[12px] font-semibold hover:bg-[#F47B3E]/5 cursor-pointer">Cancel</button>
                <button onClick={async () => {
                   setIsReorderMode(false)
                   const orders = liveItems.map((item, index) => ({ id: item.id, sort_order: index }))
                   try {
                     await updateItemOrders(orders)
                     alert('Order saved successfully.')
                   } catch (e) {
                     alert('Failed to save order. Make sure sort_order column exists in DB.')
                   }
                }} className="px-3 py-1.5 rounded-lg bg-[#F47B3E] text-white text-[12px] font-semibold hover:bg-[#e06b30] shadow-sm shadow-[#F47B3E]/20 cursor-pointer">Save Order</button>
              </div>
            </div>
          )}

          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[1fr_100px_80px_80px_80px] gap-2 px-4 py-3 border-b border-[#EEEEEE]">
            <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Item</span>
            <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Category</span>
            <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Price</span>
            <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Status</span>
            <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider text-center">Actions</span>
          </div>

          {/* Table Rows & Body Container */}
          <div className="flex-1">
            {totalItems === 0 ? (
              /* First-time Onboarding Empty State */
              <div className="py-20 px-6 text-center h-full flex-1 flex flex-col items-center justify-center relative overflow-hidden select-none">
                {/* Decorative background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#FFF3ED] rounded-full blur-3xl opacity-60 pointer-events-none" />
                
                <div className="relative z-10 max-w-sm space-y-6">
                  <div className="mx-auto w-16 h-16 bg-[#FFF3ED] border border-[#FFF3ED] rounded-2xl flex items-center justify-center shadow-sm">
                    <ShoppingBag className="w-7 h-7 text-[#F47B3E]" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-[18px] font-bold text-[#111827] tracking-tight">Create your first menu item</h3>
                    <p className="text-[13px] text-[#6B7280] leading-relaxed">
                      Get started by adding delicious dishes, drinks, or desserts to your menu. Your updates will sync in real-time for your customers.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (isMenuLimitReached || isCategoryLimitReached) {
                        triggerUpgrade('Unlimited Items', 'menu_items_unlimited')
                      } else {
                        setIsNewModalOpen(true)
                      }
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#F47B3E] hover:bg-[#e06b30] text-white font-bold text-[14px] rounded-xl shadow-lg shadow-[#F47B3E]/10 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Item
                  </button>
                </div>
              </div>
            ) : filteredItems.length === 0 ? (
              /* Search/Filter Empty State */
              <div className="py-16 text-center h-full flex-1 flex flex-col justify-center items-center">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
                  <Search className="w-5 h-5 text-[#9CA3AF]" />
                </div>
                <p className="text-[14px] font-semibold text-[#111827]">No matching items found</p>
                <p className="text-[12px] text-[#9CA3AF] mt-1 max-w-xs mx-auto leading-relaxed">
                  We couldn't find anything matching "{searchQuery}". Try checking your spelling or adjusting your filters.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}
                  className="mt-4 px-4 py-2 border border-[#EEEEEE] hover:bg-gray-50 rounded-lg text-[13px] font-semibold text-[#111827] transition-colors cursor-pointer"
                >
                  Clear Search & Filters
                </button>
              </div>
            ) : (
              /* Table Rows List + Inline Add Button */
              <div>
                <div>
                  {paginatedItems.map((item, idx) => (
                    <MenuRow
                      key={item.id}
                      item={item}
                      currencySymbol={currencySymbol}
                      isHighlighted={highlightedRow === item.id}
                      onEdit={setEditItemId}
                      onDeleteClick={setItemToDelete}
                      setHighlightedRow={setHighlightedRow}
                      isReorderMode={isReorderMode}
                      isFirst={idx === 0}
                      isLast={idx === paginatedItems.length - 1}
                      onMoveUp={() => {
                        const idxInLive = liveItems.findIndex(i => i.id === item.id)
                        if (idxInLive > 0) {
                          const newLive = [...liveItems]
                          const temp = newLive[idxInLive]
                          newLive[idxInLive] = newLive[idxInLive - 1]
                          newLive[idxInLive - 1] = temp
                          // Update sort_order based on array index
                          newLive.forEach((n, i) => n.sort_order = i)
                          setLiveItems(newLive)
                        }
                      }}
                      onMoveDown={() => {
                        const idxInLive = liveItems.findIndex(i => i.id === item.id)
                        if (idxInLive < liveItems.length - 1) {
                          const newLive = [...liveItems]
                          const temp = newLive[idxInLive]
                          newLive[idxInLive] = newLive[idxInLive + 1]
                          newLive[idxInLive + 1] = temp
                          newLive.forEach((n, i) => n.sort_order = i)
                          setLiveItems(newLive)
                        }
                      }}
                    />
                  ))}
                </div>

                {/* Inline Add Button (only shown when the page/showing bar is not filled) */}
                {paginatedItems.length < ITEMS_PER_PAGE && (
                  <div className="p-4 animate-in fade-in duration-300">
                    <button
                      onClick={() => {
                        if (isMenuLimitReached || isCategoryLimitReached) {
                          triggerUpgrade('Unlimited Items', 'menu_items_unlimited')
                        } else {
                          setIsNewModalOpen(true)
                        }
                      }}
                      className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-[#F47B3E]/20 hover:border-[#F47B3E] bg-[#FFF8F3]/40 hover:bg-[#FFF3ED] rounded-xl text-[13px] font-semibold text-[#F47B3E] transition-all hover:scale-[1.01] active:scale-[0.99] group cursor-pointer"
                    >
                      <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                      Add New Item
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#EEEEEE]">
            <p className="text-[12px] text-[#9CA3AF]">
              Showing {filteredItems.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length} items
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 text-[#9CA3AF] hover:text-[#111827] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-md hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {getPageNumbers().map((page, i) => (
                typeof page === 'number' ? (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                      currentPage === page
                        ? 'border-2 border-[#F47B3E] text-[#F47B3E] bg-white'
                        : 'text-[#6B7280] hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={i} className="w-8 h-8 flex items-center justify-center text-[13px] text-[#9CA3AF]">...</span>
                )
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 text-[#9CA3AF] hover:text-[#111827] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-md hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Menu Summary */}
          <div className="bg-white rounded-xl border border-[#EEEEEE] p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 bg-[#FFF3ED] rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#F47B3E]" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#111827]">Menu Summary</h3>
            </div>
            <div className="space-y-0">
              {[
                { icon: <ShoppingBag className="w-4 h-4 text-[#F47B3E]" />, label: 'Total Items', value: totalItems, color: 'text-[#111827]' },
                { icon: <CheckCircle2 className="w-4 h-4 text-[#F47B3E]" />, label: 'Active Items', value: activeItems, color: 'text-[#F47B3E]' },
                { icon: <XCircle className="w-4 h-4 text-[#F47B3E]" />, label: 'Inactive Items', value: inactiveItems, color: 'text-[#111827]' },
                { icon: <LayoutGrid className="w-4 h-4 text-[#F47B3E]" />, label: 'Categories', value: totalCategories, color: 'text-[#111827]' },
              ].map((metric, idx) => (
                <div key={idx} className={`flex items-center gap-3 py-3.5 ${idx < 3 ? 'border-b border-[#F5F5F5]' : ''}`}>
                  {metric.icon}
                  <div>
                    <p className="text-[12px] text-[#9CA3AF]">{metric.label}</p>
                    <p className={`text-[20px] font-bold ${metric.color}`}>{metric.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-[#EEEEEE] p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-[#FFF3ED] rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#F47B3E]" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#111827]">Quick Actions</h3>
            </div>
            <div className="space-y-0">
              {[
                { icon: <ArrowUpDown className="w-4 h-4 text-[#F47B3E]" />, label: 'Reorder Items', onClick: () => setIsReorderMode(!isReorderMode) },
                { icon: <Upload className="w-4 h-4 text-[#F47B3E]" />, label: 'Bulk Upload', onClick: () => setIsImportModalOpen(true), featureKey: 'bulk_upload' },
                { icon: <FileSpreadsheet className="w-4 h-4 text-[#F47B3E]" />, label: 'Import from Excel', onClick: () => setIsImportModalOpen(true), featureKey: 'import_excel' },
                { icon: <QrCode className="w-4 h-4 text-[#F47B3E]" />, label: 'Print Menu QR', onClick: () => setIsQrModalOpen(true) },
              ].map((action, idx) => {
                const isLocked = action.featureKey && !hasAccessTo(action.featureKey)
                return (
                <button
                  key={idx}
                  onClick={(e) => {
                    if (isLocked) {
                      e.preventDefault()
                      triggerUpgrade(action.label, action.featureKey!)
                    } else {
                      action.onClick()
                    }
                  }}
                  className={`w-full flex items-center justify-between py-3 ${idx < 3 ? 'border-b border-[#F5F5F5]' : ''} ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#FAFAFA] cursor-pointer'} transition-colors group`}
                >
                  <div className="flex items-center gap-3">
                    {action.icon}
                    <span className="text-[13px] font-medium text-[#111827]">{action.label}</span>
                  </div>
                  {isLocked ? (
                    <Lock className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#9CA3AF] transition-colors" />
                  )}
                </button>
              )})}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl border border-[#EEEEEE] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-[#111827]">Categories</h3>
              <button className="text-[13px] font-medium text-[#F47B3E] hover:underline cursor-pointer">View All</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {categoryEntries.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => { setSelectedCategory(cat.name); setCurrentPage(1) }}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                    selectedCategory === cat.name ? 'bg-[#FFF3ED] border border-[#F47B3E]/20' : 'hover:bg-[#FAFAFA]'
                  }`}
                >
                  {cat.icon}
                  <div>
                    <p className="text-[13px] font-semibold text-[#111827] leading-tight">{cat.name}</p>
                    <p className="text-[11px] text-[#9CA3AF]">{cat.count} items</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div> {/* End print:hidden wrapper */}

      {/* ─── Add Menu Item Popup Modal ────────────────────────────────── */}
      <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-900/60 backdrop-blur-md overflow-y-auto transition-opacity duration-200 ${isNewModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop Click Close */}
        <div className="absolute inset-0 cursor-default" onClick={() => setIsNewModalOpen(false)} />
        
        <div className={`relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col z-10 transition-transform duration-200 ${isNewModalOpen ? 'scale-100' : 'scale-95'}`}>
          <div className="overflow-y-auto flex-1">
            <NewMenuFormClient 
              createMenuItem={handleCreateOptimistic} 
              currency={currencySymbol} 
              onClose={() => setIsNewModalOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* ─── Edit Menu Item Popup Modal ───────────────────────────────── */}
      <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-900/60 backdrop-blur-md overflow-y-auto transition-opacity duration-200 ${editItemId !== null ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop Click Close */}
        <div className="absolute inset-0 cursor-default" onClick={() => setEditItemId(null)} />
        
        <div className={`relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col z-10 transition-transform duration-200 ${editItemId !== null ? 'scale-100' : 'scale-95'}`}>
          <div className="overflow-y-auto flex-1">
            {editItem && (
              <EditMenuFormClient 
                key={editItem.id}
                item={editItem} 
                updateMenuItem={handleUpdateOptimistic} 
                deleteMenuItem={() => handleDeleteOptimistic(editItem.id)}
                currency={currencySymbol} 
                onClose={() => setEditItemId(null)}
              />
            )}
          </div>
        </div>
      </div>

      {/* ─── Delete Menu Item Popup Modal ─────────────────────────────── */}
      <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-900/60 backdrop-blur-md transition-opacity duration-200 ${itemToDelete ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop Click Close */}
        <div className="absolute inset-0 cursor-default" onClick={() => setItemToDelete(null)} />
        
        <div className={`relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 z-10 transition-transform duration-200 ${itemToDelete ? 'scale-100' : 'scale-95'}`}>
           <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Menu Item</h3>
           <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete <span className="font-bold text-slate-700">{itemToDelete?.name}</span>? This action is irreversible.</p>
           <div className="flex justify-end gap-3 mt-4">
             <button 
               onClick={() => setItemToDelete(null)} 
               className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
             >
               Cancel
             </button>
             <button 
               onClick={() => { if(itemToDelete) handleDeleteOptimistic(itemToDelete.id) }} 
               className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
             >
               <Trash2 className="w-4 h-4" /> Delete
             </button>
           </div>
        </div>
      </div>

      {/* ─── Bulk Import Modal ────────────────────────────────────────── */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-900/60 backdrop-blur-md transition-opacity duration-200 ${isImportModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop Click Close */}
        <div className="absolute inset-0 cursor-default" onClick={() => setIsImportModalOpen(false)} />
        
        <div className={`relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 flex flex-col z-10 transition-transform duration-200 ${isImportModalOpen ? 'scale-100' : 'scale-95'}`}>
           <h3 className="text-xl font-bold text-slate-900 mb-2">Import from CSV</h3>
           <p className="text-sm text-slate-500 mb-6">Upload a CSV file with your menu items. Required columns: <strong className="text-slate-800">name, price</strong>.</p>
           
           <div className="border-2 border-dashed border-[#F47B3E]/30 bg-[#FFF3ED]/30 rounded-2xl p-8 text-center mb-8 relative hover:bg-[#FFF3ED]/50 transition-colors">
             <input 
               type="file" 
               accept=".csv"
               onChange={handleFileUpload}
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             />
             <Upload className="w-8 h-8 text-[#F47B3E] mx-auto mb-3" />
             <p className="text-[14px] font-semibold text-[#111827]">Click or drag file to upload</p>
             <p className="text-[12px] text-slate-500 mt-1">.csv format only</p>
           </div>
           
           <div className="flex w-full gap-3 mt-auto">
             <button 
               onClick={() => setIsImportModalOpen(false)} 
               className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
             >
               Close
             </button>
           </div>
        </div>
      </div>

      {/* ─── Print QR Modal ───────────────────────────────────────────── */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-900/60 backdrop-blur-md transition-opacity duration-200 ${isQrModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} print:opacity-100 print:relative print:inset-auto print:bg-transparent print:p-0 print:m-0 print:flex-col print:items-center`}>
        {/* Backdrop Click Close */}
        <div className="absolute inset-0 cursor-default print:hidden" onClick={() => setIsQrModalOpen(false)} />
        
        <div className={`relative w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-100 p-8 flex flex-col items-center z-10 transition-transform duration-200 ${isQrModalOpen ? 'scale-100' : 'scale-95'} print:scale-100 print:shadow-none print:border-none print:w-auto print:p-0`}>
           <h3 className="text-xl font-bold text-slate-900 mb-6 print:hidden">Print Menu QR</h3>
           <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm print:border-none print:shadow-none print:p-0 mb-8 print:mb-4">
             <QRCodeSVG 
               value={`https://safardine.vercel.app/menu/${restaurantId}`} 
               size={256}
               level="H"
               includeMargin={true}
             />
           </div>
           <p className="text-center text-slate-900 text-2xl font-bold mb-2 hidden print:block">Scan to View Menu</p>
           
           <div className="flex w-full gap-3 mt-auto print:hidden">
             <button 
               onClick={() => setIsQrModalOpen(false)} 
               className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
             >
               Close
             </button>
             <button 
               onClick={() => window.print()} 
               className="flex-1 py-3 rounded-xl bg-[#F47B3E] hover:bg-[#e06b30] text-white font-bold shadow-lg shadow-[#F47B3E]/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
             >
               <Printer className="w-4 h-4" /> Print
             </button>
           </div>
        </div>
      </div>
    </div>
  )
}
