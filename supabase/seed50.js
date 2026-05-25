const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://efgizrrfrfarnpifnema.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZ2l6cnJmcmZhcm5waWZuZW1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk5OTEwNSwiZXhwIjoyMDk0NTc1MTA1fQ.W8M38RYfqcaOnfLIp4JjTGCxa24-NRaeTOCjOWlwRAg'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const dishTemplates = [
  // ─── STARTERS (10) ──────────────────────────────────────────────────
  {
    name: "Truffle Parmesan Fries",
    description: "Crispy shoestring fries tossed in white truffle oil, aged parmesan, and fresh parsley. Served with garlic aioli.",
    price: 349,
    category: "Starters",
    tags: ["Vegetarian", "Popular"],
    is_veg: true,
    calories: 420,
    image_url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Bruschetta Al Pomodoro",
    description: "Toasted artisan sourdough topped with vine-ripened tomatoes, fresh garlic, basil, and a drizzle of balsamic glaze.",
    price: 299,
    category: "Starters",
    tags: ["Vegetarian", "Classic"],
    is_veg: true,
    calories: 280,
    image_url: "https://images.unsplash.com/photo-1572656631137-7935297eff55?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Crispy Calamari Rings",
    description: "Tender, hand-battered squid rings fried golden brown. Served with lemon wedges and house-made marinara sauce.",
    price: 499,
    category: "Starters",
    tags: ["Non-Veg", "Seafood"],
    is_veg: false,
    calories: 460,
    image_url: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Stuffed Mushroom Caps",
    description: "Button mushrooms stuffed with creamy ricotta, spinach, and garlic, baked with a golden mozzarella topping.",
    price: 389,
    category: "Starters",
    tags: ["Vegetarian", "Chef Special"],
    is_veg: true,
    calories: 310,
    image_url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Glazed Chicken Wings",
    description: "Juicy wings tossed in your choice of spicy buffalo sauce or honey-garlic glaze, served with blue cheese dip.",
    price: 449,
    category: "Starters",
    tags: ["Non-Veg", "Spicy"],
    is_veg: false,
    calories: 590,
    image_url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Garlic Butter Edamame",
    description: "Steamed edamame pods tossed in a rich garlic butter sauce and sprinkled with flaky sea salt.",
    price: 249,
    category: "Starters",
    tags: ["Vegetarian", "Healthy"],
    is_veg: true,
    calories: 180,
    image_url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Mozzarella Fritta",
    description: "Crispy herb-crusted mozzarella sticks, deep-fried until gooey and served with warm marinara dipping sauce.",
    price: 329,
    category: "Starters",
    tags: ["Vegetarian"],
    is_veg: true,
    calories: 490,
    image_url: "https://images.unsplash.com/photo-1531749668029-2db88e4b76ce?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Sweet Potato Wedges",
    description: "Baked sweet potato wedges seasoned with smoked paprika and sea salt, served with spicy avocado dip.",
    price: 299,
    category: "Starters",
    tags: ["Vegetarian", "Gluten-Free"],
    is_veg: true,
    calories: 320,
    image_url: "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Minestrone Soup",
    description: "Classic Italian vegetable soup with pasta, beans, tomatoes, and fresh herbs, topped with parmesan dust.",
    price: 279,
    category: "Starters",
    tags: ["Vegetarian", "Warm"],
    is_veg: true,
    calories: 190,
    image_url: "https://images.unsplash.com/photo-1547592165-e1d17fed6005?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Dynamite Prawns",
    description: "Crispy batter-fried prawns tossed in a creamy, spicy sriracha mayo dressing, garnished with spring onions.",
    price: 549,
    category: "Starters",
    tags: ["Non-Veg", "Spicy"],
    is_veg: false,
    calories: 520,
    image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80"
  },

  // ─── PIZZA (10) ─────────────────────────────────────────────────────
  {
    name: "Margherita Pizza",
    description: "Wood-fired classic featuring rich San Marzano tomato sauce, fresh buffalo mozzarella, fresh basil, and extra virgin olive oil.",
    price: 399,
    category: "Pizza",
    tags: ["Vegetarian", "Classic", "Bestseller"],
    is_veg: true,
    calories: 820,
    image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Farmhouse Pizza",
    description: "Overloaded with fresh bell peppers, onions, ripe tomatoes, mushrooms, sweet corn, and premium mozzarella cheese.",
    price: 449,
    category: "Pizza",
    tags: ["Vegetarian", "Popular", "Bestseller"],
    is_veg: true,
    calories: 890,
    image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Pepperoni Passion",
    description: "Double portion of spicy pepperoni slices, loaded with mozzarella and zesty tomato base sauce.",
    price: 499,
    category: "Pizza",
    tags: ["Non-Veg", "Bestseller"],
    is_veg: false,
    calories: 1040,
    image_url: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Quattro Formaggi",
    description: "A blend of four premium cheeses: Mozzarella, Gorgonzola, Parmesan, and Ricotta, on a white cream sauce base.",
    price: 489,
    category: "Pizza",
    tags: ["Vegetarian", "Cheese Lover"],
    is_veg: true,
    calories: 980,
    image_url: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Spicy Diavola",
    description: "Tomato sauce, fiery Calabrian salami, red chili flakes, mozzarella, and a drizzle of hot honey sauce.",
    price: 479,
    category: "Pizza",
    tags: ["Non-Veg", "Spicy"],
    is_veg: false,
    calories: 920,
    image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Tandoori Paneer Pizza",
    description: "Marinated cottage cheese cubes, capsicum, red onions, and coriander leaves, spiced with tandoori seasoning.",
    price: 439,
    category: "Pizza",
    tags: ["Vegetarian", "Fusion"],
    is_veg: true,
    calories: 870,
    image_url: "https://images.unsplash.com/photo-1571066811602-71683a3f680d?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "BBQ Chicken Pizza",
    description: "Tender grilled chicken pieces tossed in smoky barbecue sauce, red onions, cilantro, and sharp cheddar-mozzarella blend.",
    price: 489,
    category: "Pizza",
    tags: ["Non-Veg", "Popular"],
    is_veg: false,
    calories: 950,
    image_url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Truffle Mushroom Pizza",
    description: "Sautéed wild mushrooms, caramelized onions, mozzarella, fresh arugula, and premium white truffle oil drizzle.",
    price: 529,
    category: "Pizza",
    tags: ["Vegetarian", "Chef Special"],
    is_veg: true,
    calories: 890,
    image_url: "https://images.unsplash.com/photo-1604917621956-10dfa7cce2e7?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Garden Delight Pizza",
    description: "Sautéed spinach, broccoli, black olives, cherry tomatoes, and vegan feta cheese on an organic wheat crust.",
    price: 429,
    category: "Pizza",
    tags: ["Vegetarian", "Healthy"],
    is_veg: true,
    calories: 740,
    image_url: "https://images.unsplash.com/photo-1528137871230-7010494f0296?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Prosciutto & Arugula",
    description: "Thin-crust pizza topped with prosciutto di Parma, wild baby arugula, and shaved parmesan after baking.",
    price: 549,
    category: "Pizza",
    tags: ["Non-Veg", "Premium"],
    is_veg: false,
    calories: 880,
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80"
  },

  // ─── PASTA (10) ─────────────────────────────────────────────────────
  {
    name: "Pasta Alfredo",
    description: "Fettuccine pasta tossed in a rich, velvety cream sauce made with fresh cream, real butter, and aged Parmesan cheese.",
    price: 369,
    category: "Pasta",
    tags: ["Vegetarian", "Classic", "Chef Special"],
    is_veg: true,
    calories: 680,
    image_url: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Spaghetti Bolognese",
    description: "Al dente spaghetti topped with a slow-simmered, rich beef ragù sauce, garnished with fresh basil and parmesan.",
    price: 449,
    category: "Pasta",
    tags: ["Non-Veg", "Classic"],
    is_veg: false,
    calories: 720,
    image_url: "https://images.unsplash.com/photo-1563379971899-660589a01cd3?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Penne Arrabbiata",
    description: "Penne tossed in a fiery, spicy tomato sauce infused with garlic, red chili flakes, and extra virgin olive oil.",
    price: 329,
    category: "Pasta",
    tags: ["Vegetarian", "Spicy"],
    is_veg: true,
    calories: 540,
    image_url: "https://images.unsplash.com/photo-1598866594230-a1a1910d3ae7?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Creamy Pesto Penne",
    description: "Penne pasta coated in fresh basil pesto blended with cream, pine nuts, garlic, and freshly grated parmesan.",
    price: 389,
    category: "Pasta",
    tags: ["Vegetarian", "Popular"],
    is_veg: true,
    calories: 610,
    image_url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Seafood Linguine",
    description: "Linguine tossed with plump prawns, mussels, calamari, garlic, white wine, and cherry tomatoes in fresh herbs.",
    price: 599,
    category: "Pasta",
    tags: ["Non-Veg", "Seafood", "Premium"],
    is_veg: false,
    calories: 650,
    image_url: "https://images.unsplash.com/photo-1563379971899-660589a01cd3?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Classic Lasagna",
    description: "Layered lasagna sheets filled with minced meat, cheese sauce, mozzarella, and fresh herbs, baked until golden.",
    price: 499,
    category: "Pasta",
    tags: ["Non-Veg", "Hearty"],
    is_veg: false,
    calories: 840,
    image_url: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Truffle Mac & Cheese",
    description: "Elbow macaroni baked in a five-cheese sauce, topped with toasted herb breadcrumbs and a drizzle of truffle oil.",
    price: 429,
    category: "Pasta",
    tags: ["Vegetarian"],
    is_veg: true,
    calories: 780,
    image_url: "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Spinach & Ricotta Ravioli",
    description: "Handmade ravioli filled with fresh spinach and creamy ricotta, served in a rich tomato cream blush sauce.",
    price: 469,
    category: "Pasta",
    tags: ["Vegetarian", "Chef Special"],
    is_veg: true,
    calories: 590,
    image_url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Spaghetti Carbonara",
    description: "Authentic recipe with crispy pancetta, egg yolk sauce, pecorino romano, and lots of freshly ground black pepper.",
    price: 459,
    category: "Pasta",
    tags: ["Non-Veg", "Classic"],
    is_veg: false,
    calories: 740,
    image_url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Lobster Ravioli",
    description: "Delicate lobster-stuffed ravioli in a creamy saffron butter sauce, garnished with fresh chives.",
    price: 649,
    category: "Pasta",
    tags: ["Non-Veg", "Premium", "Chef Special"],
    is_veg: false,
    calories: 670,
    image_url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80"
  },

  // ─── MAIN COURSE (10) ───────────────────────────────────────────────
  {
    name: "Paneer Tikka Masala",
    description: "Char-grilled cottage cheese cubes simmered in a rich, creamy spiced tomato onion gravy, served with basmati rice.",
    price: 449,
    category: "Main Course",
    tags: ["Vegetarian", "Spicy", "Popular"],
    is_veg: true,
    calories: 620,
    image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Truffle Wagyu Burger",
    description: "A premium Wagyu beef patty layered with melted Swiss cheese, fresh wild arugula, and signature white truffle aioli.",
    price: 599,
    category: "Main Course",
    tags: ["Non-Veg", "Bestseller", "Premium"],
    is_veg: false,
    calories: 890,
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Wagyu Ribeye Steak",
    description: "10oz Prime Wagyu Ribeye grilled to perfection, served with rosemary baby potatoes and herb butter.",
    price: 1299,
    category: "Main Course",
    tags: ["Non-Veg", "Premium", "Chef Special"],
    is_veg: false,
    calories: 950,
    image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Butter Chicken",
    description: "Tender boneless chicken roasted in clay oven, cooked in smooth creamy tomato sauce with butter, served with naan.",
    price: 489,
    category: "Main Course",
    tags: ["Non-Veg", "Popular"],
    is_veg: false,
    calories: 780,
    image_url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Miso Glazed Salmon",
    description: "Pan-seared Atlantic salmon coated in a sweet miso glaze, served with baby bok choy and steamed jasmine rice.",
    price: 699,
    category: "Main Course",
    tags: ["Non-Veg", "Seafood", "Healthy"],
    is_veg: false,
    calories: 540,
    image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Katsu Tofu Curry",
    description: "Crispy panko-breaded tofu cutlet over a bed of steamed rice, served with rich, aromatic Japanese curry sauce.",
    price: 399,
    category: "Main Course",
    tags: ["Vegetarian", "Vegan Option"],
    is_veg: true,
    calories: 580,
    image_url: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Grilled Chicken Breast",
    description: "Juicy herb-marinated chicken breast served with grilled vegetables and a light lemon butter reduction.",
    price: 429,
    category: "Main Course",
    tags: ["Non-Veg", "Healthy", "Gluten-Free"],
    is_veg: false,
    calories: 450,
    image_url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Wild Mushroom Risotto",
    description: "Creamy Arborio rice slowly simmered with wild mushrooms, white wine, garlic, and fresh thyme.",
    price: 449,
    category: "Main Course",
    tags: ["Vegetarian", "Gluten-Free"],
    is_veg: true,
    calories: 520,
    image_url: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Lamb Seekh Kebab",
    description: "Minced lamb mixed with onions, mint, cilantro, and warm Indian spices, skewered and grilled in the tandoor.",
    price: 549,
    category: "Main Course",
    tags: ["Non-Veg", "Spicy"],
    is_veg: false,
    calories: 480,
    image_url: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Thai Green Curry",
    description: "Authentic spicy Thai green curry with coconut milk, bamboo shoots, eggplant, and fresh basil, served with rice.",
    price: 399,
    category: "Main Course",
    tags: ["Vegetarian", "Spicy"],
    is_veg: true,
    calories: 490,
    image_url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=600&q=80"
  },

  // ─── DESSERTS & DRINKS (10) ─────────────────────────────────────────
  {
    name: "Chocolate Lava Cake",
    description: "Molten chocolate cake made with premium Belgian chocolate, served with a scoop of vanilla bean gelato.",
    price: 249,
    category: "Desserts",
    tags: ["Vegetarian", "Sweet", "New"],
    is_veg: true,
    calories: 450,
    image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Classic Italian Tiramisu",
    description: "Ladyfingers dipped in strong espresso, layered with whipped mascarpone cheese, cocoa powder, and Kahlúa.",
    price: 279,
    category: "Desserts",
    tags: ["Vegetarian", "Sweet", "Popular"],
    is_veg: true,
    calories: 390,
    image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Mango Passionfruit Cheesecake",
    description: "New York-style cheesecake layered with fresh sweet mango puree and passionfruit seeds on a graham cracker crust.",
    price: 289,
    category: "Desserts",
    tags: ["Vegetarian", "Sweet"],
    is_veg: true,
    calories: 420,
    image_url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Churros Con Chocolate",
    description: "Crispy fried dough pastries coated in cinnamon sugar, served with a warm, thick dark chocolate dipping sauce.",
    price: 229,
    category: "Desserts",
    tags: ["Vegetarian", "Sweet"],
    is_veg: true,
    calories: 480,
    image_url: "https://images.unsplash.com/photo-1589135306089-71515049c9b5?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Cremé Brûlée",
    description: "Rich custard base topped with a texturally contrasting layer of hardened caramelized sugar.",
    price: 259,
    category: "Desserts",
    tags: ["Vegetarian", "Sweet"],
    is_veg: true,
    calories: 310,
    image_url: "https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Classic Mint Mojito",
    description: "Refreshing fizzy drink with muddled fresh mint leaves, lime juice, simple syrup, soda water, and ice.",
    price: 179,
    category: "Drinks",
    tags: ["Vegetarian", "Cold", "New"],
    is_veg: true,
    calories: 120,
    image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Iced Caramel Macchiato",
    description: "Cold espresso beverage featuring strong espresso shots, milk, vanilla syrup, and sweet caramel drizzle.",
    price: 199,
    category: "Drinks",
    tags: ["Vegetarian", "Caffeine"],
    is_veg: true,
    calories: 210,
    image_url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Premium Matcha Latte",
    description: "Premium ceremonial grade Japanese green tea whisked with organic oat milk and agave nectar.",
    price: 219,
    category: "Drinks",
    tags: ["Vegetarian", "Healthy"],
    is_veg: true,
    calories: 140,
    image_url: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Spiced Virgin Mary",
    description: "Savory tomato juice mocktail flavored with celery salt, hot sauce, Worcestershire sauce, and lemon.",
    price: 189,
    category: "Drinks",
    tags: ["Vegetarian", "Cold"],
    is_veg: true,
    calories: 90,
    image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Italian Craft Beer",
    description: "Premium blonde lager with a dry, hoppy aroma and clean finish, imported directly from Italy.",
    price: 299,
    category: "Drinks",
    tags: ["Non-Veg", "Alcoholic"], // classified as non-veg or custom tag
    is_veg: false,
    calories: 180,
    image_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80"
  }
]

