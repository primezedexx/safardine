import { createClient } from '@/lib/supabase/server'
import { MenuClient } from '@/components/menu-client'
import { notFound } from 'next/navigation'

export default async function CustomerMenuPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const resolvedParams = await params;
  const restaurantId = resolvedParams.restaurantId;
  const supabase = await createClient()

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(restaurantId);

  const query = supabase.from('restaurant_profiles').select('*');
  if (isUuid) {
    query.eq('id', restaurantId);
  } else {
    query.eq('restaurant_slug', restaurantId);
  }

  const { data: restaurant } = await query.single()

  if (!restaurant) {
    notFound()
  }

  let { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .eq('available', true)

  menuItems = menuItems || []

  // Inject mock data for primezedexx for testing preview right now
  if (restaurant.restaurant_slug === 'prime-zedexx' || restaurantId === 'primezedexx') {
    const mockItems = [
      {
        id: "mz1",
        restaurant_id: restaurant.id,
        name: "Wagyu Ribeye Steak",
        price: 85.00,
        description: "12oz Prime Wagyu Ribeye, perfectly marbled and flame-grilled. Served with garlic herb butter and rosemary roasted potatoes.",
        tags: ["Signature", "Premium", "Gluten-Free"],
        available: true,
        category: "Main Course",
        image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
        calories: 950,
        ingredients: ["Wagyu Beef", "Garlic Butter", "Rosemary", "Potatoes"]
      },
      {
        id: "mz2",
        restaurant_id: restaurant.id,
        name: "Truffle Parmesan Fries",
        price: 14.00,
        description: "Crispy shoestring fries tossed in white truffle oil, aged parmesan, and fresh parsley. Served with roasted garlic aioli.",
        tags: ["Vegetarian", "Popular"],
        available: true,
        category: "Starters",
        image_url: "https://images.unsplash.com/photo-1576107223749-c18ab9345e54?auto=format&fit=crop&w=600&q=80",
        calories: 450,
        ingredients: ["Potatoes", "Truffle Oil", "Parmesan Cheese", "Parsley"]
      },
      {
        id: "mz3",
        restaurant_id: restaurant.id,
        name: "Pan-Seared Scallops",
        price: 32.00,
        description: "Jumbo sea scallops seared to golden perfection, served over a bed of sweet corn purée and crispy pancetta.",
        tags: ["Seafood", "Chef's Choice"],
        available: true,
        category: "Starters",
        image_url: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&w=600&q=80",
        calories: 320,
        ingredients: ["Jumbo Scallops", "Sweet Corn", "Pancetta", "Microgreens"]
      },
      {
        id: "mz4",
        restaurant_id: restaurant.id,
        name: "Lobster Ravioli",
        price: 42.00,
        description: "Handmade ravioli stuffed with fresh Maine lobster and ricotta, finished in a creamy saffron and white wine sauce.",
        tags: ["Pasta", "Premium"],
        available: true,
        category: "Main Course",
        image_url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
        calories: 680,
        ingredients: ["Lobster", "Ricotta", "Saffron", "White Wine", "Heavy Cream"]
      },
      {
        id: "mz5",
        restaurant_id: restaurant.id,
        name: "Classic Caesar Salad",
        price: 16.00,
        description: "Crisp romaine hearts, house-made croutons, shaved Parmigiano-Reggiano, and our signature Caesar dressing.",
        tags: ["Healthy", "Vegetarian"],
        available: true,
        category: "Salads",
        image_url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=600&q=80",
        calories: 350,
        ingredients: ["Romaine Lettuce", "Croutons", "Parmesan", "Caesar Dressing"]
      },
      {
        id: "mz6",
        restaurant_id: restaurant.id,
        name: "Miso Glazed Black Cod",
        price: 48.00,
        description: "Sustainably caught black cod marinated in sweet saikyo miso, broiled to a buttery finish. Served with baby bok choy.",
        tags: ["Seafood", "Healthy"],
        available: true,
        category: "Main Course",
        image_url: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=600&q=80",
        calories: 520,
        ingredients: ["Black Cod", "Miso Paste", "Sake", "Mirin", "Bok Choy"]
      },
      {
        id: "mz7",
        restaurant_id: restaurant.id,
        name: "Artisan Margherita Pizza",
        price: 22.00,
        description: "Wood-fired Neapolitan pizza with San Marzano tomato sauce, fresh buffalo mozzarella, and torn basil leaves.",
        tags: ["Vegetarian", "Classic"],
        available: true,
        category: "Main Course",
        image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
        calories: 800,
        ingredients: ["Pizza Dough", "San Marzano Tomatoes", "Buffalo Mozzarella", "Basil"]
      },
      {
        id: "mz8",
        restaurant_id: restaurant.id,
        name: "Valrhona Chocolate Fondant",
        price: 14.00,
        description: "Warm molten chocolate cake made with 70% dark Valrhona chocolate, paired with Madagascar vanilla bean ice cream.",
        tags: ["Dessert", "Sweet"],
        available: true,
        category: "Desserts",
        image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
        calories: 650,
        ingredients: ["Dark Chocolate", "Butter", "Eggs", "Vanilla Ice Cream"]
      },
      {
        id: "mz9",
        restaurant_id: restaurant.id,
        name: "Smoked Old Fashioned",
        price: 18.00,
        description: "Woodford Reserve bourbon, angostura bitters, Demerara syrup, smoked with cherry wood and garnished with an orange peel.",
        tags: ["Cocktail", "Alcoholic"],
        available: true,
        category: "Drinks",
        image_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80",
        calories: 220,
        ingredients: ["Bourbon", "Bitters", "Demerara Syrup", "Orange Peel"]
      }
    ]

    // Only inject if there aren't already items, or just merge them
    if (menuItems.length === 0) {
       menuItems = mockItems
    } else {
       menuItems = [...menuItems, ...mockItems]
    }
  }

  return <MenuClient restaurant={restaurant} menuItems={menuItems} />
}
