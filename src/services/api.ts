import { Dish, MealHistoryEntry, SmartPickRecommendation, NewRecipeDiscovery, OccasionMenu, NutritionReportData } from '../types';
import { generateLocalSmartPick, generateLocalOccasionMenu, calculateNutritionReport } from './recommendationEngine';

export async function fetchSmartPickRecommendation(
  library: Dish[],
  history: MealHistoryEntry[],
  avoidRecentDays: number = 3,
  rejectedDishIds: string[] = [],
  language: 'en' | 'ur' = 'en'
): Promise<SmartPickRecommendation> {
  try {
    const res = await fetch('/api/recommendations/smart-pick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        library,
        history,
        avoidRecentDays,
        rejectedDishIds,
        language,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      // Ensure the returned dish exists in library!
      const libraryDish = library.find(d => d.id === data.dish?.id);
      if (libraryDish) {
        return {
          dish: libraryDish,
          reason: data.reason,
          varietyExplanation: data.varietyExplanation,
          lastCookedDate: null,
          timesCooked: 0,
        };
      }
    }
  } catch (err) {
    console.warn('Backend smart pick fetch failed, using local engine:', err);
  }

  // Guaranteed fallback using local recommendation engine
  const localPick = generateLocalSmartPick(library, history, avoidRecentDays, rejectedDishIds);
  if (!localPick) {
    throw new Error('Cooking library is empty');
  }
  return localPick;
}

export async function fetchTryNewRecipe(
  library: Dish[],
  history: MealHistoryEntry[],
  language: 'en' | 'ur' = 'en'
): Promise<NewRecipeDiscovery> {
  try {
    const res = await fetch('/api/recommendations/try-something-new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ library, history, language }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Backend try-something-new fetch failed, using fallback:', err);
  }

  return {
    dishName: 'Mughlai Chicken Handi',
    dishNameUrdu: 'مغلئی چکن ہانڈی',
    category: 'Curry and Gravy',
    whyItMatches: language === 'ur'
      ? 'چونکہ آپ کا خاندان کڑاہی اور بریانی پسند کرتا ہے، اس لیے یہ ریشمی بادامی گریوی والی چکن ہانڈی آپ کے ذوق سے بالکل میل کھاتی ہے۔'
      : 'Matches your family’s love for rich chicken gravies, offering a silky cream-and-nut paste texture that brings royal restaurant flavor to your dining table.',
    prepTimeMinutes: 40,
    ingredients: [
      'Boneless Chicken cubes (500g)',
      'Cashew or Almond paste (3 tbsp)',
      'Fresh Cream (1/4 cup)',
      'Yogurt (1/2 cup)',
      'Ginger-Garlic paste',
      'White Pepper, crushed cumin & dried fenugreek (Kasuri methi)',
      'Desi Ghee or Butter',
    ],
    instructions: [
      'Marinate chicken cubes with yogurt, white pepper, and ginger-garlic paste for 15 minutes.',
      'Melt butter in a handi or heavy pan, saute chopped green chilies, and add the marinated chicken.',
      'Cook on medium heat until chicken releases its juices and browns lightly.',
      'Pour in cashew paste and half a cup of warm water; simmer on low heat for 12 minutes.',
      'Finish with fresh cream, crushed kasuri methi, and julienned ginger. Do not boil vigorously after adding cream.',
      'Serve warm with soft naan or flaky paratha.',
    ],
    sourceType: 'ai_suggested',
  };
}

export async function fetchOccasionMenu(
  library: Dish[],
  occasionType: string,
  guestCount: number = 6,
  mealType: 'lunch' | 'dinner' = 'dinner',
  language: 'en' | 'ur' = 'en'
): Promise<OccasionMenu> {
  try {
    const res = await fetch('/api/recommendations/occasion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ library, occasionType, guestCount, mealType, language }),
    });

    if (res.ok) {
      const data = await res.json();
      // Ensure all dishes are real library objects
      const main = library.find(d => d.id === data.mainCourse?.id) || library[0];
      const side = library.find(d => d.id === data.sideDish?.id);
      const dessert = library.find(d => d.id === data.dessert?.id);
      const drink = library.find(d => d.id === data.drink?.id);

      return {
        ...data,
        mainCourse: main,
        sideDish: side,
        dessert: dessert,
        drink: drink,
      };
    }
  } catch (err) {
    console.warn('Backend occasion fetch failed, using local engine:', err);
  }

  return generateLocalOccasionMenu(library, occasionType, guestCount, mealType);
}

export async function fetchNutritionAiInsights(
  reportData: NutritionReportData,
  language: 'en' | 'ur' = 'en'
): Promise<{ observations: string[]; actionableSuggestions: string[] }> {
  try {
    const res = await fetch('/api/nutrition/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportData, language }),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.observations) && data.observations.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend nutrition insights failed, using calculated data:', err);
  }

  return {
    observations: reportData.observations,
    actionableSuggestions: reportData.actionableSuggestions,
  };
}
