import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Dish, FoodCategory } from '../../types';
import { getDaysSinceLastCooked } from '../../services/recommendationEngine';
import { Search, Plus, Heart, Clock, Utensils, Edit2, Trash2, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LibraryViewProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (dish: Dish) => void;
  onOpenRecipeDetail: (dishId: string) => void;
  onOpenQuickStarter?: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  onOpenAddModal,
  onOpenEditModal,
  onOpenRecipeDetail,
  onOpenQuickStarter,
}) => {
  const { library, mealHistory, deleteDish, toggleFavorite, logCompletedMeal, setTodaySelectedMeal, t, preferences } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'recent_added' | 'most_cooked' | 'least_cooked' | 'favorites'>('name');
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(library.map(d => d.category)))];
  }, [library]);

  const filteredDishes = useMemo(() => {
    return library.filter(dish => {
      const matchSearch =
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dish.nameUrdu && dish.nameUrdu.includes(searchQuery)) ||
        (dish.ingredients && dish.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchCategory = selectedCategory === 'all' || dish.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [library, searchQuery, selectedCategory]);

  const sortedDishes = useMemo(() => {
    const list = [...filteredDishes];
    switch (sortBy) {
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'recent_added':
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'favorites':
        return list.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
      case 'most_cooked':
        return list.sort((a, b) => {
          const countA = mealHistory.filter(h => h.dishId === a.id && h.isCompleted).length;
          const countB = mealHistory.filter(h => h.dishId === b.id && h.isCompleted).length;
          return countB - countA;
        });
      case 'least_cooked':
        return list.sort((a, b) => {
          const { daysAgo: daysA } = getDaysSinceLastCooked(a.id, mealHistory);
          const { daysAgo: daysB } = getDaysSinceLastCooked(b.id, mealHistory);
          const valA = daysA === null ? 999 : daysA;
          const valB = daysB === null ? 999 : daysB;
          return valB - valA;
        });
      default:
        return list;
    }
  }, [filteredDishes, sortBy, mealHistory]);

  const handleCookToday = (dish: Dish, e: React.MouseEvent) => {
    e.stopPropagation();
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#BD5338', '#557A66', '#D97706'],
    });
    logCompletedMeal(dish.id, 'dinner');
    setTodaySelectedMeal(dish);
  };

  const confirmDelete = () => {
    if (dishToDelete) {
      deleteDish(dishToDelete.id);
      setDishToDelete(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Page Title & Add CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#231E1B]">
            {t.library.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#786F68] mt-1 max-w-xl">
            {t.library.subtitle}
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#BD5338] hover:bg-[#A9452C] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.library.addNewDish}</span>
        </button>
      </div>

      {/* Search, Category Bar & Sort Controls */}
      <div className="space-y-3 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8E2D9]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#786F68] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.library.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#DCD5C9] text-xs text-[#231E1B] placeholder-[#786F68] focus:outline-none focus:ring-2 focus:ring-[#BD5338]"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#5C534E] font-medium">{t.library.sortBy}</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2.5 py-2 rounded-xl bg-white border border-[#DCD5C9] text-xs text-[#231E1B] focus:outline-none"
            >
              <option value="name">{t.library.sortName}</option>
              <option value="recent_added">{t.library.sortRecentAdded}</option>
              <option value="most_cooked">{t.library.sortMostCooked}</option>
              <option value="least_cooked">{t.library.sortLeastCooked}</option>
              <option value="favorites">{t.library.sortFavorites}</option>
            </select>
          </div>
        </div>

        {/* Category Horizontal Filter Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#231E1B] text-white shadow-sm'
                    : 'bg-white/80 border border-[#DCD5C9] text-[#5C534E] hover:text-[#231E1B]'
                }`}
              >
                {cat === 'all' ? t.library.allCategories : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Library Grid or Empty State */}
      {sortedDishes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#E8E2D9]">
          <div className="w-14 h-14 rounded-full bg-[#BD5338]/10 text-[#BD5338] flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#231E1B] mb-1.5">
            {searchQuery || selectedCategory !== 'all'
              ? 'No matching dishes found'
              : t.library.emptyTitle}
          </h3>
          <p className="text-xs text-[#786F68] max-w-md mx-auto mb-6">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your search terms or category filter.'
              : t.library.emptySubtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#BD5338] hover:bg-[#A9452C] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t.library.addNewDish}</span>
            </button>
            {onOpenQuickStarter && (
              <button
                onClick={onOpenQuickStarter}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#DCD5C9] bg-white hover:bg-[#F7F3EC] text-[#4A423D] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#BD5338]" />
                <span>Browse Common Family Dishes</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedDishes.map(dish => {
            const { daysAgo, count } = getDaysSinceLastCooked(dish.id, mealHistory);
            return (
              <div
                key={dish.id}
                onClick={() => onOpenRecipeDetail(dish.id)}
                className="group relative rounded-2xl bg-white border border-[#E8E2D9] hover:border-[#BD5338]/40 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
              >
                {/* Visual Image / Top Header */}
                {dish.imageUrl ? (
                  <div className="relative h-40 w-full bg-[#EFEAE2] overflow-hidden">
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(dish.id);
                      }}
                      className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer ${
                        dish.isFavorite ? 'bg-[#BD5338] text-white' : 'bg-black/30 text-white hover:bg-black/50'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${dish.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <span className="text-[11px] text-white/90 font-medium">{dish.category}</span>
                      <h3 className="text-base font-bold leading-tight drop-shadow-sm truncate">
                        {dish.name}
                      </h3>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-b border-[#F4EFEA] bg-gradient-to-br from-[#FFFDF9] to-[#F7F3EC] flex items-start justify-between">
                    <div>
                      <span className="text-[11px] text-[#786F68] font-medium block">{dish.category}</span>
                      <h3 className="text-base font-bold text-[#231E1B] leading-snug">{dish.name}</h3>
                      {dish.nameUrdu && (
                        <p className="text-xs text-[#786F68] font-urdu mt-0.5">{dish.nameUrdu}</p>
                      )}
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(dish.id);
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        dish.isFavorite ? 'text-[#BD5338] bg-[#BD5338]/10' : 'text-[#786F68] hover:bg-[#EAE4DC]'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${dish.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                )}

                {/* Body info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    {/* Unboxed metadata row with separators */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#786F68]">
                      <span>{daysAgo === null ? 'Never cooked' : `Last: ${daysAgo}d ago`}</span>
                      <span aria-hidden="true">·</span>
                      <span>Cooked {count}x</span>
                      {dish.prepTimeMinutes && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {dish.prepTimeMinutes}m
                          </span>
                        </>
                      )}
                    </div>

                    {dish.notes && (
                      <p className="text-xs text-[#5C534E] line-clamp-2 leading-relaxed">
                        {dish.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-[#F4EFEA] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onOpenEditModal(dish);
                        }}
                        title="Edit dish"
                        className="p-1.5 rounded-lg text-[#786F68] hover:text-[#231E1B] hover:bg-[#F4EFEA] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setDishToDelete(dish);
                        }}
                        title="Delete dish"
                        className="p-1.5 rounded-lg text-[#786F68] hover:text-[#BD5338] hover:bg-[#F4EFEA] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={e => handleCookToday(dish, e)}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#BD5338] text-[#BD5338] hover:text-white border border-[#E8E2D9] hover:border-[#BD5338] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Utensils className="w-3 h-3" />
                      <span>{t.library.cookTodayAction}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {dishToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl border border-[#E8E2D9]">
            <h4 className="text-base font-bold text-[#231E1B]">Remove Dish?</h4>
            <p className="text-xs text-[#786F68] mt-1 leading-relaxed">
              Are you sure you want to remove <strong className="text-[#231E1B]">{dishToDelete.name}</strong> from your library?
              This will not delete its past meal records in your calendar history.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setDishToDelete(null)}
                className="px-3.5 py-2 rounded-xl border border-[#DCD5C9] text-xs font-medium text-[#786F68] hover:bg-[#F7F3EC]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Delete Dish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
