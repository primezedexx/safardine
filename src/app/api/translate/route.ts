import { NextResponse } from 'next/server';

async function googleTranslate(text: string, targetLangCode: string) {
  if (!text) return text;
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLangCode}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    return data[0].map((item: any) => item[0]).join('');
  } catch (e) {
    console.error("Google Translate Error:", e);
    return text; // fallback to original
  }
}

export async function POST(req: Request) {
  try {
    const { items, targetLanguage, targetLanguageCode } = await req.json();

    if (!items || !targetLanguage) {
      return NextResponse.json({ error: 'Missing items or targetLanguage' }, { status: 400 });
    }

    // Default to 'hi' or just use the first 2 chars if not provided
    const langCode = targetLanguageCode || 'hi';

    if (langCode === 'en' || targetLanguage.includes('English')) {
       return NextResponse.json({ translatedItems: items });
    }

    const prompt = `Translate the following menu items into ${targetLanguage}. 
You MUST return a valid JSON object with a single key "items", which is an array of the translated objects.
Preserve the exact original 'id', 'category', 'price', and 'image_url'.
Only translate the 'name' and 'description' fields.

CRITICAL RULES FOR TRANSLATION:
1. The translation accuracy MUST be 100% precise.
2. There must be NO spelling mistakes, grammatical errors, or missing spaces.
3. Use natural, premium culinary terminology appropriate for a high-end restaurant.
4. Ensure perfect formatting and punctuation in the target language.

Original items:
${JSON.stringify(items.map((i: any) => ({ 
  id: i.id, 
  name: i.name, 
  description: i.description 
})))}`;

    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("No OpenAI Key");
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: 'You are a professional culinary translator.' }, { role: 'user', content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.3
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.error('OpenAI API Error:', data.error);
        throw new Error(data.error.message || 'Translation failed');
      }

      const resultText = data.choices[0].message.content;
      const parsed = JSON.parse(resultText);

      const translatedItems = items.map((item: any) => {
        const translatedItem = parsed.items.find((i: any) => i.id === item.id);
        if (translatedItem) {
          return {
            ...item,
            name: translatedItem.name,
            description: translatedItem.description
          };
        }
        return item;
      });

      return NextResponse.json({ translatedItems });

    } catch (openaiError) {
      console.error('OpenAI Translation error (quota exceeded, etc):', openaiError);
      
      // FALLBACK TO GOOGLE TRANSLATE (Free, Unauthenticated)
      console.log(`Falling back to Google Translate for ${langCode}`);
      
      const translatedItems = await Promise.all(items.map(async (item: any) => {
        const translatedName = await googleTranslate(item.name, langCode);
        const translatedDesc = await googleTranslate(item.description || '', langCode);
        
        return {
          ...item,
          name: translatedName,
          description: translatedDesc
        };
      }));
      
      return NextResponse.json({ translatedItems });
    }

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
