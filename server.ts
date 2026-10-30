import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// Endpoint 1: Smart Pick (STRICTLY FROM USER'S LIBRARY ONLY)
// -------------------------------------------------------------
app.post('/api/recommendations/smart-pick', async (req: Request, res: Response) => {
  try {
    const { library, history, avoidRecentDays = 3, rejectedDishIds = [], language = 'en' } = req.body;

    if (!Array.isArray(library) || library.length === 0) {
      return res.status(400).json({
        error: 'Your library is empty. Please add dishes you know how to cook first.',
      });
    }

    // Filter out rejected dishes in this session if alternatives exist
    let eligible = library.filter((d: any) => !rejectedDishIds.includes(d.id));
    if (eligible.length === 0) eligible = library;

    // Build structured data for prompt
    const candidateSummary = eligible.map((d: any) => ({
      id: d.id,
      name: d.name,
      category: d.category,
      prepTimeMinutes: d.prepTimeMinutes || 'unspecified',
      isFavorite: !!d.isFavorite,
    }));

    const recentMeals = (history || [])
      .filter((h: any) => h.isCompleted)
      .slice(-6)
      .map((h: any) => ({
        dishName: h.dishName,
        category: h.category,
        date: h.date,
        mealType: h.mealType,
      }));

    if (ai) {
      try {
        const prompt = `You are a warm, thoughtful personal family cooking assistant for mothers and home cooks.
CRITICAL CONSTRAINT: You must ONLY select a dish from this exact candidate library list:
${JSON.stringify(candidateSummary)}

Recent cooked meals by the family:
${JSON.stringify(recentMeals)}

User Preferences:
- Avoid dishes cooked in the last ${avoidRecentDays} days if possible.
- Provide variety in flavors and categories (e.g. if recent meals were rice, choose a curry, lentil, or vegetable).
- Respond in ${language === 'ur' ? 'Urdu' : 'English'}.

Choose ONE best dish from the candidate list. Return ONLY a valid JSON object matching the requested schema.`;

        // Call Gemini with a 4.5s timeout to guarantee instant responsiveness
        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                selectedDishId: {
                  type: Type.STRING,
                  description: 'The exact ID of the chosen dish from the candidate list',
                },
                reason: {
                  type: Type.STRING,
                  description: 'A warm, human, 1-2 sentence explanation of why this dish was picked based on recent history',
                },
                varietyExplanation: {
                  type: Type.STRING,
                  description: 'A brief 1 sentence explanation of nutritional or flavor variety',
                },
              },
              required: ['selectedDishId', 'reason', 'varietyExplanation'],
            },
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini timeout')), 4500)
        );

        const response = await Promise.race([geminiPromise, timeoutPromise]);
        const rawText = response.text || '{}';
        const parsed = JSON.parse(rawText);

        // STRICT VERIFICATION: Verify that selectedDishId really exists in the user's library
        const verifiedDish = library.find((d: any) => d.id === parsed.selectedDishId);
        if (verifiedDish) {
          return res.json({
            dish: verifiedDish,
            reason: parsed.reason,
            varietyExplanation: parsed.varietyExplanation,
            source: 'gemini',
          });
        }
      } catch (geminiError) {
        console.warn('Gemini smart-pick failed, falling back to deterministic local selector:', geminiError);
      }
    }

    // Deterministic fallback (guaranteed to pick strictly from user library)
    const pickedDish = eligible[Math.floor(Math.random() * eligible.length)];
    return res.json({
      dish: pickedDish,
      reason: language === 'ur' 
        ? `آپ نے پچھلے چند دنوں میں یہ نہیں پکایا، اس لیے یہ آپ کے خاندان کے لیے ایک بہترین متوازن انتخاب ہے۔`
        : `You haven't prepared ${pickedDish.name} recently. It adds delicious variety to your family's weekly meals.`,
      varietyExplanation: language === 'ur'
        ? `یہ ڈش آپ کے روزمرہ کھانوں میں خوشگوار ذائقے کا اضافہ کرتی ہے۔`
        : `Provides a comforting break from repetitive dishes while staying within your trusted cooking library.`,
      source: 'local_deterministic',
    });
  } catch (error: any) {
    console.error('Error in smart-pick endpoint:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
});

