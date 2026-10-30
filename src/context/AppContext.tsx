import React, { createContext, useContext, useState, useEffect } from 'react';
import { Dish, MealHistoryEntry, PlannedMealEntry, UserPreferences, MealType } from '../types';
import { DEMO_DISHES, DEMO_MEAL_HISTORY, DEMO_PLANNED_MEALS } from '../data/demoData';
import { translations, Translations, Language } from '../i18n/translations';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface AppContextType {
  library: Dish[];
  mealHistory: MealHistoryEntry[];
  plannedMeals: PlannedMealEntry[];
  preferences: UserPreferences;
  todaySelectedMeal: Dish | null;
  activeTab: 'home' | 'library' | 'calendar' | 'reports' | 'settings';
  language: Language;
  t: Translations;
  toasts: ToastState[];
  setActiveTab: (tab: 'home' | 'library' | 'calendar' | 'reports' | 'settings') => void;
  setLanguage: (lang: Language) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  addDish: (dishData: Omit<Dish, 'id' | 'createdAt'>) => Dish;
  addMultipleDishes: (dishesData: Array<Omit<Dish, 'id' | 'createdAt'>>) => void;
  updateDish: (id: string, updates: Partial<Dish>) => void;
  deleteDish: (id: string) => void;
  toggleFavorite: (id: string) => void;
  logCompletedMeal: (dishId: string, mealType?: MealType, date?: string, notes?: string) => MealHistoryEntry;
  planMeal: (dishId: string, mealType: MealType, date: string, notes?: string) => PlannedMealEntry;
  markPlannedMealAsCompleted: (plannedMealId: string) => void;
  deleteMealHistoryEntry: (id: string) => void;
  deletePlannedMealEntry: (id: string) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetToDemoData: () => void;
  clearAllData: () => void;
  setTodaySelectedMeal: (dish: Dish | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const FRESH_USER_PREFERENCES: UserPreferences = {
  userName: 'Home Cook',
  householdName: 'My Family',
  language: 'en',
  avoidRecentDays: 3,
  varietyLevel: 'balanced',
  dietaryPreferences: ['Family-Friendly'],
  dislikedIngredients: [],
  allergies: [],
  isDemoMode: false,
  hasCompletedOnboarding: true,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check migration version: If user hasn't visited v2, start with empty personal library!
  const [library, setLibrary] = useState<Dish[]>(() => {
    try {
      const isV2 = localStorage.getItem('aaj_kya_pakayen_v2_initialized');
      if (!isV2) {
        // Clear out any old auto-seeded sample data so user starts with their own library
        localStorage.setItem('aaj_kya_pakayen_v2_initialized', 'true');
        localStorage.removeItem('aaj_kya_pakayen_library');
        localStorage.removeItem('aaj_kya_pakayen_history');
        localStorage.removeItem('aaj_kya_pakayen_planned');
        return [];
      }
      const saved = localStorage.getItem('aaj_kya_pakayen_library');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [mealHistory, setMealHistory] = useState<MealHistoryEntry[]>(() => {
    try {
      const isV2 = localStorage.getItem('aaj_kya_pakayen_v2_initialized');
      if (!isV2) return [];
      const saved = localStorage.getItem('aaj_kya_pakayen_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [plannedMeals, setPlannedMeals] = useState<PlannedMealEntry[]>(() => {
    try {
      const isV2 = localStorage.getItem('aaj_kya_pakayen_v2_initialized');
      if (!isV2) return [];
      const saved = localStorage.getItem('aaj_kya_pakayen_planned');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('aaj_kya_pakayen_preferences');
      return saved ? JSON.parse(saved) : FRESH_USER_PREFERENCES;
    } catch {
      return FRESH_USER_PREFERENCES;
    }
  });

  const [todaySelectedMeal, setTodaySelectedMeal] = useState<Dish | null>(() => {
    try {
      const saved = localStorage.getItem('aaj_kya_pakayen_today_meal');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'calendar' | 'reports' | 'settings'>('home');
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aaj_kya_pakayen_library', JSON.stringify(library));
    } catch (e) {
      console.error(e);
    }
  }, [library]);

  useEffect(() => {
    try {
      localStorage.setItem('aaj_kya_pakayen_history', JSON.stringify(mealHistory));
    } catch (e) {
      console.error(e);
    }
  }, [mealHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('aaj_kya_pakayen_planned', JSON.stringify(plannedMeals));
    } catch (e) {
      console.error(e);
    }
  }, [plannedMeals]);

  useEffect(() => {
    try {
      localStorage.setItem('aaj_kya_pakayen_preferences', JSON.stringify(preferences));
    } catch (e) {
      console.error(e);
    }
  }, [preferences]);

  useEffect(() => {
    try {
      if (todaySelectedMeal) {
        localStorage.setItem('aaj_kya_pakayen_today_meal', JSON.stringify(todaySelectedMeal));
      } else {
        localStorage.removeItem('aaj_kya_pakayen_today_meal');
      }
    } catch (e) {
      console.error(e);
    }
  }, [todaySelectedMeal]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  const addDish = (dishData: Omit<Dish, 'id' | 'createdAt'>): Dish => {
    const newDish: Dish = {
      ...dishData,
      id: `dish-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setLibrary(prev => [newDish, ...prev]);
    showToast(
      preferences.language === 'ur' 
        ? `"${newDish.name}" لائبریری میں شامل ہو گئی!`
        : `Added "${newDish.name}" to your cooking library!`,
      'success'
    );
    return newDish;
  };

  const addMultipleDishes = (dishesData: Array<Omit<Dish, 'id' | 'createdAt'>>) => {
    const now = Date.now();
    const newDishes: Dish[] = dishesData.map((d, index) => ({
      ...d,
      id: `dish-${now}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    }));

    setLibrary(prev => [...newDishes, ...prev]);
    showToast(
      preferences.language === 'ur'
        ? `${newDishes.length} ڈشز آپ کی لائبریری میں شامل ہو گئیں!`
        : `Added ${newDishes.length} dishes to your cooking library!`,
      'success'
    );
  };

  const updateDish = (id: string, updates: Partial<Dish>) => {
    setLibrary(prev => prev.map(d => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d)));
    showToast(
      preferences.language === 'ur' ? 'ڈش میں تبدیلی محفوظ ہو گئی!' : 'Dish updated successfully!',
      'success'
    );
  };

  const deleteDish = (id: string) => {
    const target = library.find(d => d.id === id);
    setLibrary(prev => prev.filter(d => d.id !== id));
    if (todaySelectedMeal?.id === id) {
      setTodaySelectedMeal(null);
    }
    showToast(
      preferences.language === 'ur'
        ? `"${target?.name || 'ڈش'}" لائبریری سے ہٹا دی گئی۔`
        : `Removed "${target?.name || 'Dish'}" from library.`,
      'info'
    );
  };

  const toggleFavorite = (id: string) => {
    setLibrary(prev => prev.map(d => (d.id === id ? { ...d, isFavorite: !d.isFavorite } : d)));
  };

  const logCompletedMeal = (
    dishId: string,
    mealType: MealType = 'dinner',
    date: string = new Date().toISOString().split('T')[0],
    notes?: string
  ): MealHistoryEntry => {
    const dish = library.find(d => d.id === dishId);
    const dishName = dish ? dish.name : 'Unknown Dish';
    const category = dish ? dish.category : 'Main Course';

    const newLog: MealHistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dishId,
      dishName,
      category,
      date,
      mealType,
      isCompleted: true,
      notes,
      recordedAt: new Date().toISOString(),
    };

    setMealHistory(prev => [newLog, ...prev]);

    // Also mark today's status if cooked today
    const todayStr = new Date().toISOString().split('T')[0];
    if (date === todayStr && dish) {
      setTodaySelectedMeal(dish);
    }

    showToast(
      preferences.language === 'ur'
        ? `"${dishName}" کو پکا ہوا ریکارڈ کر لیا گیا!`
        : `Logged "${dishName}" as cooked and eaten!`,
      'success'
    );

    return newLog;
  };

  const planMeal = (
    dishId: string,
    mealType: MealType,
    date: string,
    notes?: string
  ): PlannedMealEntry => {
    const dish = library.find(d => d.id === dishId);
    const dishName = dish ? dish.name : 'Planned Meal';
    const category = dish ? dish.category : 'Main Course';

    const newPlan: PlannedMealEntry = {
      id: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dishId,
      dishName,
      category,
      date,
      mealType,
      isCompleted: false,
      notes,
      scheduledAt: new Date().toISOString(),
    };

    setPlannedMeals(prev => [newPlan, ...prev]);

    showToast(
      preferences.language === 'ur'
        ? `"${dishName}" کو ${date} کے لیے پلان کر لیا گیا!`
        : `Scheduled "${dishName}" for ${date}!`,
      'info'
    );

    return newPlan;
  };

  const markPlannedMealAsCompleted = (plannedMealId: string) => {
    const planned = plannedMeals.find(p => p.id === plannedMealId);
    if (!planned) return;

    logCompletedMeal(planned.dishId, planned.mealType, planned.date, planned.notes);
    setPlannedMeals(prev => prev.filter(p => p.id !== plannedMealId));
  };

  const deleteMealHistoryEntry = (id: string) => {
    setMealHistory(prev => prev.filter(h => h.id !== id));
    showToast(
      preferences.language === 'ur' ? 'کھانے کا ریکارڈ ہٹا دیا گیا۔' : 'Meal entry removed.',
      'info'
    );
  };

  const deletePlannedMealEntry = (id: string) => {
    setPlannedMeals(prev => prev.filter(p => p.id !== id));
    showToast(
      preferences.language === 'ur' ? 'پلان کیا گیا کھانا منسوخ ہو گیا۔' : 'Planned meal cancelled.',
      'info'
    );
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const resetToDemoData = () => {
    setLibrary(DEMO_DISHES);
    setMealHistory(DEMO_MEAL_HISTORY);
    setPlannedMeals(DEMO_PLANNED_MEALS);
    setPreferences({
      userName: 'Fatima',
      householdName: 'Ahmed Family',
      language: preferences.language || 'en',
      avoidRecentDays: 3,
      varietyLevel: 'balanced',
      dietaryPreferences: ['Halal', 'Family-Friendly'],
      dislikedIngredients: [],
      allergies: [],
      isDemoMode: true,
      hasCompletedOnboarding: true,
    });
    setTodaySelectedMeal(null);
    showToast('Loaded demo family library and 14 days of meal history.', 'info');
  };

  const clearAllData = () => {
    setLibrary([]);
    setMealHistory([]);
    setPlannedMeals([]);
    setTodaySelectedMeal(null);
    setPreferences(prev => ({
      ...prev,
      isDemoMode: false,
      hasCompletedOnboarding: true,
    }));
    showToast('Your library is now empty. Ready for your own dishes!', 'info');
  };

  const setLanguage = (lang: Language) => {
    updatePreferences({ language: lang });
  };

  const language = preferences.language || 'en';
  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        library,
        mealHistory,
        plannedMeals,
        preferences,
        todaySelectedMeal,
        activeTab,
        language,
        t,
        toasts,
        setActiveTab,
        setLanguage,
        showToast,
        addDish,
        addMultipleDishes,
        updateDish,
        deleteDish,
        toggleFavorite,
        logCompletedMeal,
        planMeal,
        markPlannedMealAsCompleted,
        deleteMealHistoryEntry,
        deletePlannedMealEntry,
        updatePreferences,
        resetToDemoData,
        clearAllData,
        setTodaySelectedMeal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
