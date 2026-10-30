import { Dish, MealHistoryEntry, SmartPickRecommendation, OccasionMenu, NutritionReportData, NutritionCategoryStat } from '../types';

/**
 * Calculates days between a past date (YYYY-MM-DD) and today.
 * Returns null if the dish has never been cooked.
 */
export function getDaysSinceLastCooked(dishId: string, history: MealHistoryEntry[]): { daysAgo: number | null; lastDate: string | null; count: number } {
  const dishLogs = history
    .filter(h => h.dishId === dishId && h.isCompleted)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (dishLogs.length === 0) {
    return { daysAgo: null, lastDate: null, count: 0 };
  }

  const mostRecent = dishLogs[0];
  const lastTime = new Date(mostRecent.date).getTime();
  const today = new Date().setHours(0, 0, 0, 0);
  const diffDays = Math.max(0, Math.round((today - lastTime) / (1000 * 60 * 60 * 24)));

  return {
    daysAgo: diffDays,
    lastDate: mostRecent.date,
    count: dishLogs.length,
  };
}

/**
 * Local intelligent recommendation engine that strictly picks from the user's library.
 * Enforces:
 * 1. Strictly in library.
 * 2. Avoids dishes cooked within avoidRecentDays (if possible).
 * 3. Flavor & Category alternation (e.g. avoids rice if recently had rice).
 * 4. Human-readable explainable reasoning.
 */
