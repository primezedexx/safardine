'use client'

import { MenuClient } from "@/components/menu-client"

export default function DemoMenuPage() {
  const mockRestaurant = {
    id: "demo",
    name: "Safar Dine Cafe",
    logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&h=150&q=80",
    restaurant_category: "Modern Indian Fusion"
  }

  const mockMenuItems = [
    {
      id: "m1",
      name: "Truffle Wagyu Burger",
      price: 24.99,
      description: "Juicy prime Wagyu beef patty, sliced black truffles, melted gruyere cheese, and house-made garlic aioli on a toasted brioche bun. Ultimate luxury.",
      tags: ["Premium", "Chef Special", "Bestseller"],
      available: true,
      category: "Entrées",
      image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&h=200&q=80",
      calories: 850,
      ingredients: ["Wagyu Beef", "Black Truffles", "Gruyere Cheese", "Brioche Bun", "Garlic Aioli"]
    },
    {
      id: "m2",
      name: "Crispy Calamari",
      price: 14.99,
      description: "Tender calamari rings lightly dusted in spiced flour, fried to golden perfection, served with charred lemon and zesty sriracha dipping sauce.",
      tags: ["Popular", "Seafood", "Crispy"],
      available: true,
      category: "Starters",
      image_url: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=300&h=200&q=80",
      calories: 420,
      ingredients: ["Calamari", "Spiced Flour", "Sriracha Aioli", "Lemon"]
    },
    {
      id: "m3",
      name: "Chocolate Lava Soufflé",
      price: 10.99,
      description: "Decadent dark chocolate cake with a molten warm chocolate center, dusted with powdered sugar and served with organic vanilla bean gelato.",
      tags: ["Sweet", "Chocolate", "Indulgence"],
      available: true,
      category: "Desserts",
      image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=300&h=200&q=80",
      calories: 580,
      ingredients: ["Dark Chocolate", "Vanilla Gelato", "Powdered Sugar", "Organic Eggs"]
    },
    {
      id: "m4",
      name: "Saffron Cardamom Tea",
      price: 4.99,
      description: "Aromatic black tea leaves brewed with crushed green cardamom pods, premium Kashmiri saffron threads, and organic whole milk. Rich & warming.",
      tags: ["Desi Special", "Warm", "Traditional"],
      available: true,
      category: "Beverages",
      image_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&h=200&q=80",
      calories: 120,
      ingredients: ["Kashmiri Saffron", "Cardamom", "Whole Milk", "Assam Tea"]
    },
    {
      id: "m5",
      name: "Butter Chicken Pizza",
      price: 18.99,
      description: "Artisanal sourdough crust topped with rich creamy butter chicken gravy, tender tandoori chicken chunks, red onion slivers, and melted fresh mozzarella.",
      tags: ["Fusion", "Spicy", "Comfort Food"],
      available: true,
      category: "Entrées",
      image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&h=200&q=80",
      calories: 920,
      ingredients: ["Sourdough Crust", "Butter Chicken Gravy", "Tandoori Chicken", "Mozzarella", "Red Onion"]
    },
    {
      id: "m6",
      name: "Tandoori Paneer Tikka",
      price: 13.99,
      description: "Artisanal cottage cheese cubes marinated in hung curd and aromatic tandoori spices, flame-grilled with bell peppers and served with mint chutney.",
      tags: ["Vegetarian", "Spicy", "Desi Special"],
      available: true,
      category: "Starters",
      image_url: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=300&h=200&q=80",
      calories: 380,
      ingredients: ["Paneer", "Yogurt", "Bell Peppers", "Mint Chutney"]
    },
    {
      id: "m7",
      name: "Avocado Salmon Toast",
      price: 16.49,
      description: "Toasted multigrain sourdough spread with seasoned smashed avocado, layered with premium smoked salmon, pickled onions, capers, and fresh dill.",
      tags: ["Healthy", "Premium", "Chef Special"],
      available: true,
      category: "Starters",
      image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&h=200&q=80",
      calories: 490,
      ingredients: ["Multigrain Sourdough", "Avocado", "Smoked Salmon", "Capers", "Dill"]
    },
    {
      id: "m8",
      name: "Mango Lassi Panna Cotta",
      price: 9.49,
      description: "Creamy cardamom-infused Italian panna cotta topped with a thick, luscious swirl of fresh Alphonso mango coulis and chopped pistachios.",
      tags: ["Sweet", "Fusion", "Dessert"],
      available: true,
      category: "Desserts",
      image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=300&h=200&q=80",
      calories: 340,
      ingredients: ["Cream", "Alphonso Mango", "Cardamom", "Pistachios"]
    },
    {
      id: "m9",
      name: "Slow-Cooked Rogan Josh",
      price: 26.99,
      description: "Tender chunks of pasture-raised lamb slow-simmered in a rich, authentic gravy of fennel, ginger, Kashmiri chillies, and aromatic Indian spices.",
      tags: ["Traditional", "Spicy", "Chef Special"],
      available: true,
      category: "Entrées",
      image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&h=200&q=80",
      calories: 780,
      ingredients: ["Lamb", "Kashmiri Chillies", "Fennel", "Ginger", "Aromatic Spices"]
    },
    {
      id: "m10",
      name: "Spiced Masala Chai",
      price: 3.99,
      description: "Traditional Indian street-style tea brewed with a robust blend of loose Assam tea leaves, fresh grated ginger, crushed cardamom, and sweet cinnamon.",
      tags: ["Traditional", "Warm", "Beverages"],
      available: true,
      category: "Beverages",
      image_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&h=200&q=80",
      calories: 90,
      ingredients: ["Assam Tea", "Ginger", "Cardamom", "Cinnamon", "Milk"]
    }
  ]

  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* Floating Back to Home button */}
      <div className="absolute top-4 left-4 z-20 hidden md:block">
        <a 
          href="/" 
          className="px-4 py-2 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-lg shadow-slate-950/20"
        >
          ← Exit Demo Menu
        </a>
      </div>
      <MenuClient restaurant={mockRestaurant} menuItems={mockMenuItems} />
    </div>
  )
}