async function run() {
  console.log('Fetching active restaurants...')
  const { data: restaurants, error: fetchError } = await supabase.from('restaurant_profiles').select('id, restaurant_name')
  
  if (fetchError) {
    console.error('Error fetching restaurants:', fetchError)
    return
  }

  if (!restaurants || restaurants.length === 0) {
    console.log('No restaurants found in database. Please register a profile first.')
    return
  }

  console.log(`Found ${restaurants.length} restaurants. Seeding 50 menu items for each...`)

  for (const rest of restaurants) {
    console.log(`Seeding for: ${rest.restaurant_name} (${rest.id})`)
    
    // Delete existing menu items first to keep database clean
    const { error: deleteError } = await supabase.from('menu_items').delete().eq('restaurant_id', rest.id)
    if (deleteError) {
      console.error(`Error deleting existing menu items for ${rest.restaurant_name}:`, deleteError)
      continue
    }

    const itemsToInsert = dishTemplates.map(t => ({
      restaurant_id: rest.id,
      name: t.name,
      description: t.description,
      price: t.price,
      category: t.category,
      tags: t.tags,
      calories: t.calories,
      image_url: t.image_url,
      available: true
    }))

    const { error: insertError } = await supabase.from('menu_items').insert(itemsToInsert)
    if (insertError) {
      console.error(`Error inserting menu items for ${rest.restaurant_name}:`, insertError)
    } else {
      console.log(`Successfully seeded 50 dishes for ${rest.restaurant_name}`)
    }
  }

  console.log('Seeding script finished successfully!')
}

run()
