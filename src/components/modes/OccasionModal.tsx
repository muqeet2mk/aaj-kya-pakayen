import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Dish, OccasionMenu } from '../../types';
import { generateLocalOccasionMenu } from '../../services/recommendationEngine';
import { Users, Wine, RefreshCw, X, Plus, Calendar, AlertCircle, Utensils, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OccasionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddDishForCategory: (cat: string) => void;
  onOpenAddDish: () => void;
}

export const OccasionModal: React.FC<OccasionModalProps> = ({
  isOpen,
  onClose,
  onOpenAddDishForCategory,
  onOpenAddDish,
}) => {
  const { library, planMeal, t, showToast } = useApp();

  const [occasionType, setOccasionType] = useState<string>('Guests visiting');
  const [guestCount, setGuestCount] = useState<number>(8);
  const [mealType, setMealType] = useState<'lunch' | 'dinner'>('dinner');
  const [menu, setMenu] = useState<OccasionMenu | null>(null);

  const occasionOptions = [
    'Guests visiting',
    'Family gathering',
    'Eid celebration',
    'Dinner party',
    'Birthday party',
    'Special Sunday lunch',
  ];

  const handleClose = () => {
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

  const buildMenu = (customPicks?: { mainId?: string; sideId?: string; dessertId?: string; drinkId?: string }) => {
    if (library.length === 0) return;
    const generated = generateLocalOccasionMenu(library, occasionType, guestCount, mealType, customPicks);
    setMenu(generated);
  };

  useEffect(() => {
    if (isOpen) {
      buildMenu();
    }
  }, [isOpen, occasionType, mealType, library]);

  if (!isOpen) return null;

  const handleRegenerateSlot = (slot: 'main' | 'side' | 'dessert' | 'drink') => {
    if (!menu) return;
    const catMatches: Record<string, string[]> = {
      main: ['Main Course', 'Rice Dishes', 'Curry and Gravy'],
      side: ['Side Dishes', 'Salads', 'Vegetables', 'Lentils'],
      dessert: ['Desserts'],
      drink: ['Drinks'],
    };

    const eligible = library.filter(d =>
      catMatches[slot].some(c => d.category.toLowerCase().includes(c.toLowerCase()))
    );

    if (eligible.length <= 1) {
      showToast('No alternative dish found in this library category.', 'info');
      return;
    }

    const currentId =
      slot === 'main'
        ? menu.mainCourse.id
        : slot === 'side'
        ? menu.sideDish?.id
        : slot === 'dessert'
        ? menu.dessert?.id
        : menu.drink?.id;

    const alternatives = eligible.filter(d => d.id !== currentId);
    const nextPick = alternatives[Math.floor(Math.random() * alternatives.length)];

    const updatedPicks = {
      mainId: slot === 'main' ? nextPick.id : menu.mainCourse.id,
      sideId: slot === 'side' ? nextPick.id : menu.sideDish?.id,
      dessertId: slot === 'dessert' ? nextPick.id : menu.dessert?.id,
      drinkId: slot === 'drink' ? nextPick.id : menu.drink?.id,
    };

    buildMenu(updatedPicks);
  };

  const handleSaveAndAddToCalendar = () => {
    if (!menu) return;
    const todayStr = new Date().toISOString().split('T')[0];

    planMeal(
      menu.mainCourse.id,
      menu.mealType,
      todayStr,
      `${occasionType} for ${guestCount} guests (Menu: ${menu.mainCourse.name}${
        menu.sideDish ? ', ' + menu.sideDish.name : ''
      }${menu.dessert ? ', ' + menu.dessert.name : ''})`
    );

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#BD5338', '#557A66', '#D97706'],
    });

    showToast(t.modes.occasion.menuSaved, 'success');
    handleClose();
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
            <div className="w-8 h-8 rounded-xl bg-[#BD5338]/10 text-[#BD5338] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#231E1B] leading-tight">{t.modes.occasion.heading}</h3>
              <p className="text-xs text-[#786F68]">{t.modes.occasion.subtitle}</p>
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

        {/* Empty library state */}
        {library.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#BD5338]/10 text-[#BD5338] flex items-center justify-center mb-3.5">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-[#231E1B] mb-2">
              Your Cooking Library is Empty
            </h4>
            <p className="text-xs text-[#786F68] leading-relaxed max-w-md mb-6">
              Occasion Mode builds a balanced 4-course menu (Main, Side, Dessert, Drink) using only your household recipes. Add dishes to your library first!
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onOpenAddDish();
                }}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-[#BD5338] hover:bg-[#A9452C] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Dishes to Library</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl border border-[#DCD5C9] bg-white text-xs font-semibold text-[#4A423D] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Occasion Controls Toolbar */}
            <div className="px-5 py-2.5 bg-[#F4EFEA] border-b border-[#E8E2D9] flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#5C534E] font-medium">{t.modes.occasion.selectOccasion}:</span>
                <select
                  value={occasionType}
                  onChange={e => setOccasionType(e.target.value)}
                  className="bg-white border border-[#DCD5C9] rounded-lg px-2.5 py-1 text-xs text-[#231E1B]"
                >
                  {occasionOptions.map(o => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#5C534E]">{t.modes.occasion.guestCount}:</span>
                  <select
                    value={guestCount}
                    onChange={e => setGuestCount(Number(e.target.value))}
                    className="bg-white border border-[#DCD5C9] rounded-lg px-2 py-1 text-xs text-[#231E1B]"
                  >
                    {[4, 6, 8, 10, 12, 16, 20].map(n => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center rounded-lg border border-[#DCD5C9] p-0.5 bg-white">
                  <button
                    type="button"
                    onClick={() => setMealType('lunch')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      mealType === 'lunch' ? 'bg-[#BD5338] text-white' : 'text-[#786F68]'
                    }`}
                  >
                    {t.modes.occasion.lunch}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMealType('dinner')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      mealType === 'dinner' ? 'bg-[#BD5338] text-white' : 'text-[#786F68]'
                    }`}
                  >
                    {t.modes.occasion.dinner}
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Required Categories Presentation */}
            <div className="p-6 overflow-y-auto space-y-3">
              {menu ? (
                <>
                  {/* 1. Main Course */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {menu.mainCourse?.imageUrl ? (
                        <img
                          src={menu.mainCourse.imageUrl}
                          alt={menu.mainCourse.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#E8E2D9]"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-[#BD5338]/10 text-[#BD5338] flex items-center justify-center shrink-0">
                          <Utensils className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-[#BD5338] uppercase tracking-wider block">
                          {t.modes.occasion.mainCourse}
                        </span>
                        <h4 className="text-base font-bold text-[#231E1B] truncate">{menu.mainCourse.name}</h4>
                        <p className="text-xs text-[#786F68]">{menu.mainCourse.category}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRegenerateSlot('main')}
                      title="Change main dish"
                      className="px-2.5 py-1.5 rounded-lg border border-[#DCD5C9] bg-white hover:bg-[#F7F3EC] text-xs font-medium text-[#4A423D] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 text-[#786F68]" />
                      <span className="hidden sm:inline">{t.modes.occasion.changeItem}</span>
                    </button>
                  </div>

                  {/* 2. Side Dish */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-[#557A66]/10 text-[#557A66] flex items-center justify-center shrink-0">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-[#557A66] uppercase tracking-wider block">
                          {t.modes.occasion.sideDish}
                        </span>
                        {menu.sideDish ? (
                          <>
                            <h4 className="text-base font-bold text-[#231E1B] truncate">{menu.sideDish.name}</h4>
                            <p className="text-xs text-[#786F68]">{menu.sideDish.category}</p>
                          </>
                        ) : (
                          <p className="text-xs text-[#BD5338] font-medium">{t.modes.occasion.emptyCategoryNotice}</p>
                        )}
                      </div>
                    </div>

                    {menu.sideDish ? (
                      <button
                        type="button"
                        onClick={() => handleRegenerateSlot('side')}
                        className="px-2.5 py-1.5 rounded-lg border border-[#DCD5C9] bg-white hover:bg-[#F7F3EC] text-xs font-medium text-[#4A423D] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 text-[#786F68]" />
                        <span className="hidden sm:inline">{t.modes.occasion.changeItem}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          handleClose();
                          onOpenAddDishForCategory('Side Dishes');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[#557A66] text-white text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{t.modes.occasion.addCategoryDish}</span>
                      </button>
                    )}
                  </div>

                  {/* 3. Dessert */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {menu.dessert?.imageUrl ? (
                        <img
                          src={menu.dessert.imageUrl}
                          alt={menu.dessert.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#E8E2D9]"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-[#D97706]/10 text-[#D97706] flex items-center justify-center shrink-0">
                          <Sparkles className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-wider block">
                          {t.modes.occasion.dessert}
                        </span>
                        {menu.dessert ? (
                          <>
                            <h4 className="text-base font-bold text-[#231E1B] truncate">{menu.dessert.name}</h4>
                            <p className="text-xs text-[#786F68]">{menu.dessert.category}</p>
                          </>
                        ) : (
                          <p className="text-xs text-[#BD5338] font-medium">{t.modes.occasion.emptyCategoryNotice}</p>
                        )}
                      </div>
                    </div>

                    {menu.dessert ? (
                      <button
                        type="button"
                        onClick={() => handleRegenerateSlot('dessert')}
                        className="px-2.5 py-1.5 rounded-lg border border-[#DCD5C9] bg-white hover:bg-[#F7F3EC] text-xs font-medium text-[#4A423D] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 text-[#786F68]" />
                        <span className="hidden sm:inline">{t.modes.occasion.changeItem}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          handleClose();
                          onOpenAddDishForCategory('Desserts');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[#D97706] text-white text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{t.modes.occasion.addCategoryDish}</span>
                      </button>
                    )}
                  </div>

                  {/* 4. Drink */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-[#3E6B89]/10 text-[#3E6B89] flex items-center justify-center shrink-0">
                        <Wine className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-[#3E6B89] uppercase tracking-wider block">
                          {t.modes.occasion.drink}
                        </span>
                        {menu.drink ? (
                          <>
                            <h4 className="text-base font-bold text-[#231E1B] truncate">{menu.drink.name}</h4>
                            <p className="text-xs text-[#786F68]">{menu.drink.category}</p>
                          </>
                        ) : (
                          <p className="text-xs text-[#BD5338] font-medium">You haven't added any drinks to your library yet.</p>
                        )}
                      </div>
                    </div>

                    {menu.drink ? (
                      <button
                        type="button"
                        onClick={() => handleRegenerateSlot('drink')}
                        className="px-2.5 py-1.5 rounded-lg border border-[#DCD5C9] bg-white hover:bg-[#F7F3EC] text-xs font-medium text-[#4A423D] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 text-[#786F68]" />
                        <span className="hidden sm:inline">{t.modes.occasion.changeItem}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          handleClose();
                          onOpenAddDishForCategory('Drinks');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[#3E6B89] text-white text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{t.modes.occasion.addCategoryDish}</span>
                      </button>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-[#FAF7F2] border-t border-[#E8E2D9] flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={handleSaveAndAddToCalendar}
                className="w-full sm:flex-1 min-h-[44px] rounded-xl bg-[#BD5338] hover:bg-[#A9452C] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.modes.occasion.addToCalendar}</span>
              </button>

              <button
                type="button"
                onClick={() => buildMenu()}
                className="w-full sm:w-auto min-h-[44px] px-4 rounded-xl border border-[#DCD5C9] bg-white hover:bg-[#F7F3EC] text-[#4A423D] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#786F68]" />
                <span>{t.modes.occasion.generateMenu}</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto min-h-[44px] px-3 text-xs text-[#786F68] hover:text-[#231E1B] font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
