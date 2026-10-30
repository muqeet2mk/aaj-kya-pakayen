import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MealType, Dish } from '../../types';
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Calendar as CalendarIcon, Clock, Trash2, Utensils, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CalendarView: React.FC = () => {
  const {
    library,
    mealHistory,
    plannedMeals,
    logCompletedMeal,
    planMeal,
    markPlannedMealAsCompleted,
    deleteMealHistoryEntry,
    deletePlannedMealEntry,
    t,
    preferences,
  } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');

  // Modal to add entry to selected date
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<'completed' | 'planned'>('completed');
  const [selectedDishId, setSelectedDishId] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('dinner');
  const [entryNotes, setEntryNotes] = useState<string>('');

  // Helpers for monthly grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Meals for currently selected date
  const selectedDateHistory = mealHistory.filter(h => h.date === selectedDateStr && h.isCompleted);
  const selectedDatePlanned = plannedMeals.filter(p => p.date === selectedDateStr && !p.isCompleted);

  const handleOpenAddModal = (type: 'completed' | 'planned') => {
    setEntryType(type);
    setSelectedDishId(library[0]?.id || '');
    setSelectedMealType('dinner');
    setEntryNotes('');
    setIsAddModalOpen(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDishId) return;

    if (entryType === 'completed') {
      logCompletedMeal(selectedDishId, selectedMealType, selectedDateStr, entryNotes.trim() || undefined);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
      });
    } else {
      planMeal(selectedDishId, selectedMealType, selectedDateStr, entryNotes.trim() || undefined);
    }
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Title & Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#231E1B]">
            {t.calendar.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#786F68] mt-1">
            {t.calendar.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={jumpToToday}
            className="px-3 py-1.5 rounded-xl border border-[#DCD5C9] bg-white hover:bg-[#F7F3EC] text-xs font-semibold text-[#4A423D] transition-colors cursor-pointer"
          >
            {t.calendar.todayButton}
          </button>

          <div className="flex items-center rounded-xl border border-[#DCD5C9] bg-white p-0.5">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'month' ? 'bg-[#BD5338] text-white' : 'text-[#786F68]'
              }`}
            >
              {t.calendar.monthView}
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'day' ? 'bg-[#BD5338] text-white' : 'text-[#786F68]'
              }`}
            >
              {t.calendar.dayView}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Date Detail on Right (Desktop 2-col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar View Container */}
        <div className={`${viewMode === 'day' ? 'hidden lg:block lg:col-span-7' : 'lg:col-span-7'} bg-white rounded-3xl border border-[#E8E2D9] p-5 shadow-xs`}>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#231E1B]">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl text-[#786F68] hover:text-[#231E1B] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl text-[#786F68] hover:text-[#231E1B] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#786F68] mb-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots for month start */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 rounded-xl bg-transparent" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDateStr === dateStr;
              const todayStr = new Date().toISOString().split('T')[0];
              const isToday = todayStr === dateStr;

              // Check meals on this day
              const dayCompleted = mealHistory.filter(h => h.date === dateStr && h.isCompleted);
              const dayPlanned = plannedMeals.filter(p => p.date === dateStr && !p.isCompleted);

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    setSelectedDateStr(dateStr);
                    if (viewMode === 'day') setViewMode('day');
                  }}
                  className={`h-16 p-1 rounded-xl flex flex-col justify-between text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#BD5338]/10 border-2 border-[#BD5338]'
                      : isToday
                      ? 'bg-[#F4EFEA] border border-[#DCD5C9]'
                      : 'hover:bg-[#FAF7F2] border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-[#BD5338] text-white flex items-center justify-center text-[10px]'
                          : isSelected
                          ? 'text-[#BD5338] font-bold'
                          : 'text-[#231E1B]'
                      }`}
                    >
                      {dayNum}
                    </span>
                  </div>

                  {/* Indicators */}
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    {dayCompleted.slice(0, 1).map(m => (
                      <span
                        key={m.id}
                        className="text-[9px] truncate px-1 py-0.2 rounded bg-[#E8F5E9] text-[#2E7D32] font-medium"
                      >
                        ✓ {m.dishName}
                      </span>
                    ))}
                    {dayPlanned.slice(0, 1).map(p => (
                      <span
                        key={p.id}
                        className="text-[9px] truncate px-1 py-0.2 rounded bg-[#FFF3E0] text-[#E65100] font-medium"
                      >
                        ⏱ {p.dishName}
                      </span>
                    ))}
                    {dayCompleted.length + dayPlanned.length > 2 && (
                      <span className="text-[8px] text-[#786F68] font-bold px-1">
                        +{dayCompleted.length + dayPlanned.length - 1} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D9]">
              <div>
                <span className="text-xs text-[#786F68] font-medium">Selected Date</span>
                <h3 className="text-base font-bold text-[#231E1B]">
                  {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenAddModal('completed')}
                  className="px-2.5 py-1.5 rounded-xl bg-[#557A66] hover:bg-[#466654] text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.calendar.logCookedMeal}</span>
                </button>

                <button
                  onClick={() => handleOpenAddModal('planned')}
                  className="px-2.5 py-1.5 rounded-xl border border-[#DCD5C9] bg-white hover:bg-[#F7F3EC] text-xs font-semibold text-[#4A423D] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Plan</span>
                </button>
              </div>
            </div>

            {/* List of completed meals */}
            <div className="py-4 space-y-3">
              <span className="text-xs font-bold text-[#557A66] uppercase tracking-wider block">
                {t.calendar.completedBadge} ({selectedDateHistory.length})
              </span>

              {selectedDateHistory.length === 0 ? (
                <p className="text-xs text-[#786F68] italic py-1">
                  No completed meals recorded on this day.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDateHistory.map(entry => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-2xl bg-[#F7FAF8] border border-[#D5E5DC] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-[#557A66] shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#231E1B] truncate">{entry.dishName}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#786F68]">
                            <span className="capitalize">{entry.mealType}</span>
                            <span aria-hidden="true">·</span>
                            <span>{entry.category}</span>
                          </div>
                          {entry.notes && (
                            <p className="text-[11px] text-[#5C534E] mt-0.5">{entry.notes}</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteMealHistoryEntry(entry.id)}
                        title="Delete meal record"
                        className="p-1.5 rounded-lg text-[#786F68] hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* List of planned meals */}
            <div className="pt-3 border-t border-[#E8E2D9] space-y-3">
              <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider block">
                {t.calendar.plannedBadge} ({selectedDatePlanned.length})
              </span>

              {selectedDatePlanned.length === 0 ? (
                <p className="text-xs text-[#786F68] italic py-1">
                  No meals scheduled for this day.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDatePlanned.map(plan => (
                    <div
                      key={plan.id}
                      className="p-3 rounded-2xl bg-[#FFFDF7] border border-[#FDE6C8] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Clock className="w-4 h-4 text-[#D97706] shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#231E1B] truncate">{plan.dishName}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#786F68]">
                            <span className="capitalize">{plan.mealType}</span>
                            <span aria-hidden="true">·</span>
                            <span>{plan.category}</span>
                          </div>
                          {plan.notes && (
                            <p className="text-[11px] text-[#5C534E] mt-0.5">{plan.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => markPlannedMealAsCompleted(plan.id)}
                          title="Mark as actually cooked"
                          className="px-2 py-1 rounded-lg bg-[#557A66] text-white text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Cooked!</span>
                        </button>
                        <button
                          onClick={() => deletePlannedMealEntry(plan.id)}
                          title="Delete planned meal"
                          className="p-1.5 rounded-lg text-[#786F68] hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Schedule Meal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#FAF8F5] rounded-3xl p-6 shadow-2xl border border-[#E8E2D9]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9] mb-4">
              <h3 className="text-base font-bold text-[#231E1B]">
                {entryType === 'completed' ? 'Record Cooked Meal' : 'Schedule Planned Meal'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#786F68] hover:text-[#231E1B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#231E1B] mb-1">
                  Select Dish from Library *
                </label>
                <select
                  value={selectedDishId}
                  onChange={e => setSelectedDishId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#DCD5C9] bg-white text-xs text-[#231E1B] focus:outline-none focus:ring-2 focus:ring-[#BD5338]"
                >
                  {library.map(dish => (
                    <option key={dish.id} value={dish.id}>
                      {dish.name} ({dish.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#231E1B] mb-1">
                    Meal Type
                  </label>
                  <select
                    value={selectedMealType}
                    onChange={e => setSelectedMealType(e.target.value as MealType)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCD5C9] bg-white text-xs text-[#231E1B]"
                  >
                    <option value="dinner">{t.calendar.dinner}</option>
                    <option value="lunch">{t.calendar.lunch}</option>
                    <option value="breakfast">{t.calendar.breakfast}</option>
                    <option value="snack">{t.calendar.snack}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#231E1B] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDateStr}
                    onChange={e => setSelectedDateStr(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCD5C9] bg-white text-xs text-[#231E1B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A423D] mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={entryNotes}
                  onChange={e => setEntryNotes(e.target.value)}
                  placeholder="e.g. Cooked with extra mint raita"
                  className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-white text-xs text-[#231E1B]"
                />
              </div>

              <div className="pt-3 border-t border-[#E8E2D9] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-[#DCD5C9] text-xs font-medium text-[#786F68] hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#BD5338] text-white text-xs font-semibold shadow-sm hover:bg-[#A9452C]"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