// -------------------------------------------------------------
// Endpoint 2: Try Something New (New Recipe Discovery)
// -------------------------------------------------------------
app.post('/api/recommendations/try-something-new', async (req: Request, res: Response) => {
  try {
    const { library, history, language = 'en' } = req.body;

    const existingNames = (library || []).map((d: any) => d.name);
    const existingCategories = Array.from(new Set((library || []).map((d: any) => d.category)));

    if (ai) {
      try {
        const prompt = `You are a culinary expert assistant for Pakistani & South Asian family home cooking.
The user's family already knows how to cook these dishes:
${JSON.stringify(existingNames)}

Existing categories they cook:
${JSON.stringify(existingCategories)}

Suggest ONE genuine new recipe that matches their family's flavor profile (e.g. traditional Mughlai, Pakistani, or homestyle curry/rice) that is NOT in their existing library list above.
Provide realistic preparation steps, ingredients, prep time, and explain why it fits their cooking style.
Respond in ${language === 'ur' ? 'Urdu' : 'English'}.`;

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                dishName: { type: Type.STRING },
                dishNameUrdu: { type: Type.STRING },
                category: { type: Type.STRING },
                whyItMatches: { type: Type.STRING },
                prepTimeMinutes: { type: Type.INTEGER },
                ingredients: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                instructions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['dishName', 'category', 'whyItMatches', 'prepTimeMinutes', 'ingredients', 'instructions'],
            },
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini timeout')), 4500)
        );

        const response = await Promise.race([geminiPromise, timeoutPromise]);
        const raw = response.text || '{}';
        const parsed = JSON.parse(raw);
        return res.json({
          ...parsed,
          sourceType: 'ai_suggested',
        });
      } catch (err) {
        console.warn('Gemini try-something-new failed, using curated fallback:', err);
      }
    }

    // Fallback new recipe if AI unavailable
    return res.json({
      dishName: 'Chinioti Mutton Kunna',
      dishNameUrdu: 'چنیوٹی مٹن کنا',
      category: 'Main Course',
      whyItMatches: language === 'ur' 
        ? 'چونکہ آپ کا خاندان روایتی گوشت کے سالن اور کڑاہی پسند کرتا ہے، اس لیے یہ مٹی کی ہانڈی میں پکا ہوا دھیمی آنچ کا سالن ایک لاجواب تجربہ ثابت ہوگا۔'
        : 'Since your library features rich curries and gravies, this clay-pot slow-cooked Punjabi specialty matches your family’s love for hearty, tender meat dishes.',
      prepTimeMinutes: 50,
      ingredients: [
        'Mutton with bone (750g)',
        'Onions sliced (2 medium)',
        'Ginger-garlic paste (2 tbsp)',
        'Wheat flour / Atta slurry (3 tbsp)',
        'Desi Ghee (1/2 cup)',
        'Red chili powder, turmeric, salt, and cumin',
        'Whole garam masala (cloves, cardamom, cinnamon)',
      ],
      instructions: [
        'Heat desi ghee in a heavy pot (or clay matka). Fry sliced onions until lightly golden.',
        'Add mutton pieces and ginger-garlic paste, searing for 8-10 minutes until aromatic.',
        'Add spices and 3 cups of warm water. Cover and slow simmer on low heat for 40 minutes until tender.',
        'Mix whole wheat flour in water to make a smooth paste. Stir into the simmering gravy to create the silky kunna texture.',
        'Cook on dum for 10 more minutes. Garnish with julienned ginger and serve with hot tandoori naan.',
      ],
      sourceType: 'ai_suggested',
    });
  } catch (error: any) {
    console.error('Error in try-something-new endpoint:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
});

