export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type FoodCategory = 
  | 'Main Course'
  | 'Rice Dishes'
  | 'Curry and Gravy'
  | 'Vegetables'
  | 'Lentils'
  | 'Breakfast'
  | 'Snacks'
  | 'Side Dishes'
  | 'Salads'
  | 'Desserts'
  | 'Drinks'
  | string;

export interface Dish {
  id: string;
  name: string;
  nameUrdu?: string;
  category: FoodCategory;
  recipe?: string;
  ingredients?: string[];
  prepTimeMinutes?: number;
  imageUrl?: string;
  notes?: string;
  isFavorite?: boolean;
  createdAt: string; // ISO date
  updatedAt?: string;
}

export interface MealHistoryEntry {
  id: string;
  dishId: string;
  dishName: string;
  category: FoodCategory;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  notes?: string;
  isCompleted: true; // Separates completed meals from planned
  recordedAt: string; // ISO timestamp
}

export interface PlannedMealEntry {
  id: string;
  dishId: string;
  dishName: string;
  category: FoodCategory;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  notes?: string;
  isCompleted: false; // Separates planned from completed
  scheduledAt: string; // ISO timestamp
}

export interface OccasionMenu {
  id: string;
  occasionType: string;
  guestCount?: number;
  mealType: 'lunch' | 'dinner';
  date: string;
  mainCourse: Dish;
  sideDish?: Dish;
  dessert?: Dish;
  drink?: Dish;
  missingCategories?: string[];
  notes?: string;
}

export interface UserPreferences {
  userName: string;
  age?: number | string;
  favoriteMeal?: string;
  foodsLikedToCook?: string[];
  householdName: string;
  language: 'en' | 'ur';
  avoidRecentDays: number; // e.g. 3 days default
  varietyLevel: 'high' | 'balanced' | 'familiar';
  dietaryPreferences: string[];
  dislikedIngredients: string[];
  allergies: string[];
  isDemoMode: boolean;
  hasCompletedOnboarding: boolean;
  isSignedUp: boolean;
}

export interface SmartPickRecommendation {
  dish: Dish;
  reason: string;
  varietyExplanation: string;
  lastCookedDate: string | null;
  timesCooked: number;
  score?: number;
}

export interface NewRecipeDiscovery {
  dishName: string;
  dishNameUrdu?: string;
  category: FoodCategory;
  whyItMatches: string;
  prepTimeMinutes: number;
  ingredients: string[];
  instructions: string[];
  sourceType: 'uncooked_library' | 'ai_suggested';
  libraryDishId?: string;
  imageUrl?: string;
}

export interface NutritionCategoryStat {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface NutritionReportData {
  timeframe: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  totalMealsRecorded: number;
  uniqueDishesCount: number;
  mostFrequentDishes: Array<{ name: string; count: number }>;
  leastFrequentDishes: Array<{ name: string; count: number }>;
  categoryDistribution: NutritionCategoryStat[];
  repeatedMealsCount: number;
  varietyScorePercent: number;
  proteinRichCount: number;
  vegetableCount: number;
  lentilCount: number;
  riceGrainCount: number;
  observations: string[];
  actionableSuggestions: string[];
}
