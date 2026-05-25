'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { uploadRestaurantImage } from '@/app/(auth)/actions'
import ImageCropperModal from './ImageCropperModal'
import {
  LayoutGrid,
  UtensilsCrossed,
  BarChart3,
  Store,
  Settings as SettingsIcon,
  Bell,
  ChevronDown,
  Pencil,
  Building2,
  Phone,
  Mail,
  MapPin,
  BellRing,
  QrCode,
  Users,
  Palette,
  Link2,
  ShieldAlert,
  ChevronRight,
  X,
  Loader2,
  Check,
  CreditCard,
  Lock
} from 'lucide-react'
import { useSubscription } from '../../context/SubscriptionContext'

interface SettingsClientProps {
  restaurant: any
}

export default function SettingsClient({ restaurant }: SettingsClientProps) {
  const supabase = createClient()
  
  const { hasAccessTo, triggerUpgrade } = useSubscription()

  // General Info states
  const [profile, setProfile] = useState(restaurant)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editName, setEditName] = useState(restaurant?.restaurant_name || '')
  const [editPhone, setEditPhone] = useState(restaurant?.restaurant_phone || '')
  const [editEmail, setEditEmail] = useState(restaurant?.restaurant_email || '')
  const [editAddress, setEditAddress] = useState(restaurant?.restaurant_address || '')
  const [editLogo, setEditLogo] = useState(restaurant?.restaurant_logo || '')
  const [editCover, setEditCover] = useState(restaurant?.restaurant_cover || '')
  const [savingGeneral, setSavingGeneral] = useState(false)
  const [generalError, setGeneralError] = useState('')

  // Image upload and cropping states
  const [cropperModalOpen, setCropperModalOpen] = useState(false)
  const [cropperSrc, setCropperSrc] = useState('')
  const [cropperType, setCropperType] = useState<'logo' | 'cover'>('logo')
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Notifications states (stored in social_links._notifications as a workaround)
  const notifSettings = restaurant?.social_links?._notifications || {}
  const [orderAlerts, setOrderAlerts] = useState(notifSettings.orderAlerts !== false) // default true
  const [scanAlerts, setScanAlerts] = useState(notifSettings.scanAlerts === true) // default false
  const [reservationAlerts, setReservationAlerts] = useState(notifSettings.reservationAlerts !== false) // default true
  const [marketingUpdates, setMarketingUpdates] = useState(notifSettings.marketingUpdates === true) // default false

  // QR & Menu Settings states
  const [menuVisibility, setMenuVisibility] = useState('Public')
  const [qrStyle, setQrStyle] = useState('Minimal')
  const [autoGenQr, setAutoGenQr] = useState(true)

  // Hero Banner states
  const heroSettings = restaurant?.social_links?._hero || {}
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false)
  const [heroTagline, setHeroTagline] = useState(heroSettings.tagline || 'AUTHENTIC ITALIAN CUISINE')
  const [heroDesc, setHeroDesc] = useState(heroSettings.description || restaurant?.restaurant_description || 'This is a restaurant where pure hands meet pure soul ❤️')
  const [heroBadge1, setHeroBadge1] = useState(heroSettings.badge1 || '100% Vegetarian Options')
  const [heroBadge2, setHeroBadge2] = useState(heroSettings.badge2 || 'Organic Ingredients')
  const [savingHero, setSavingHero] = useState(false)
  const [heroError, setHeroError] = useState('')

  // Theme state
  const [theme, setTheme] = useState(restaurant?.theme || 'light')
  const [savingTheme, setSavingTheme] = useState(false)

  // Danger zone modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Social Links state
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(restaurant?.social_links || {})
  const [selectedService, setSelectedService] = useState<{ name: string, icon: string, currentUrl: string } | null>(null)
  const [serviceUrl, setServiceUrl] = useState('')
  const [savingService, setSavingService] = useState(false)
  const [serviceError, setServiceError] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  // Toast effect
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // Hide bottom nav when modal is open
  React.useEffect(() => {
    const isAnyModalOpen = isEditModalOpen || isHeroModalOpen || !!selectedService || cropperModalOpen || isDeleteModalOpen
    window.dispatchEvent(new CustomEvent('hideBottomNav', { detail: isAnyModalOpen }))
    
    return () => {
      window.dispatchEvent(new CustomEvent('hideBottomNav', { detail: false }))
    }
  }, [isEditModalOpen, isHeroModalOpen, selectedService, cropperModalOpen, isDeleteModalOpen])

  // Billing and Subscription Calculations
  const isSubscribed = restaurant?.subscription_active === true
  
  let isTrialActive = false
  let trialDaysRemaining = 0
  if (restaurant?.created_at && !isSubscribed) {
    const createdDate = new Date(restaurant.created_at)
    const currentDate = new Date()
    const diffTime = currentDate.getTime() - createdDate.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    if (diffDays <= 7.0) {
      isTrialActive = true
      trialDaysRemaining = Math.max(1, Math.ceil(7.0 - diffDays))
    }
  }

  let nextBillingDateStr = '—'
  if (isSubscribed) {
    const activatedDate = new Date(restaurant?.updated_at || restaurant?.created_at || Date.now())
    const currentPlanString = restaurant?.subscription_plan || ''
    let daysToAdd = 30
    if (currentPlanString.includes('pro')) daysToAdd = 365
    else if (currentPlanString.includes('growth')) daysToAdd = 180
    else if (currentPlanString.includes('starter')) daysToAdd = 90
    
    activatedDate.setDate(activatedDate.getDate() + daysToAdd)
    nextBillingDateStr = activatedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } else if (isTrialActive) {
    const createdDate = new Date(restaurant?.created_at)
    createdDate.setDate(createdDate.getDate() + 7)
    nextBillingDateStr = createdDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Save General Info updates to Supabase
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingGeneral(true)
    setGeneralError('')

    try {
      const { data, error } = await supabase
        .from('restaurant_profiles')
        .update({
          restaurant_name: editName,
          restaurant_phone: editPhone,
          restaurant_email: editEmail,
          restaurant_address: editAddress,
          restaurant_logo: editLogo,
          restaurant_cover: editCover
        })
        .eq('id', profile.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      setIsEditModalOpen(false)
    } catch (err: any) {
      console.error('Error updating restaurant details:', err)
      setGeneralError(err.message || 'Failed to update general settings. Please try again.')
    } finally {
      setSavingGeneral(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        setCropperSrc(reader.result as string)
        setCropperType(type)
        setCropperModalOpen(true)
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  const handleCropComplete = async (croppedFile: File) => {
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', croppedFile)
      
      const uploadedUrl = await uploadRestaurantImage(formData)
      if (!uploadedUrl) throw new Error("Upload failed")
      
      if (cropperType === 'logo') {
        setEditLogo(uploadedUrl)
      } else {
        setEditCover(uploadedUrl)
      }
      
      setCropperModalOpen(false)
      setToastMessage(`${cropperType === 'logo' ? 'Logo' : 'Cover image'} uploaded successfully!`)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Save Hero Banner updates to Supabase
  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingHero(true)
    setHeroError('')

    try {
      const currentLinks = profile?.social_links || {}
      const { data, error } = await supabase
        .from('restaurant_profiles')
        .update({
          social_links: {
            ...currentLinks,
            _hero: {
              tagline: heroTagline,
              description: heroDesc,
              badge1: heroBadge1,
              badge2: heroBadge2
            }
          }
        })
        .eq('id', profile.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      setIsHeroModalOpen(false)
      setToastMessage('Hero banner updated successfully!')
    } catch (err: any) {
      console.error('Error updating hero details:', err)
      setHeroError(err.message || 'Failed to update hero settings.')
    } finally {
      setSavingHero(false)
    }
  }

  // Save Notifications
  const handleToggleNotification = async (key: string, value: boolean) => {
    // Optimistic UI updates
    if (key === 'orderAlerts') setOrderAlerts(value)
    if (key === 'scanAlerts') setScanAlerts(value)
    if (key === 'reservationAlerts') setReservationAlerts(value)
    if (key === 'marketingUpdates') setMarketingUpdates(value)

    const newSettings = {
      orderAlerts: key === 'orderAlerts' ? value : orderAlerts,
      scanAlerts: key === 'scanAlerts' ? value : scanAlerts,
      reservationAlerts: key === 'reservationAlerts' ? value : reservationAlerts,
      marketingUpdates: key === 'marketingUpdates' ? value : marketingUpdates
    }

    try {
      const currentLinks = profile?.social_links || {}
      await supabase
        .from('restaurant_profiles')
        .update({
          social_links: {
            ...currentLinks,
            _notifications: newSettings
          }
        })
        .eq('id', profile.id)
    } catch (e) {
      console.error('Failed to update notifications', e)
    }
  }

  // Logout trigger
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  // Delete Restaurant profile
  const handleDeleteRestaurant = async () => {
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('restaurant_profiles')
        .delete()
        .eq('id', profile.id)

      if (error) throw error

      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (err: any) {
      console.error('Error deleting restaurant:', err)
      alert(err.message || 'Failed to delete restaurant profile.')
    } finally {
      setDeleting(false)
      setIsDeleteModalOpen(false)
    }
  }

  const handleThemeChange = async (newTheme: string) => {
    // Prevent changing the actual visual selection
    if (newTheme !== 'light') {
      setToastMessage('Dark mode will be available soon!')
      setTimeout(() => setToastMessage(''), 3000)
    }
  }

  const handleConnectService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService) return

    setSavingService(true)
    setServiceError('')

    try {
      // Basic URL validation
      if (serviceUrl && !serviceUrl.startsWith('http')) {
        throw new Error('Please enter a valid URL starting with http:// or https://')
      }

      const updatedLinks = { ...socialLinks }
      if (serviceUrl) {
        updatedLinks[selectedService.icon] = serviceUrl
      } else {
        delete updatedLinks[selectedService.icon]
      }

      const { data, error } = await supabase
        .from('restaurant_profiles')
        .update({
          social_links: updatedLinks
        })
        .eq('id', profile.id)
        .select()
        .single()

      if (error) throw error

      setSocialLinks(updatedLinks)
      setProfile(data)
      setToastMessage(`${selectedService.name} ${serviceUrl ? 'connected' : 'disconnected'} successfully!`)
      setSelectedService(null)
    } catch (err: any) {
      console.error('Error updating service:', err)
      setServiceError(err.message || 'Failed to connect service. Please try again.')
    } finally {
      setSavingService(false)
    }
  }

  const handleDisconnectService = async (icon: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSavingService(true)
    try {
      const updatedLinks = { ...socialLinks }
      delete updatedLinks[icon]

      const { data, error } = await supabase
        .from('restaurant_profiles')
        .update({ social_links: updatedLinks })
        .eq('id', profile.id)
        .select()
        .single()

      if (error) throw error

      setSocialLinks(updatedLinks)
      setProfile(data)
      setToastMessage(`${name} disconnected successfully!`)
    } catch (err: any) {
      console.error('Error disconnecting service:', err)
      alert(err.message || 'Failed to disconnect service.')
    } finally {
      setSavingService(false)
    }
  }

  const navItems = [
    { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard', active: false },
    { icon: UtensilsCrossed, label: 'Menu Items', href: '/dashboard/menu', active: false },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics', active: false },
    { icon: Store, label: 'Restaurant Profile', href: '/dashboard/profile', active: false },
    { icon: SettingsIcon, label: 'Settings', href: '/dashboard/settings', active: true },
  ]

  const connectedServices = [
    { name: 'WhatsApp', icon: 'whatsapp', status: socialLinks['whatsapp'] ? 'Connected' : 'Not Connected', url: socialLinks['whatsapp'] || '', placeholder: 'https://wa.me/91XXXXXXXXXX' },
    { name: 'Facebook', icon: 'facebook', status: socialLinks['facebook'] ? 'Connected' : 'Not Connected', url: socialLinks['facebook'] || '', placeholder: 'https://facebook.com/yourrestaurant' },
    { name: 'Instagram', icon: 'instagram', status: socialLinks['instagram'] ? 'Connected' : 'Not Connected', url: socialLinks['instagram'] || '', placeholder: 'https://instagram.com/yourrestaurant' },
    { name: 'Google Maps', icon: 'google', status: socialLinks['google'] ? 'Connected' : 'Not Connected', url: socialLinks['google'] || '', placeholder: 'https://maps.google.com/...' },
  ]

  return (
    <div className="w-full bg-[#FAFAFA] select-none animate-fadeIn">
      {/* Main Content */}
      <div className="w-full">
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Settings</h1>
          <p className="text-gray-500 text-sm">Manage your restaurant preferences and account settings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 text-left">
            {/* General */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:h-[272px]">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">General</h3>
                    <p className="text-sm text-gray-500">Update your restaurant information.</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setEditName(profile?.restaurant_name || '')
                    setEditPhone(profile?.restaurant_phone || '')
                    setEditEmail(profile?.restaurant_email || '')
                    setEditAddress(profile?.restaurant_address || '')
                    setIsEditModalOpen(true)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-sm text-gray-600 w-32 shrink-0">Restaurant Name</span>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {profile?.restaurant_name || 'Bella Italia'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-sm text-gray-600 w-32 shrink-0">Contact Number</span>
                  <span className="text-sm font-medium text-gray-900">
                    {profile?.restaurant_phone || '+91 98765 43210'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-sm text-gray-600 w-32 shrink-0">Email Address</span>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {profile?.restaurant_email || 'hello@bellaitalia.com'}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-600 w-32 shrink-0">Restaurant Address</span>
                  <span className="text-sm font-medium text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {profile?.restaurant_address || '248, MG Road, Nashik,\nMaharashtra - 422001'}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Hero Banner */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Palette className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Hero Banner</h3>
                    <p className="text-sm text-gray-500">Customize the top banner of your menu.</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    if (!hasAccessTo('hero_banner')) {
                      e.preventDefault()
                      triggerUpgrade('Hero Banner Edit', 'hero_banner')
                    } else {
                      setIsHeroModalOpen(true)
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 ${!hasAccessTo('hero_banner') ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'} transition-colors`}
                >
                  {!hasAccessTo('hero_banner') ? <Lock className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                  Edit
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-32 shrink-0">Tagline</span>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {profile?.social_links?._hero?.tagline || 'AUTHENTIC ITALIAN CUISINE'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-32 shrink-0">Description</span>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {profile?.social_links?._hero?.description || profile?.restaurant_description || 'This is a restaurant where pure hands meet pure soul ❤️'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-32 shrink-0">Badge 1</span>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {profile?.social_links?._hero?.badge1 || '100% Vegetarian Options'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-32 shrink-0">Badge 2</span>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {profile?.social_links?._hero?.badge2 || 'Organic Ingredients'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:h-[322px]">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <BellRing className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-500">Choose what you want to be notified about.</p>
                </div>
              </div>
              <div className="space-y-5">
                {/* Order alerts */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order alerts</p>
                      <p className="text-xs text-gray-500">Get notified when a new order is placed</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleNotification('orderAlerts', !orderAlerts)}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                      orderAlerts ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        orderAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Scan alerts */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Scan alerts</p>
                      <p className="text-xs text-gray-500">Get notified when someone scans the menu</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleNotification('scanAlerts', !scanAlerts)}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                      scanAlerts ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        scanAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Reservation alerts */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Reservation alerts</p>
                      <p className="text-xs text-gray-500">Get notified for new reservations</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      if (!hasAccessTo('alerts_reservation')) {
                        e.preventDefault()
                        triggerUpgrade('Reservation Alerts', 'alerts_reservation')
                      } else {
                        handleToggleNotification('reservationAlerts', !reservationAlerts)
                      }
                    }}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      !hasAccessTo('alerts_reservation') ? 'bg-gray-200 cursor-not-allowed opacity-50' : (reservationAlerts ? 'bg-emerald-500 cursor-pointer' : 'bg-gray-200 cursor-pointer')
                    }`}
                  >
                    {!hasAccessTo('alerts_reservation') && <Lock className="absolute top-1 left-3.5 w-3.5 h-3.5 text-gray-400" />}
                    {hasAccessTo('alerts_reservation') && (
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          reservationAlerts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    )}
                  </button>
                </div>

                {/* Marketing updates */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Marketing updates</p>
                      <p className="text-xs text-gray-500">Tips, features and offers from Safardine</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleNotification('marketingUpdates', !marketingUpdates)}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                      marketingUpdates ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        marketingUpdates ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* QR & Menu Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:h-[272px]">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">QR & Menu Settings</h3>
                  <p className="text-sm text-gray-500">Manage how your menu and QR work.</p>
                </div>
              </div>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Menu Visibility</p>
                    <p className="text-xs text-gray-500">Choose who can view your menu</p>
                  </div>
                  <div className="relative shrink-0">
                    <select
                      value={menuVisibility}
                      onChange={e => setMenuVisibility(e.target.value)}
                      className="appearance-none bg-white border border-gray-200 rounded-lg px-3.5 py-2 pr-9 text-sm text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer min-w-[120px]"
                    >
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">QR Style</p>
                    <p className="text-xs text-gray-500">Select QR code style for your menu</p>
                  </div>
                  <div className="relative shrink-0">
                    <select
                      value={qrStyle}
                      onChange={e => setQrStyle(e.target.value)}
                      className="appearance-none bg-white border border-gray-200 rounded-lg px-3.5 py-2 pr-9 text-sm text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer min-w-[120px]"
                    >
                      <option value="Minimal">Minimal</option>
                      <option value="Detailed">Detailed</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Auto generate QR</p>
                    <p className="text-xs text-gray-500">Automatically generate new QR if menu is updated</p>
                  </div>
                  <button
                    onClick={(e) => {
                      if (!hasAccessTo('qr_auto_generate')) {
                        e.preventDefault()
                        triggerUpgrade('Auto Generate QR', 'qr_auto_generate')
                      } else {
                        setAutoGenQr(!autoGenQr)
                      }
                    }}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      !hasAccessTo('qr_auto_generate') ? 'bg-gray-200 cursor-not-allowed opacity-50' : (autoGenQr ? 'bg-emerald-500 cursor-pointer' : 'bg-gray-200 cursor-pointer')
                    }`}
                  >
                    {!hasAccessTo('qr_auto_generate') && <Lock className="absolute top-1 left-3.5 w-3.5 h-3.5 text-gray-400" />}
                    {hasAccessTo('qr_auto_generate') && (
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          autoGenQr ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 text-left">
            {/* Theme */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:h-[272px]">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Palette className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Theme</h3>
                  <p className="text-sm text-gray-500">Choose your preferred theme.</p>
                </div>
              </div>
              <div className="space-y-4">
                {/* Light */}
                <div 
                  onClick={() => !savingTheme && handleThemeChange('light')}
                  className={`flex items-start gap-3 cursor-pointer group ${savingTheme ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="mt-0.5">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        theme === 'light'
                          ? 'border-emerald-500'
                          : 'border-gray-300 group-hover:border-gray-400'
                      }`}
                    >
                      {theme === 'light' && (
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 leading-tight">Light</p>
                    <p className="text-xs text-gray-500 mt-0.5">Always use light theme</p>
                  </div>
                </div>

                {/* Dark */}
                <div 
                  onClick={() => !savingTheme && handleThemeChange('dark')}
                  className={`flex items-start gap-3 cursor-pointer group ${savingTheme ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="mt-0.5">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        theme === 'dark'
                          ? 'border-emerald-500'
                          : 'border-gray-300 group-hover:border-gray-400'
                      }`}
                    >
                      {theme === 'dark' && (
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 leading-tight">Dark</p>
                    <p className="text-xs text-gray-500 mt-0.5">Always use dark theme</p>
                  </div>
                </div>

                {/* Auto */}
                <div 
                  onClick={() => !savingTheme && handleThemeChange('auto')}
                  className={`flex items-start gap-3 cursor-pointer group ${savingTheme ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="mt-0.5">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        theme === 'auto'
                          ? 'border-emerald-500'
                          : 'border-gray-300 group-hover:border-gray-400'
                      }`}
                    >
                      {theme === 'auto' && (
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 leading-tight">Auto</p>
                    <p className="text-xs text-gray-500 mt-0.5">Use theme based on system</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Connected Services */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:h-[322px]">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Connected Services</h3>
                  <p className="text-sm text-gray-500">Manage your connected platforms.</p>
                </div>
              </div>
              <div className="space-y-2 mt-[-8px]">
                {connectedServices.map(service => {
                  let featureKey = ''
                  if (service.icon === 'google') featureKey = 'connect_google_maps'
                  else if (service.icon === 'whatsapp') featureKey = 'connect_whatsapp'
                  else if (service.icon === 'facebook') featureKey = 'connect_facebook'
                  else if (service.icon === 'instagram') featureKey = 'connect_instagram'
                  
                  const isLocked = featureKey && !hasAccessTo(featureKey)
                  
                  return (
                  <div 
                    key={service.name} 
                    onClick={(e) => {
                      if (isLocked) {
                        e.preventDefault()
                        triggerUpgrade(`Connect ${service.name}`, featureKey)
                      } else {
                        setSelectedService({ name: service.name, icon: service.icon, currentUrl: service.url })
                        setServiceUrl(service.url)
                      }
                    }}
                    className={`flex items-center justify-between p-2 border border-transparent hover:border-gray-100 hover:bg-gray-50 rounded-xl transition-colors -mx-2 ${isLocked ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:border-transparent' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-3">
                      {service.icon === 'whatsapp' && (
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                          <span className="text-green-600 text-xs font-bold">W</span>
                        </div>
                      )}
                      {service.icon === 'facebook' && (
                        <div className="w-8 h-8 bg-[#1877F2]/10 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                          <span className="text-[#1877F2] text-xs font-bold">F</span>
                        </div>
                      )}
                      {service.icon === 'instagram' && (
                        <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                          <span className="text-pink-600 text-xs font-bold">I</span>
                        </div>
                      )}
                      {service.icon === 'google' && (
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                          <span className="text-red-600 text-xs font-bold">G</span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold select-none ${
                        service.status === 'Connected' 
                          ? 'text-emerald-600 bg-emerald-50' 
                          : 'text-gray-500 bg-gray-100'
                      }`}>
                        {service.status}
                      </span>
                      {isLocked ? (
                        <Lock className="w-4 h-4 text-gray-400 ml-1" />
                      ) : service.status === 'Connected' ? (
                        <button
                          onClick={(e) => handleDisconnectService(service.icon, service.name, e)}
                          className="ml-1 p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Disconnect"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                )})}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Danger Zone</h3>
                  <p className="text-sm text-gray-500">Irreversible and sensitive actions.</p>
                </div>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full flex items-center justify-between p-3 border border-red-200 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-red-600">Delete Restaurant</p>
                    <p className="text-xs text-gray-500 mt-0.5">Permanently delete your restaurant and all data</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-400" />
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-red-600">Logout</p>
                    <p className="text-xs text-gray-500 mt-0.5">Sign out from your Safardine account</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Billing & Subscription */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:h-[272px] flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Billing & Subscription</h3>
                    <p className="text-sm text-gray-500">Manage your active plan.</p>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.href = '/dashboard/billing'}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Manage
                </button>
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      {isSubscribed 
                        ? (restaurant?.subscription_plan?.includes('pro') ? 'Business Pro' 
                          : restaurant?.subscription_plan?.includes('growth') ? 'Growth Plan'
                          : restaurant?.subscription_plan?.includes('starter') ? 'Starter Plan'
                          : 'Basic Plan')
                        : isTrialActive ? 'Free Trial' : 'No Active Plan'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {isSubscribed 
                        ? (restaurant?.subscription_plan?.includes('pro') ? '₹8,999 / year' 
                          : restaurant?.subscription_plan?.includes('growth') ? '₹4,999 / 6 months'
                          : restaurant?.subscription_plan?.includes('starter') ? '₹2,999 / 3 months'
                          : '₹1,499 / month')
                        : isTrialActive ? '₹0' : '—'}
                    </span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    isSubscribed ? 'bg-emerald-100 text-emerald-700' 
                    : isTrialActive ? 'bg-orange-100 text-orange-700' 
                    : 'bg-red-100 text-red-700'
                  }`}>
                    {isSubscribed ? 'Active' : isTrialActive ? 'Trial' : 'Expired'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">Next Billing Date</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {nextBillingDateStr}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">Payment Method</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">•••• 4242</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-24 md:bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg font-medium text-sm z-50 animate-fadeIn flex items-center gap-2">
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
          {toastMessage}
        </div>
      )}

      {/* CONNECT SERVICE MODAL */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => {
              if (!savingService) setSelectedService(null)
            }}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm" 
          />

          <div className="relative bg-white border border-[#EEEEEE] rounded-[24px] p-6 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-10 flex flex-col text-left animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F1F1] mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedService.icon === 'whatsapp' ? 'bg-green-100 text-green-600' :
                  selectedService.icon === 'facebook' ? 'bg-[#1877F2]/10 text-[#1877F2]' :
                  selectedService.icon === 'instagram' ? 'bg-pink-100 text-pink-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-[#111827]">Connect {selectedService.name}</h3>
                  <p className="text-[12px] text-gray-500 font-medium">Link your {selectedService.name} profile</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedService(null)}
                disabled={savingService}
                className="text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {serviceError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-[12px] font-semibold">
                {serviceError}
              </div>
            )}

            <form onSubmit={handleConnectService} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Profile Link</label>
                <input 
                  type="url" 
                  value={serviceUrl}
                  onChange={(e) => setServiceUrl(e.target.value)}
                  required
                  placeholder={connectedServices.find(s => s.icon === selectedService.icon)?.placeholder}
                  disabled={savingService}
                  className="bg-white border border-gray-200 rounded-[8px] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50"
                />
                <p className="text-[11px] text-gray-500 mt-1">Make sure the link starts with https://</p>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#EEEEEE]">
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  disabled={savingService}
                  className="px-4 py-2 text-[13px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingService}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-bold rounded-[8px] shadow-md shadow-emerald-500/10 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingService ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT HERO BANNER MODAL */}
      {isHeroModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => {
              if (!savingHero) setIsHeroModalOpen(false)
            }}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm" 
          />

          <div className="relative bg-white border border-[#EEEEEE] rounded-[24px] p-6 w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-10 flex flex-col text-left animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F1F1] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Palette className="w-4.5 h-4.5 text-[#22C55E]" />
                </div>
                <h3 className="text-[18px] font-bold text-[#111827]">Edit Hero Banner</h3>
              </div>
              <button 
                onClick={() => setIsHeroModalOpen(false)}
                disabled={savingHero}
                className="text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {heroError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-[12px] font-semibold">
                {heroError}
              </div>
            )}

            <form onSubmit={handleSaveHero} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Top Tagline</label>
                <input 
                  type="text" 
                  value={heroTagline}
                  onChange={(e) => setHeroTagline(e.target.value)}
                  placeholder="e.g. AUTHENTIC ITALIAN CUISINE"
                  disabled={savingHero}
                  className="bg-white border border-gray-200 rounded-[8px] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Main Description</label>
                <textarea 
                  value={heroDesc}
                  onChange={(e) => setHeroDesc(e.target.value)}
                  placeholder="e.g. This is a restaurant where pure hands meet pure soul ❤️"
                  rows={2}
                  disabled={savingHero}
                  className="bg-white border border-gray-200 rounded-[8px] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Badge 1</label>
                  <input 
                    type="text" 
                    value={heroBadge1}
                    onChange={(e) => setHeroBadge1(e.target.value)}
                    placeholder="e.g. 100% Vegetarian Options"
                    disabled={savingHero}
                    className="bg-white border border-gray-200 rounded-[8px] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Badge 2</label>
                  <input 
                    type="text" 
                    value={heroBadge2}
                    onChange={(e) => setHeroBadge2(e.target.value)}
                    placeholder="e.g. Organic Ingredients"
                    disabled={savingHero}
                    className="bg-white border border-gray-200 rounded-[8px] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#EEEEEE]">
                <button
                  type="button"
                  onClick={() => setIsHeroModalOpen(false)}
                  disabled={savingHero}
                  className="px-4 py-2 text-[13px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingHero}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-bold rounded-[8px] shadow-md shadow-emerald-500/10 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingHero ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT GENERAL DETAILS OVERLAY MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => {
              if (!savingGeneral) setIsEditModalOpen(false)
            }}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm" 
          />

          <div className="relative bg-white border border-[#EEEEEE] rounded-[24px] p-6 w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-10 flex flex-col text-left animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F1F1] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Building2 className="w-4.5 h-4.5 text-[#22C55E]" />
                </div>
                <h3 className="text-[18px] font-bold text-[#111827]">Edit Restaurant Profile</h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                disabled={savingGeneral}
                className="text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {generalError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-[12px] font-semibold">
                {generalError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSaveGeneral} className="flex flex-col gap-4">
              {/* Input: Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Restaurant Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  placeholder="e.g. Bella Italia"
                  disabled={savingGeneral}
                  className="bg-white border border-gray-200 rounded-[8px] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50"
                />
              </div>

              {/* Input: Logo Image */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Logo Image</label>
                <div className="flex items-center gap-3">
                  {editLogo && (
                    <img src={editLogo} alt="Logo" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'logo')}
                    disabled={savingGeneral || isUploadingImage}
                    className="flex-1 text-[13px] text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[13px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer transition-colors"
                  />
                </div>
              </div>

              {/* Input: Cover Image */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Cover Image</label>
                <div className="flex flex-col gap-2">
                  {editCover && (
                    <img src={editCover} alt="Cover" className="w-full h-24 rounded-lg object-cover border border-gray-200" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'cover')}
                    disabled={savingGeneral || isUploadingImage}
                    className="w-full text-[13px] text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[13px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer transition-colors"
                  />
                </div>
              </div>

              {/* Input: Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Contact Number</label>
                <input 
                  type="text" 
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  disabled={savingGeneral}
                  className="bg-white border border-gray-200 rounded-[8px] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50"
                />
              </div>

              {/* Input: Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="e.g. hello@bellaitalia.com"
                  disabled={savingGeneral}
                  className="bg-white border border-gray-200 rounded-[8px] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50"
                />
              </div>

              {/* Input: Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Address</label>
                <textarea 
                  rows={3}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Enter full restaurant address"
                  disabled={savingGeneral}
                  className="bg-white border border-gray-200 rounded-[8px] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none disabled:opacity-50 leading-relaxed"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#EEEEEE]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={savingGeneral}
                  className="px-4 py-2 text-[13px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingGeneral}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-bold rounded-[8px] shadow-md shadow-emerald-500/10 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingGeneral ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE RESTAURANT CONFIRM MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => {
              if (!deleting) setIsDeleteModalOpen(false)
            }}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm" 
          />

          <div className="relative bg-white border border-[#EEEEEE] rounded-[16px] p-6 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-10 flex flex-col text-left animate-scaleUp">
            <div className="flex items-start gap-3.5 mb-4 text-[#EF4444]">
              <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#111827] leading-tight">Delete Restaurant?</h3>
                <p className="text-[12px] text-[#6B7280] mt-1.5 font-normal leading-normal">
                  Are you absolutely sure you want to delete this restaurant profile? All associated menus, QR codes, analytics, and order data will be permanently wiped out. This action is irreversible.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EEEEEE]">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleting}
                className="px-4 py-2 text-[13px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteRestaurant}
                disabled={deleting}
                className="px-5 py-2.5 bg-[#EF4444] hover:bg-[#dc2626] text-white text-[13px] font-bold rounded-[8px] shadow-md shadow-[#EF4444]/10 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Permanently Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* IMAGE CROPPER MODAL */}
      {cropperModalOpen && (
        <ImageCropperModal
          imageSrc={cropperSrc}
          aspectRatio={cropperType === 'logo' ? 1 : 16/9}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropperModalOpen(false)}
          isUploading={isUploadingImage}
        />
      )}

    </div>
  )
}
