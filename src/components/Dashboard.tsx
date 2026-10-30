import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Dish } from '../types';
import { Sparkles, RotateCcw, Compass, Users, Utensils, CheckCircle2, Clock, CalendarDays, BookOpen, ArrowRight, ShieldAlert, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DashboardProps {
  onOpenSmartPick: () => void;
  onOpenRandomWheel: () => void;
  onOpenTryNew: () => void;
  onOpenOccasion: () => void;
  onOpenAddDish: () => void;
  onOpenQuickStarter?: () => void;
  onOpenRecipeDetail: (dishId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenSmartPick,
  onOpenRandomWheel,
  onOpenTryNew,
  onOpenOccasion,
  onOpenAddDish,
  onOpenQuickStarter,
  onOpenRecipeDetail,
}) => {
  const {
    library,
    mealHistory,
    plannedMeals,
    todaySelectedMeal,
    setTodaySelectedMeal,
    logCompletedMeal,
    preferences,
    setActiveTab,
    t,
  } = useApp();

  // Personalized greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t.dashboard.greetingMorning;
    if (hour < 17) return t.dashboard.greetingAfternoon;
    if (hour < 21) return t.dashboard.greetingEvening;
    return t.dashboard.greetingNight;
  }, [t]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCookedEntry = mealHistory.find(h => h.date === todayStr && h.isCompleted);
  const todayPlannedEntry = plannedMeals.find(p => p.date === todayStr && !p.isCompleted);

  // Recent completed meals (last 4)
  const recentMeals = useMemo(() => {
    return [...mealHistory]
      .filter(h => h.isCompleted)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);
  }, [mealHistory]);

  const handleMarkTodayCooked = () => {
    if (todaySelectedMeal) {
      logCompletedMeal(todaySelectedMeal.id, 'dinner', todayStr);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-7">
      {/* Empty Library Onboarding Hero Card */}
      {library.length === 0 && (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#F5ECE1] border border-[#E8E2D9] shadow-sm space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#BD5338] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Your Kitchen Library</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#231E1B]">
                Your Cooking Library is Empty
              </h2>
              <p className="text-xs sm:text-sm text-[#5C534E] max-w-xl leading-relaxed">
                <strong>Aaj Kya Pakayen?</strong> is designed around the dishes <em>your family actually cooks</em>. The Smart Pick and Random Wheel only ever select from your saved dishes. Add your regular home dishes first to unlock personalized suggestions!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onOpenAddDish}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#BD5338] hover:bg-[#A9452C] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <span>+ Add Your First Dish</span>
              </button>
              {onOpenQuickStarter && (
                <button
                  type="button"
                  onClick={onOpenQuickStarter}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white border border-[#BD5338]/30 hover:border-[#BD5338] text-[#BD5338] text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Browse Common Family Dishes</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Greeting & Status Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#786F68] mb-1">
            <span>{formattedDate}</span>
            <span aria-hidden="true">·</span>
            <span>{preferences.householdName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#231E1B]">
            {greeting}, {preferences.userName}!
          </h1>
          <p className="text-xs sm:text-sm text-[#786F68] mt-1 max-w-lg">
            {t.dashboard.subGreeting}
          </p>
        </div>

        {/* Today's Decision Status Card */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs md:max-w-xs w-full flex items-center justify-between gap-3">
          {todayCookedEntry ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#557A66]/10 text-[#557A66] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-[#557A66] uppercase tracking-wider block">
                  {t.dashboard.alreadyCooked}
                </span>
                <h4 className="text-xs font-bold text-[#231E1B] truncate">{todayCookedEntry.dishName}</h4>
                <p className="text-[10px] text-[#786F68]">{todayCookedEntry.category}</p>
              </div>
            </div>
          ) : todaySelectedMeal ? (
            <div className="flex items-center justify-between w-full gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-[#BD5338] uppercase tracking-wider block">
                  {t.dashboard.todayStatusSelected}
                </span>
                <h4 className="text-xs font-bold text-[#231E1B] truncate">{todaySelectedMeal.name}</h4>
              </div>
              <button
                onClick={handleMarkTodayCooked}
                className="px-2.5 py-1.5 rounded-xl bg-[#BD5338] hover:bg-[#A9452C] text-white text-[11px] font-semibold shrink-0 cursor-pointer shadow-xs"
              >
                {t.dashboard.markAsCooked}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-xs text-[#786F68]">
              <Clock className="w-4 h-4 text-[#BD5338]" />
              <span>{t.dashboard.todayStatusEmpty}</span>
            </div>
          )}
        </div>
      </div>

      {/* Central Section: WHAT SHOULD WE COOK TODAY? (4 Mode Cards) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#231E1B] tracking-tight">
              {t.dashboard.whatToCookTitle}
            </h2>
            <p className="text-xs text-[#786F68]">
              {t.dashboard.whatToCookSubtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Smart Pick */}
          <button
            onClick={onOpenSmartPick}
            className="group relative p-5 rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#F5ECE1] border border-[#E8E2D9] hover:border-[#BD5338] hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between min-h-[190px] cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#BD5338] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#BD5338] uppercase tracking-wider">
                  {t.modes.smartPick.badge}
                </span>
                <h3 className="text-lg font-bold text-[#231E1B] mt-0.5">
                  {t.modes.smartPick.title}
                </h3>
                <p className="text-xs text-[#5C534E] mt-1 line-clamp-2 leading-relaxed">
                  {library.length === 0
                    ? 'Add dishes to your library to unlock personalized smart picks.'
                    : t.modes.smartPick.subtitle}
                </p>
              </div>
            </div>

            <div className="pt-3 flex items-center gap-1 text-xs font-semibold text-[#BD5338]">
              <span>{library.length === 0 ? 'Start with Library' : t.modes.smartPick.action}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: Random Wheel */}
          <button
            onClick={onOpenRandomWheel}
            className="group relative p-5 rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#F7EDE2] border border-[#E8E2D9] hover:border-[#D97706] hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between min-h-[190px] cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#D97706] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#231E1B]">
                  {t.modes.randomWheel.title}
                </h3>
                <p className="text-xs text-[#5C534E] mt-1 line-clamp-2 leading-relaxed">
                  {library.length < 2
                    ? `Wheel spins your library dishes (${library.length} added).`
                    : t.modes.randomWheel.subtitle}
                </p>
              </div>
            </div>

            <div className="pt-3 flex items-center gap-1 text-xs font-semibold text-[#D97706]">
              <span>{library.length < 2 ? 'Add Dishes to Spin' : t.modes.randomWheel.action}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 3: Try Something New */}
          <button
            onClick={onOpenTryNew}
            className="group relative p-5 rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#EBF3ED] border border-[#E8E2D9] hover:border-[#557A66] hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between min-h-[190px] cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#557A66] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#231E1B]">
                  {t.modes.tryNew.title}
                </h3>
                <p className="text-xs text-[#5C534E] mt-1 line-clamp-2 leading-relaxed">
                  {t.modes.tryNew.subtitle}
                </p>
              </div>
            </div>

            <div className="pt-3 flex items-center gap-1 text-xs font-semibold text-[#557A66]">
              <span>{t.modes.tryNew.action}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 4: Occasion Mode */}
          <button
            onClick={onOpenOccasion}
            className="group relative p-5 rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#F2E8E4] border border-[#E8E2D9] hover:border-[#BD5338] hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between min-h-[190px] cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#8A3B24] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#231E1B]">
                  {t.modes.occasion.title}
                </h3>
                <p className="text-xs text-[#5C534E] mt-1 line-clamp-2 leading-relaxed">
                  {t.modes.occasion.subtitle}
                </p>
              </div>
            </div>

            <div className="pt-3 flex items-center gap-1 text-xs font-semibold text-[#8A3B24]">
              <span>{t.modes.occasion.action}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Lower Dashboard: Recently Cooked & Quick Library Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recently Cooked Dishes */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8E2D9] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9]">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#BD5338]" />
              <h3 className="text-sm font-bold text-[#231E1B]">
                {t.dashboard.recentMealsTitle}
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-semibold text-[#BD5338] hover:underline cursor-pointer"
            >
              Full Calendar →
            </button>
          </div>

          {recentMeals.length === 0 ? (
            <div className="text-center py-8 px-4 text-xs text-[#786F68]">
              {t.dashboard.noRecentMeals}
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentMeals.map(meal => (
                <div
                  key={meal.id}
                  className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-between gap-3 hover:bg-[#F5ECE1]/50 transition-colors"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#231E1B] truncate">{meal.dishName}</h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#786F68]">
                      <span className="capitalize">{meal.mealType}</span>
                      <span aria-hidden="true">·</span>
                      <span>{meal.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{meal.date}</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-[#557A66] font-semibold bg-[#E8F5E9] px-2 py-0.5 rounded-lg shrink-0">
                    Cooked ✓
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Library Health & Quick Add */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E8E2D9] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#557A66]" />
              <h3 className="text-sm font-bold text-[#231E1B]">
                {t.dashboard.libraryStatsTitle}
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('library')}
              className="text-xs font-semibold text-[#557A66] hover:underline cursor-pointer"
            >
              Manage →
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#D5E5DC] flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-[#231E1B] font-mono tabular-nums">
                {library.length}
              </span>
              <p className="text-xs text-[#5C534E] mt-0.5">{t.dashboard.totalDishes}</p>
            </div>
            <button
              onClick={onOpenAddDish}
              className="px-3.5 py-2 rounded-xl bg-[#557A66] hover:bg-[#466654] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              + Add Dish
            </button>
          </div>

          {/* Favorites list */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#786F68] uppercase tracking-wider block">
              Family Favorites
            </span>
            {library.length === 0 ? (
              <p className="text-xs text-[#786F68] leading-relaxed">
                Dishes you mark with a heart will show here for instant 1-tap dinner selection.
              </p>
            ) : library.filter(d => d.isFavorite).length === 0 ? (
              <p className="text-xs text-[#786F68] leading-relaxed">
                Click the heart icon on any dish in your library to pin your family favorites here.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {library
                  .filter(d => d.isFavorite)
                  .slice(0, 6)
                  .map(dish => (
                    <button
                      key={dish.id}
                      onClick={() => onOpenRecipeDetail(dish.id)}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9] hover:border-[#BD5338] text-[11px] font-medium text-[#4A423D] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Heart className="w-3 h-3 text-[#BD5338] fill-current" />
                      <span>{dish.name}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
