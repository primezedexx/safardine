import { NextResponse } from 'next/server'
import OpenAI from 'openai'

function isVegetarian(item: any) {
  if (!item.tags) return false;
  return item.tags.some((t: string) => t.toLowerCase() === 'vegetarian' || t.toLowerCase() === 'veg');
}

function isDrink(item: any) {
  if (!item.category) return false;
  const cat = item.category.toLowerCase();
  return cat.includes('drink') || cat.includes('beverage');
}

function isMainCourse(item: any) {
  if (!item.category) return false;
  return item.category.toLowerCase().includes('main course');
}

function getFilteredCandidates(currentItemName: string, allItems: any[]) {
  const currentItem = allItems.find(i => i.name === currentItemName);
  if (!currentItem) return allItems.filter(i => i.name !== currentItemName);

  let candidates = allItems.filter(i => i.id !== currentItem.id);

  if (isVegetarian(currentItem)) {
    candidates = candidates.filter(isVegetarian);
  }

  if (isDrink(currentItem)) {
    candidates = candidates.filter(isDrink);
  }

  if (isMainCourse(currentItem)) {
    candidates = candidates.filter(isMainCourse);
  }

  return candidates;
}

// Fallback logic if OpenAI key is missing or fails
function getFallbackRecommendations(currentItemName: string, allItems: any[]) {
  const candidates = getFilteredCandidates(currentItemName, allItems);
  const shuffled = candidates.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

export async function POST(req: Request) {
  try {
    const { currentItemName, allItems } = await req.json()
    const candidates = getFilteredCandidates(currentItemName, allItems);

    if (candidates.length === 0) {
      return NextResponse.json({ recommendations: [] })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ recommendations: getFallbackRecommendations(currentItemName, allItems) })
    }

    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

      const prompt = `
        You are a smart restaurant recommendation assistant.
        The user is currently viewing the dish: "${currentItemName}".
        Here are the available menu items that match the user's dietary and category preferences:
        ${JSON.stringify(candidates.map((i: any) => ({ id: i.id, name: i.name, category: i.category, tags: i.tags })))}

        Please recommend exactly 3 items from this list that pair well with or complement "${currentItemName}".
        Return the response as a JSON array of the recommended item IDs. Only return the JSON array, no markdown formatting.
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      })

      const responseText = response.choices[0].message.content || '[]'
      let recommendedIds: string[] = []
      
      try {
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
        recommendedIds = JSON.parse(cleaned)
      } catch (e) {
        console.error("Failed to parse OpenAI response", e)
        return NextResponse.json({ recommendations: getFallbackRecommendations(currentItemName, allItems) })
      }

      // Enforce the rules again on OpenAI's output just to be absolutely safe
      const recommendations = candidates.filter((i: any) => recommendedIds.includes(i.id))
      
      if (recommendations.length === 0) {
         return NextResponse.json({ recommendations: getFallbackRecommendations(currentItemName, allItems) })
      }

      return NextResponse.json({ recommendations: recommendations.slice(0, 3) })
    } catch (openaiError) {
      console.error("OpenAI Error (quota exceeded, etc):", openaiError)
      return NextResponse.json({ recommendations: getFallbackRecommendations(currentItemName, allItems) })
    }

  } catch (error) {
    console.error("Recommendation Error:", error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
