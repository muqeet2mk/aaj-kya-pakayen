import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Dish, NewRecipeDiscovery } from '../../types';
import { fetchTryNewRecipe } from '../../services/api';
import { Compass, Plus, Utensils, X, Clock, RefreshCw, Check, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TryNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewRecipe: (dishId: string) => void;
  onOpenAddDish: () => void;
}

export const TryNewModal: React.FC<TryNewModalProps> = ({
  isOpen,
  onClose,
  onViewRecipe,
  onOpenAddDish,
}) => {
  const { library, mealHistory, preferences, addDish, logCompletedMeal, setTodaySelectedMeal, t } = useApp();

  const [activeTab, setActiveTabMode] = useState<'uncooked' | 'new_recipe'>('uncooked');
  const [loading, setLoading] = useState<boolean>(false);
  const [newRecipe, setNewRecipe] = useState<NewRecipeDiscovery | null>(null);
  const [hasAddedToLibrary, setHasAddedToLibrary] = useState<boolean>(false);
  const [currentUncookedIndex, setCurrentUncookedIndex] = useState<number>(0);

  const handleClose = () => {
    setLoading(false);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Find all dishes in library that have NEVER been cooked
  const uncookedDishes = React.useMemo(() => {
    const cookedDishIds = new Set(mealHistory.filter(h => h.isCompleted).map(h => h.dishId));
    return library.filter(d => !cookedDishIds.has(d.id));
  }, [library, mealHistory]);

  const loadAiNewRecipe = async () => {
    setLoading(true);
    setHasAddedToLibrary(false);
    try {
      const res = await fetchTryNewRecipe(library, mealHistory, preferences.language);
      setNewRecipe(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentUncookedIndex(0);
      setHasAddedToLibrary(false);
      loadAiNewRecipe();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentUncookedDish: Dish | undefined = uncookedDishes[currentUncookedIndex % (uncookedDishes.length || 1)];

  const handleNextUncooked = () => {
    if (uncookedDishes.length > 1) {
      setCurrentUncookedIndex(prev => (prev + 1) % uncookedDishes.length);
    }
  };

  const handleCookUncooked = () => {
    if (!currentUncookedDish) return;
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#557A66', '#BD5338', '#D97706'],
    });
    logCompletedMeal(currentUncookedDish.id, 'dinner');
    setTodaySelectedMeal(currentUncookedDish);
    handleClose();
  };

  const handleAddAiRecipeToLibrary = () => {
    if (!newRecipe || hasAddedToLibrary) return;
    addDish({
      name: newRecipe.dishName,
      nameUrdu: newRecipe.dishNameUrdu,
      category: newRecipe.category,
      prepTimeMinutes: newRecipe.prepTimeMinutes,
      ingredients: newRecipe.ingredients,
      recipe: newRecipe.instructions.join('\n'),
      notes: newRecipe.whyItMatches,
      isFavorite: false,
    });
    setHasAddedToLibrary(true);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
    });
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#FAF7F2] border-b border-[#E8E2D9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#557A66]/10 text-[#557A66] flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#231E1B] leading-tight">
                {t.modes.tryNew.heading}
              </h3>
              <p className="text-xs text-[#786F68]">{t.modes.tryNew.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-[#5C534E] hover:text-[#231E1B] hover:bg-[#EAE4DC] active:bg-[#DFD7CD] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-5 py-2.5 bg-[#F4EFEA] border-b border-[#E8E2D9] flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTabMode('uncooked')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'uncooked'
                ? 'bg-white text-[#231E1B] shadow-sm'
                : 'text-[#786F68] hover:text-[#231E1B]'
            }`}
          >
            {t.modes.tryNew.uncookedTab} ({uncookedDishes.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTabMode('new_recipe')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'new_recipe'
                ? 'bg-white text-[#231E1B] shadow-sm'
                : 'text-[#786F68] hover:text-[#231E1B]'
            }`}
          >
            {t.modes.tryNew.newRecipeTab}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'uncooked' ? (
            <div className="space-y-4">
              <p className="text-xs text-[#786F68] leading-relaxed">
                {t.modes.tryNew.uncookedDesc}
              </p>

              {uncookedDishes.length === 0 ? (
                <div className="text-center py-10 px-4 bg-white rounded-2xl border border-[#E8E2D9]">
                  <Check className="w-10 h-10 text-[#557A66] mx-auto mb-2.5" />
                  <h4 className="text-sm font-bold text-[#231E1B]">
                    {library.length === 0 ? 'Your Library is Empty' : 'All Library Dishes Have Been Prepared!'}
                  </h4>
                  <p className="text-xs text-[#786F68] mt-1 max-w-xs mx-auto">
                    {library.length === 0
                      ? 'Add your household dishes to your library to track which ones you have cooked!'
                      : 'You have cooked every dish currently in your library. Add more recipes or explore the New Recipe tab!'}
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        onOpenAddDish();
                      }}
                      className="px-4 py-2 rounded-xl bg-[#BD5338] text-white text-xs font-semibold"
                    >
                      Add Dishes to Library
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 rounded-xl border border-[#DCD5C9] bg-white text-xs font-medium text-[#4A423D]"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : currentUncookedDish ? (
                <div className="rounded-2xl border border-[#E8E2D9] bg-white overflow-hidden shadow-sm">
                  {currentUncookedDish.imageUrl ? (
                    <div className="relative h-44 w-full bg-[#EFEAE2]">
                      <img
                        src={currentUncookedDish.imageUrl}
                        alt={currentUncookedDish.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <span className="text-xs text-white/90">{currentUncookedDish.category}</span>
                        <h4 className="text-lg font-bold">{currentUncookedDish.name}</h4>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-gradient-to-br from-[#FFFDF9] to-[#F7F3EC] border-b border-[#F0EBE3]">
                      <span className="text-xs text-[#786F68]">{currentUncookedDish.category}</span>
                      <h4 className="text-xl font-bold text-[#231E1B]">{currentUncookedDish.name}</h4>
                      {currentUncookedDish.nameUrdu && (
                        <p className="text-sm text-[#786F68] font-urdu mt-0.5">{currentUncookedDish.nameUrdu}</p>
                      )}
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    <p className="text-xs text-[#4A423D] leading-relaxed">
                      {currentUncookedDish.notes ||
                        'This dish is in your cooking repertoire but hasn’t made it into your family meal history yet.'}
                    </p>

                    {currentUncookedDish.ingredients && currentUncookedDish.ingredients.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-[#786F68] uppercase">Ingredients</span>
                        <p className="text-xs text-[#4A423D] mt-0.5">
                          {currentUncookedDish.ingredients.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-[#FAF8F5] border-t border-[#E8E2D9] flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleCookUncooked}
                      className="min-h-[44px] rounded-xl bg-[#BD5338] hover:bg-[#A9452C] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>{t.modes.smartPick.cookThisToday}</span>
                    </button>

                    <div className="flex items-center justify-between pt-1">
                      {uncookedDishes.length > 1 ? (
                        <button
                          type="button"
                          onClick={handleNextUncooked}
                          className="text-xs text-[#4A423D] hover:text-[#BD5338] font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3 text-[#786F68]" />
                          <span>{t.modes.tryNew.exploreAnother}</span>
                        </button>
                      ) : <span />}

                      <button
                        type="button"
                        onClick={handleClose}
                        className="text-xs text-[#786F68] hover:text-[#231E1B] font-medium cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            /* TYPE B: EXPLORE NEW RECIPE */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#FFF8EE] border border-[#FDE6C8] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#8C530A] leading-relaxed">
                  {t.modes.tryNew.newRecipeWarning}
                </p>
              </div>

              {loading ? (
                <div className="text-center py-12 flex flex-col items-center">
                  <RefreshCw className="w-8 h-8 text-[#557A66] animate-spin mb-3" />
                  <p className="text-sm font-semibold text-[#231E1B]">Discovering a recipe matching your family...</p>
                  <p className="text-xs text-[#786F68] mt-1">Analyzing your existing dishes & flavor preferences</p>
                </div>
              ) : newRecipe ? (
                <div className="rounded-2xl border border-[#E8E2D9] bg-white overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-[#F0EBE3] bg-gradient-to-r from-[#FAF8F5] to-white">
                    <div className="flex items-center gap-2 text-xs text-[#786F68] mb-1">
                      <span className="font-semibold text-[#BD5338]">NEW RECIPE</span>
                      <span aria-hidden="true">·</span>
                      <span>{newRecipe.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {newRecipe.prepTimeMinutes} mins
                      </span>
                    </div>

                    <h4 className="text-xl font-bold text-[#231E1B]">{newRecipe.dishName}</h4>
                    {newRecipe.dishNameUrdu && (
                      <p className="text-sm text-[#786F68] font-urdu mt-0.5">{newRecipe.dishNameUrdu}</p>
                    )}

                    <p className="text-xs text-[#557A66] mt-2 font-medium">
                      {newRecipe.whyItMatches}
                    </p>
                  </div>

                  <div className="p-5 space-y-4 text-xs text-[#4A423D]">
                    <div>
                      <span className="font-bold text-[#231E1B] block mb-1">
                        {t.modes.tryNew.ingredients}:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-[#5C534E]">
                        {newRecipe.ingredients.map((ing, i) => (
                          <li key={i}>{ing}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-[#F2EDE5]">
                      <span className="font-bold text-[#231E1B] block mb-1">
                        {t.modes.tryNew.instructions}:
                      </span>
                      <ol className="list-decimal pl-4 space-y-1 text-[#5C534E]">
                        {newRecipe.instructions.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-[#FAF8F5] border-t border-[#E8E2D9] flex flex-col sm:flex-row items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddAiRecipeToLibrary}
                      disabled={hasAddedToLibrary}
                      className={`w-full sm:flex-1 min-h-[44px] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        hasAddedToLibrary
                          ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                          : 'bg-[#557A66] hover:bg-[#466654] text-white shadow-sm'
                      }`}
                    >
                      {hasAddedToLibrary ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{t.modes.tryNew.alreadyAdded}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>{t.modes.tryNew.addToLibrary}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={loadAiNewRecipe}
                      className="w-full sm:w-auto min-h-[44px] px-4 rounded-xl border border-[#DCD5C9] bg-white hover:bg-[#F7F3EC] text-[#4A423D] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#786F68]" />
                      <span>{t.modes.tryNew.exploreAnother}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full sm:w-auto min-h-[44px] px-3 text-xs text-[#786F68] hover:text-[#231E1B] cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
