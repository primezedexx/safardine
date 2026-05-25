export type PlanType = 'basic' | 'starter' | 'growth' | 'business_pro';

export const PLAN_FEATURES: Record<PlanType, string[]> = {
  basic: [
    "qr_menu",
    "menu_items_limited",        // max 30 items
    "categories_limited",        // max 3 categories
    "restaurant_branding",
    "dashboard_basic",           // Visitors, Orders, Scans only
    "multi_language",
    "qr_standard",
    "alerts_order",
    "alerts_scan",
  ],

  starter: [
    "qr_menu",
    "menu_items_unlimited",      // Unlimited
    "categories_unlimited",      // Unlimited
    "restaurant_branding",
    "dashboard_basic",
    "multi_language",
    "qr_standard",
    "alerts_order",
    "alerts_scan",
    "dish_tags",                 // Veg/Non-Veg, Chef's Special, Spicy
    "hero_banner",
    "gallery",                   // up to 5 photos
    "bulk_upload",
    "import_excel",
    "analytics_basic",           // Revenue trend, Visitor trend
    "qr_styles",
    "alerts_reservation",
    "connect_google_maps",
    "connect_whatsapp",
    "connect_facebook",
    "connect_instagram",
  ],

  growth: [
    "qr_menu",
    "menu_items_unlimited",
    "categories_unlimited",
    "restaurant_branding",
    "dashboard_basic",
    "multi_language",
    "qr_standard",
    "alerts_order",
    "alerts_scan",
    "dish_tags",
    "hero_banner",
    "gallery",
    "bulk_upload",
    "import_excel",
    "analytics_basic",
    "qr_styles",
    "alerts_reservation",
    "connect_google_maps",
    "analytics_full",            // Peak Hours, Device Usage, Customer Insights
    "connect_whatsapp",
    "connect_facebook",
    "connect_instagram",
    "call_staff_button",
    "feedback_button",
    "qr_auto_generate",
    "performance_snapshot",
    "top_dishes_tracking",
    "priority_email_support",
  ],

  business_pro: [
    "qr_menu",
    "menu_items_unlimited",
    "categories_unlimited",
    "restaurant_branding",
    "dashboard_basic",
    "multi_language",
    "qr_standard",
    "alerts_order",
    "alerts_scan",
    "dish_tags",
    "hero_banner",
    "gallery",
    "bulk_upload",
    "import_excel",
    "analytics_basic",
    "qr_styles",
    "alerts_reservation",
    "connect_google_maps",
    "analytics_full",
    "connect_whatsapp",
    "connect_facebook",
    "connect_instagram",
    "call_staff_button",
    "feedback_button",
    "qr_auto_generate",
    "performance_snapshot",
    "top_dishes_tracking",
    "priority_email_support",
    "white_label",               // Remove "Powered by SafarDine"
    "custom_domain",             // yourmenu.com instead of safardine.com/name
    "dedicated_onboarding",
    "early_access_features",
    "monthly_report_pdf",
    "priority_whatsapp_support",
    "gallery_unlimited",         // Unlimited photos
    "website_development_addon", // ₹3,000 one-time add-on, exclusive
  ],
};

export function hasAccess(userPlan: string, featureKey: string): boolean {
  return true;
}

export function getPlanLimits(userPlan: string) {
  return {
    maxMenuItems: Infinity,
    maxCategories: Infinity,
  };
}

export function getUnlockingPlan(featureKey: string): string {
  if (PLAN_FEATURES.basic.includes(featureKey)) return 'Basic';
  if (PLAN_FEATURES.starter.includes(featureKey)) return 'Starter';
  if (PLAN_FEATURES.growth.includes(featureKey)) return 'Growth';
  if (PLAN_FEATURES.business_pro.includes(featureKey)) return 'Business Pro';
  return 'an upgraded plan';
}