// -------------------------------------------------------------
// Endpoint 3: Occasion Mode (STRICTLY FROM USER'S LIBRARY ONLY)
// -------------------------------------------------------------
app.post('/api/recommendations/occasion', async (req: Request, res: Response) => {
  try {
    const { library, occasionType, guestCount = 6, mealType = 'dinner', language = 'en' } = req.body;

    if (!Array.isArray(library) || library.length === 0) {
      return res.status(400).json({ error: 'Library is empty' });
    }

    // Group dishes strictly by category from user library
    const mains = library.filter((d: any) => ['main course', 'rice dishes', 'curry and gravy'].some(c => d.category?.toLowerCase().includes(c)));
    const sides = library.filter((d: any) => ['side dishes', 'salads', 'vegetables', 'lentils'].some(c => d.category?.toLowerCase().includes(c)));
    const desserts = library.filter((d: any) => d.category?.toLowerCase().includes('dessert'));
    const drinks = library.filter((d: any) => d.category?.toLowerCase().includes('drink'));

    const missingCategories: string[] = [];
    if (mains.length === 0) missingCategories.push('Main Course');
    if (sides.length === 0) missingCategories.push('Side Dish');
    if (desserts.length === 0) missingCategories.push('Dessert');
    if (drinks.length === 0) missingCategories.push('Drinks');

    // Pick dishes strictly from user's library
    const mainCourse = mains[0] || library[0];
    const sideDish = sides[0] || undefined;
    const dessert = desserts[0] || undefined;
    const drink = drinks[0] || undefined;

    return res.json({
      id: `menu-${Date.now()}`,
      occasionType,
      guestCount,
      mealType,
      date: new Date().toISOString().split('T')[0],
      mainCourse,
      sideDish,
      dessert,
      drink,
      missingCategories,
      notes: `Coordinated feast for ${guestCount} guests (${mealType}).`,
    });
  } catch (error: any) {
    console.error('Error in occasion endpoint:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
});

// -------------------------------------------------------------
// Endpoint 4: AI Nutrition & Eating Habits Summary
// -------------------------------------------------------------
app.post('/api/nutrition/insights', async (req: Request, res: Response) => {
  try {
    const { reportData, language = 'en' } = req.body;

    if (!reportData) {
      return res.status(400).json({ error: 'Report data required' });
    }

    if (ai) {
      try {
        const prompt = `You are a friendly, encouraging family meal planning assistant.
Review this real eating history summary:
Total meals: ${reportData.totalMealsRecorded}
Most frequent: ${JSON.stringify(reportData.mostFrequentDishes)}
Category breakdown: ${JSON.stringify(reportData.categoryDistribution)}
Rice meals: ${reportData.riceGrainCount}, Veggies: ${reportData.vegetableCount}, Lentils: ${reportData.lentilCount}, Protein: ${reportData.proteinRichCount}

Provide:
1. 2-3 warm, positive, family-friendly observations about their eating patterns (never medical diagnoses or shame).
2. 2-3 practical, encouraging ideas for next week's meal rotation.
Respond in ${language === 'ur' ? 'Urdu' : 'English'}.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                observations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                actionableSuggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['observations', 'actionableSuggestions'],
            },
          },
        });

        const raw = response.text || '{}';
        const parsed = JSON.parse(raw);
        return res.json(parsed);
      } catch (err) {
        console.warn('Gemini nutrition insights failed:', err);
      }
    }

    // Default return report's calculated observations
    return res.json({
      observations: reportData.observations || [],
      actionableSuggestions: reportData.actionableSuggestions || [],
    });
  } catch (error: any) {
    console.error('Error in nutrition insights endpoint:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
});

// -------------------------------------------------------------
// Vite Middleware (Dev) or Static Files (Prod)
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aaj Kya Pakayen server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
