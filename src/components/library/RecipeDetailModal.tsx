import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Clock, Utensils, Heart, Edit3 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RecipeDetailModalProps {
  dishId: string | null;
  onClose: () => void;
  onEdit: (dishId: string) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ dishId, onClose, onEdit }) => {
  const { library, logCompletedMeal, setTodaySelectedMeal, toggleFavorite, preferences } = useApp();

  if (!dishId) return null;
  const dish = library.find(d => d.id === dishId);
  if (!dish) return null;

  const handleClose = () => {
    onClose();
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCookToday = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#BD5338', '#557A66', '#D97706'],
    });
    logCompletedMeal(dish.id, 'dinner');
    setTodaySelectedMeal(dish);
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
        className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Cover Photo if available */}
        {dish.imageUrl && (
          <div className="relative h-48 w-full bg-[#EFEAE2]">
            <img
              src={dish.imageUrl}
              alt={dish.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => toggleFavorite(dish.id)}
                className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer ${
                  dish.isFavorite ? 'bg-[#BD5338] text-white' : 'bg-black/40 text-white/90 hover:bg-black/60'
                }`}
              >
                <Heart className={`w-4 h-4 ${dish.isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close modal"
                className="min-h-[44px] min-w-[44px] rounded-full bg-black/40 text-white hover:bg-black/60 active:bg-black/80 backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <span className="text-xs text-white/80">{dish.category}</span>
              <h3 className="text-xl font-bold">{dish.name}</h3>
              {dish.nameUrdu && (
                <p className="text-sm text-white/90 font-urdu">{dish.nameUrdu}</p>
              )}
            </div>
          </div>
        )}

        {/* Header without photo */}
        {!dish.imageUrl && (
          <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E8E2D9] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#786F68]">{dish.category}</span>
              <h3 className="text-lg font-bold text-[#231E1B]">{dish.name}</h3>
              {dish.nameUrdu && <p className="text-xs text-[#786F68] font-urdu">{dish.nameUrdu}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleFavorite(dish.id)}
                className={`min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  dish.isFavorite ? 'text-[#BD5338] bg-[#BD5338]/10' : 'text-[#786F68] hover:bg-[#EFEAE2]'
                }`}
              >
                <Heart className={`w-4 h-4 ${dish.isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close modal"
                className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-[#5C534E] hover:text-[#231E1B] hover:bg-[#EAE4DC] active:bg-[#DFD7CD] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Metadata banner */}
          <div className="flex items-center gap-4 text-xs text-[#786F68] pb-3 border-b border-[#E8E2D9]">
            {dish.prepTimeMinutes && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#BD5338]" />
                <span>{dish.prepTimeMinutes} mins prep</span>
              </div>
            )}
            <span>Category: {dish.category}</span>
          </div>

          {/* Notes */}
          {dish.notes && (
            <div className="p-3.5 rounded-xl bg-[#F4EFEA] border border-[#E8E2D9] text-xs text-[#4A423D]">
              <span className="font-bold text-[#231E1B] block mb-0.5">Family Notes:</span>
              <p>{dish.notes}</p>
            </div>
          )}

          {/* Ingredients */}
          {dish.ingredients && dish.ingredients.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#231E1B] uppercase tracking-wider mb-1.5">
                Key Ingredients
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {dish.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="text-xs bg-white border border-[#E8E2D9] rounded-lg px-2.5 py-1 text-[#4A423D]"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recipe / Method */}
          <div>
            <h4 className="text-xs font-bold text-[#231E1B] uppercase tracking-wider mb-1.5">
              Cooking Method
            </h4>
            {dish.recipe ? (
              <div className="p-4 rounded-xl bg-white border border-[#E8E2D9] text-xs text-[#4A423D] leading-relaxed whitespace-pre-line">
                {dish.recipe}
              </div>
            ) : (
              <p className="text-xs text-[#786F68] italic">
                {preferences.language === 'ur'
                  ? 'کوئی تفصیلی طریقہ محفوظ نہیں ہے۔ آپ خود اس ڈش کے ماہر ہیں!'
                  : 'No written recipe was provided. You are the expert cook! The AI simply helps decide when to prepare it.'}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#E8E2D9] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-2 rounded-xl border border-[#DCD5C9] bg-white hover:bg-[#F7F3EC] text-xs font-semibold text-[#5C534E] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                handleClose();
                onEdit(dish.id);
              }}
              className="px-3.5 py-2 rounded-xl border border-[#DCD5C9] bg-white hover:bg-[#F7F3EC] text-xs font-medium text-[#4A423D] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Dish</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCookToday}
            className="px-5 py-2.5 rounded-xl bg-[#BD5338] hover:bg-[#A9452C] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Cook This Today</span>
          </button>
        </div>
      </div>
    </div>
  );
};
