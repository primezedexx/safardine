import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BillingClient from './components/BillingClient'

export const dynamic = 'force-dynamic'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: restaurant } = await supabase
    .from('restaurant_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!restaurant) redirect('/restaurant-setup')

  // Calculate trial & subscription status server-side
  let isTrialActive = false
  let trialDaysRemaining = 0
  if (restaurant.created_at) {
    const createdDate = new Date(restaurant.created_at)
    const currentDate = new Date()
    const diffTime = currentDate.getTime() - createdDate.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    if (diffDays <= 7.0) {
      isTrialActive = true
      trialDaysRemaining = Math.max(1, Math.ceil(7.0 - diffDays))
    }
  }

  // Calculate subscription remaining days based on active plan
  const currentPlan = restaurant.subscription_plan || 'basic'
  let planDurationDays = 30
  if (currentPlan.includes('growth')) {
    planDurationDays = 180
  } else if (currentPlan.includes('pro')) {
    planDurationDays = 365
  } else if (currentPlan.includes('starter')) {
    planDurationDays = 90
  } else {
    planDurationDays = 30
  }

  let subscriptionDaysRemaining = 0
  if (restaurant.subscription_active) {
    // Use updated_at as the subscription activation date (it gets updated when subscription_active is set to true)
    const activatedDate = new Date(restaurant.updated_at || restaurant.created_at)
    const currentDate = new Date()
    const diffTime = currentDate.getTime() - activatedDate.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    subscriptionDaysRemaining = Math.max(0, Math.ceil(planDurationDays - diffDays))
  }

  return (
    <BillingClient
      restaurant={restaurant}
      userEmail={user.email || ''}
      isSubscribed={restaurant.subscription_active === true}
      isTrialActive={isTrialActive}
      trialDaysRemaining={trialDaysRemaining}
      subscriptionDaysRemaining={subscriptionDaysRemaining}
      planDurationDays={planDurationDays}
    />
  )
}