export function generateLocalSmartPick(
  library: Dish[],
  history: MealHistoryEntry[],
  avoidRecentDays: number = 3,
  rejectedDishIds: string[] = []
): SmartPickRecommendation | null {
  if (library.length === 0) return null;

  // Filter out any explicitly rejected dishes in this session
  let candidates = library.filter(d => !rejectedDishIds.includes(d.id));
  if (candidates.length === 0) {
    // If all were rejected, cycle through all dishes except the very last one
    candidates = library;
  }

  // Look at recent meals in past 7 days to evaluate variety
  const recentMeals = [...history]
    .filter(h => h.isCompleted)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const recentCategories = recentMeals.map(m => m.category);
  const lastCookedCategory = recentCategories[0] || null;

  // Score each candidate
  const scored = candidates.map(dish => {
    const { daysAgo, lastDate, count } = getDaysSinceLastCooked(dish.id, history);
    let score = 50;

    // Recency scoring
    if (daysAgo === null) {
      // Never cooked from library! High novelty reward
      score += 45;
    } else if (daysAgo < avoidRecentDays) {
      // Cooked very recently! Heavy penalty
      score -= 60;
    } else {
      // Reward dishes unmade for a while (up to +35)
      score += Math.min(35, daysAgo * 3);
    }

    // Category variety scoring
    if (lastCookedCategory && dish.category === lastCookedCategory) {
      score -= 25; // discourage same category back-to-back
    } else if (dish.category === 'Vegetables' || dish.category === 'Lentils') {
      // Boost comforting/balanced meals if recent days were meat/rice heavy
      const recentMeatOrRice = recentCategories.filter(c => c === 'Rice Dishes' || c === 'Main Course').length;
      if (recentMeatOrRice >= 2) {
        score += 20;
      }
    }

    // Frequency balancing
    if (count > 6) {
      score -= 10;
    }

    // Favorite perk
    if (dish.isFavorite) {
      score += 12;
    }

    // Slight deterministic randomness to avoid rigid lock-in
    const nameHash = dish.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const daySeed = new Date().getDate();
    score += (nameHash + daySeed) % 15;

    return { dish, score, daysAgo, lastDate, count };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  // Craft natural, human explanation based on actual user data
  let reason = '';
  let varietyExplanation = '';

  if (best.daysAgo === null) {
    reason = `You have this dish in your cooking library, but your family hasn't prepared it yet. It's a great time to bring it to the table!`;
    varietyExplanation = `Introduces a refreshing break from your regularly repeated meals without needing any outside recipe.`;
  } else if (lastCookedCategory && best.dish.category !== lastCookedCategory) {
    reason = `Your last cooked meal was in '${lastCookedCategory}', so '${best.dish.name}' gives your family wonderful variety. You haven't prepared this in ${best.daysAgo} days.`;
    varietyExplanation = `Provides a balanced switch in flavor profile and cooking method.`;
  } else {
    reason = `You haven't cooked ${best.dish.name} in ${best.daysAgo} days. It's a familiar family favorite that fits comfortably into today's cooking.`;
    varietyExplanation = `Balances familiarity with proper spacing so meals don't feel repetitive.`;
  }

  return {
    dish: best.dish,
    reason,
    varietyExplanation,
    lastCookedDate: best.lastDate,
    timesCooked: best.count,
    score: best.score,
  };
}

/**
 * Generates an Occasion 4-course menu strictly from user library categories:
 * 1. Main Course
 * 2. Side Dish
 * 3. Dessert
 * 4. Drink
 */
export function generateLocalOccasionMenu(
  library: Dish[],
  occasionType: string,
  guestCount: number = 6,
  mealType: 'lunch' | 'dinner' = 'dinner',
  customPicks?: { mainId?: string; sideId?: string; dessertId?: string; drinkId?: string }
): OccasionMenu {
  // Helper to categorize dishes
  const getDishesFor = (catMatches: string[]) => 
    library.filter(d => catMatches.some(m => d.category.toLowerCase().includes(m.toLowerCase())));

  const mainCandidates = getDishesFor(['Main Course', 'Rice Dishes', 'Curry and Gravy']);
  const sideCandidates = getDishesFor(['Side Dishes', 'Salads', 'Vegetables', 'Lentils']);
  const dessertCandidates = getDishesFor(['Desserts']);
  const drinkCandidates = getDishesFor(['Drinks']);

  const missingCategories: string[] = [];

  // Pick Main Course
  let mainCourse: Dish;
  if (customPicks?.mainId) {
    mainCourse = library.find(d => d.id === customPicks.mainId) || mainCandidates[0];
  } else {
    // Prefer Biryani or festive dishes if available, else first main
    mainCourse = mainCandidates.find(d => d.name.toLowerCase().includes('biryani') || d.isFavorite) || mainCandidates[0];
  }

  if (!mainCourse) {
    missingCategories.push('Main Course');
    // Fallback to any dish in library if no designated main
    mainCourse = library[0];
  }

  // Pick Side Dish
  let sideDish: Dish | undefined;
  if (customPicks?.sideId) {
    sideDish = library.find(d => d.id === customPicks.sideId);
  } else if (sideCandidates.length > 0) {
    sideDish = sideCandidates.find(d => d.name.toLowerCase().includes('raita') || d.name.toLowerCase().includes('salad')) || sideCandidates[0];
  } else {
    missingCategories.push('Side Dish');
  }

  // Pick Dessert
  let dessert: Dish | undefined;
  if (customPicks?.dessertId) {
    dessert = library.find(d => d.id === customPicks.dessertId);
  } else if (dessertCandidates.length > 0) {
    dessert = dessertCandidates.find(d => d.name.toLowerCase().includes('kheer') || d.isFavorite) || dessertCandidates[0];
  } else {
    missingCategories.push('Dessert');
  }

  // Pick Drink
  let drink: Dish | undefined;
  if (customPicks?.drinkId) {
    drink = library.find(d => d.id === customPicks.drinkId);
  } else if (drinkCandidates.length > 0) {
    drink = drinkCandidates.find(d => d.name.toLowerCase().includes('lemonade') || d.name.toLowerCase().includes('juice')) || drinkCandidates[0];
  } else {
    missingCategories.push('Drinks');
  }

  return {
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
  };
}

/**
 * Computes weekly and monthly nutrition & variety reports from actual completed meals.
 * Honest disclaimer: never invents data, highlights categories and approximate macronutrient presence.
 */
export function calculateNutritionReport(
  library: Dish[],
  history: MealHistoryEntry[],
  timeframe: 'weekly' | 'monthly'
): NutritionReportData {
  const daysLimit = timeframe === 'weekly' ? 7 : 30;
  const now = Date.now();
  const startTime = now - daysLimit * 86400000;

  const relevantMeals = history.filter(h => {
    if (!h.isCompleted) return false;
    const mealTime = new Date(h.date).getTime();
    return mealTime >= startTime && mealTime <= now + 86400000;
  });

  const totalMeals = relevantMeals.length;

  // Counts per dish
  const dishCounts: Record<string, { name: string; count: number; category: string; dishId: string }> = {};
  const categoryCounts: Record<string, number> = {};

  relevantMeals.forEach(meal => {
    if (!dishCounts[meal.dishName]) {
      dishCounts[meal.dishName] = { name: meal.dishName, count: 0, category: meal.category, dishId: meal.dishId };
    }
    dishCounts[meal.dishName].count += 1;

    categoryCounts[meal.category] = (categoryCounts[meal.category] || 0) + 1;
  });

  const sortedDishes = Object.values(dishCounts).sort((a, b) => b.count - a.count);
  const mostFrequentDishes = sortedDishes.slice(0, 4).map(d => ({ name: d.name, count: d.count }));
  const leastFrequentDishes = [...sortedDishes].reverse().slice(0, 3).map(d => ({ name: d.name, count: d.count }));

  // Color mapping for categories
  const catColors: Record<string, string> = {
    'Rice Dishes': '#D97706', // Amber
    'Curry and Gravy': '#DC2626', // Red
    'Main Course': '#B45309', // Terracotta
    'Vegetables': '#16A34A', // Green
    'Lentils': '#EAB308', // Yellow
    'Breakfast': '#F59E0B',
    'Side Dishes': '#059669',
    'Desserts': '#EC4899',
    'Drinks': '#0284C7',
    'Snacks': '#8B5CF6',
  };

  const categoryDistribution: NutritionCategoryStat[] = Object.entries(categoryCounts).map(([cat, count]) => ({
    category: cat,
    count,
    percentage: totalMeals > 0 ? Math.round((count / totalMeals) * 100) : 0,
    color: catColors[cat] || '#64748B',
  }));

  // Repeated meals count (dishes prepared more than once in this window)
  const repeatedMealsCount = sortedDishes.filter(d => d.count > 1).reduce((acc, d) => acc + (d.count - 1), 0);

  // Variety score: unique dishes / total meals
  const uniqueDishesCount = sortedDishes.length;
  const varietyScorePercent = totalMeals > 0 
    ? Math.min(100, Math.round((uniqueDishesCount / totalMeals) * 100))
    : 0;

  // Nutritional pattern estimates from library metadata
  let proteinRichCount = 0;
  let vegetableCount = 0;
  let lentilCount = 0;
  let riceGrainCount = 0;

  relevantMeals.forEach(m => {
    const dish = library.find(d => d.id === m.dishId);
    const cat = (m.category || '').toLowerCase();
    const ingredients = (dish?.ingredients || []).map(i => i.toLowerCase());

    const isMeat = ingredients.some(i => i.includes('chicken') || i.includes('beef') || i.includes('mutton') || i.includes('meat') || i.includes('fish') || i.includes('egg'));
    const isVeg = cat.includes('vegetable') || cat.includes('salad') || ingredients.some(i => i.includes('spinach') || i.includes('okra') || i.includes('gobi') || i.includes('potato') || i.includes('paneer') || i.includes('cucumber'));
    const isLentil = cat.includes('lentil') || ingredients.some(i => i.includes('daal') || i.includes('pulse') || i.includes('moong') || i.includes('masoor') || i.includes('chana'));
    const isRice = cat.includes('rice') || ingredients.some(i => i.includes('rice') || i.includes('basmati') || i.includes('pulao') || i.includes('biryani'));

    if (isMeat || cat.includes('main course')) proteinRichCount++;
    if (isVeg) vegetableCount++;
    if (isLentil) lentilCount++;
    if (isRice) riceGrainCount++;
  });

  // Observations
  const observations: string[] = [];
  const actionableSuggestions: string[] = [];

  if (totalMeals < 3) {
    observations.push('Keep logging your daily family meals to see deeper nutritional trends and recommendations.');
    actionableSuggestions.push('Use the "+ Log Cooked Meal" button in the calendar to record breakfasts, lunches, and dinners.');
  } else {
    if (riceGrainCount >= Math.ceil(totalMeals * 0.45)) {
      observations.push(`Rice-based meals made up ${Math.round((riceGrainCount / totalMeals) * 100)}% of meals in this period.`);
      actionableSuggestions.push('Consider substituting a rice dinner with a flatbread/roti pairing like Daal or Palak Paneer next week.');
    } else {
      observations.push('Good rotational balance between rice and flatbread curries.');
    }

    if (vegetableCount <= Math.max(1, Math.floor(totalMeals * 0.2))) {
      observations.push('Vegetable-centered dishes appeared infrequently compared to meats and grains.');
      actionableSuggestions.push('Try cooking a vibrant vegetable dish from your library, such as Bhindi Masala or Palak, or serving a fresh Kachumber salad.');
    } else {
      observations.push('Healthy vegetable presence recorded throughout the week.');
    }

    if (lentilCount >= 1) {
      observations.push(`Lentils (Daal) were enjoyed ${lentilCount} times, providing wholesome plant protein and gentle fiber.`);
    }

    if (varietyScorePercent >= 75) {
      observations.push('Excellent variety score! Your family is enjoying a diverse rotation of household dishes.');
    } else if (repeatedMealsCount >= 3) {
      actionableSuggestions.push('A few dishes were repeated closely together. Try using the Smart Pick feature to rediscover under-cooked dishes in your library.');
    }
  }

  const startDate = new Date(startTime).toISOString().split('T')[0];
  const endDate = new Date(now).toISOString().split('T')[0];

  return {
    timeframe,
    startDate,
    endDate,
    totalMealsRecorded: totalMeals,
    uniqueDishesCount,
    mostFrequentDishes,
    leastFrequentDishes,
    categoryDistribution,
    repeatedMealsCount,
    varietyScorePercent,
    proteinRichCount,
    vegetableCount,
    lentilCount,
    riceGrainCount,
    observations,
    actionableSuggestions,
  };
}
