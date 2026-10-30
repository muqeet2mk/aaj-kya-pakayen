import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Dish, FoodCategory } from '../../types';
import { DEFAULT_CATEGORIES } from '../../data/demoData';
import { X, Clock, Image as ImageIcon, Check } from 'lucide-react';

interface DishFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  dishToEdit?: Dish | null;
  initialCategory?: string;
}

const PRESET_IMAGES = [
  { label: 'Biryani / Festive Rice', url: '/src/assets/images/biryani_feast_1793379687369.jpg' },
  { label: 'Chicken Karahi / Red Gravy', url: '/src/assets/images/karahi_chicken_1793379687616.jpg' },
  { label: 'Tadka Daal & Rice', url: '/src/assets/images/lentil_daal_rice_1793379687995.jpg' },
  { label: 'Traditional Kheer / Dessert', url: '/src/assets/images/dessert_kheer_1793379688684.jpg' },
];

export const DishFormModal: React.FC<DishFormModalProps> = ({
  isOpen,
  onClose,
  dishToEdit,
  initialCategory,
}) => {
  const { addDish, updateDish, t, preferences } = useApp();

  const [name, setName] = useState('');
  const [nameUrdu, setNameUrdu] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Main Course');
  const [customCategory, setCustomCategory] = useState('');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<string>('');
  const [recipe, setRecipe] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (dishToEdit) {
        setName(dishToEdit.name);
        setNameUrdu(dishToEdit.nameUrdu || '');
        if (DEFAULT_CATEGORIES.includes(dishToEdit.category)) {
          setCategory(dishToEdit.category);
          setCustomCategory('');
        } else {
          setCategory('Custom');
          setCustomCategory(dishToEdit.category);
        }
        setPrepTimeMinutes(dishToEdit.prepTimeMinutes ? String(dishToEdit.prepTimeMinutes) : '');
        setRecipe(dishToEdit.recipe || '');
        setIngredientsText((dishToEdit.ingredients || []).join(', '));
        setNotes(dishToEdit.notes || '');
        setImageUrl(dishToEdit.imageUrl || '');
      } else {
        setName('');
        setNameUrdu('');
        setCategory((initialCategory as FoodCategory) || 'Main Course');
        setCustomCategory('');
        setPrepTimeMinutes('');
        setRecipe('');
        setIngredientsText('');
        setNotes('');
        setImageUrl('');
      }
      setError('');
    }
  }, [isOpen, dishToEdit, initialCategory]);

  const handleClose = () => {
    setError('');
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(preferences.language === 'ur' ? 'ڈش کا نام درج کرنا ضروری ہے۔' : 'Please enter a dish name.');
      return;
    }

    const finalCategory = category === 'Custom' ? (customCategory.trim() || 'Other') : category;
    const ingredients = ingredientsText
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    const parsedTime = prepTimeMinutes ? parseInt(prepTimeMinutes, 10) : undefined;

    if (dishToEdit) {
      updateDish(dishToEdit.id, {
        name: name.trim(),
        nameUrdu: nameUrdu.trim() || undefined,
        category: finalCategory,
        prepTimeMinutes: isNaN(Number(parsedTime)) ? undefined : parsedTime,
        recipe: recipe.trim() || undefined,
        ingredients: ingredients.length > 0 ? ingredients : undefined,
        notes: notes.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      });
    } else {
      addDish({
        name: name.trim(),
        nameUrdu: nameUrdu.trim() || undefined,
        category: finalCategory,
        prepTimeMinutes: isNaN(Number(parsedTime)) ? undefined : parsedTime,
        recipe: recipe.trim() || undefined,
        ingredients: ingredients.length > 0 ? ingredients : undefined,
        notes: notes.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        isFavorite: false,
      });
    }

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
        {/* Header */}
        <div className="px-5 py-4 bg-[#FAF7F2] border-b border-[#E8E2D9] flex items-center justify-between">
          <h3 className="text-base font-bold text-[#231E1B]">
            {dishToEdit ? t.library.editDish : t.library.addNewDish}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-[#5C534E] hover:text-[#231E1B] hover:bg-[#EAE4DC] active:bg-[#DFD7CD] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Dish Name (Required) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#231E1B] mb-1">
                {t.library.dishNameLabel}
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Chicken Karahi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-white text-xs text-[#231E1B] focus:outline-none focus:ring-2 focus:ring-[#BD5338]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#786F68] mb-1">
                Urdu Name (اردو نام، اختیاری)
              </label>
              <input
                type="text"
                value={nameUrdu}
                onChange={e => setNameUrdu(e.target.value)}
                placeholder="مثلاً چکن کڑاہی"
                dir="rtl"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-white text-xs text-[#231E1B] font-urdu focus:outline-none focus:ring-2 focus:ring-[#BD5338]"
              />
            </div>
          </div>

          {/* Category & Prep Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#231E1B] mb-1">
                {t.library.categoryLabel}
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as FoodCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#DCD5C9] bg-white text-xs text-[#231E1B] focus:outline-none focus:ring-2 focus:ring-[#BD5338]"
              >
                {DEFAULT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Custom">+ Custom Category</option>
              </select>

              {category === 'Custom' && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category"
                  className="w-full mt-2 px-3 py-2 rounded-xl border border-[#DCD5C9] bg-white text-xs text-[#231E1B]"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#786F68] mb-1">
                {t.library.prepTimeLabel}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={prepTimeMinutes}
                  onChange={e => setPrepTimeMinutes(e.target.value)}
                  placeholder="e.g. 35"
                  min="0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-white text-xs text-[#231E1B] focus:outline-none focus:ring-2 focus:ring-[#BD5338]"
                />
                <Clock className="w-3.5 h-3.5 text-[#786F68] absolute right-3 top-3" />
              </div>
            </div>
          </div>

          {/* Key Ingredients (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-[#4A423D]">
                {t.library.ingredientsLabel}
              </label>
              <span className="text-[11px] text-[#786F68]">Comma separated</span>
            </div>
            <input
              type="text"
              value={ingredientsText}
              onChange={e => setIngredientsText(e.target.value)}
              placeholder={t.library.ingredientsHelp}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-white text-xs text-[#231E1B] focus:outline-none focus:ring-2 focus:ring-[#BD5338]"
            />
          </div>

          {/* Recipe / Cooking Instructions (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-[#4A423D]">
                {t.library.recipeLabel}
              </label>
              <span className="text-[11px] text-[#BD5338] font-medium">
                {t.library.recipeOptional}
              </span>
            </div>
            <textarea
              rows={3}
              value={recipe}
              onChange={e => setRecipe(e.target.value)}
              placeholder="e.g. Sauté onions in ghee, add chicken and spices, simmer on dum for 20 minutes..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-white text-xs text-[#231E1B] focus:outline-none focus:ring-2 focus:ring-[#BD5338]"
            />
          </div>

          {/* Family Notes (Optional) */}
          <div>
            <label className="block text-xs font-medium text-[#4A423D] mb-1">
              {t.library.notesLabel}
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Kids prefer less spicy, cook with extra ginger"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-white text-xs text-[#231E1B] focus:outline-none focus:ring-2 focus:ring-[#BD5338]"
            />
          </div>

          {/* Preset Food Image Picker */}
          <div>
            <label className="block text-xs font-medium text-[#4A423D] mb-2">
              {t.library.imageSelectLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_IMAGES.map((preset, idx) => {
                const isSelected = imageUrl === preset.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(isSelected ? '' : preset.url)}
                    className={`relative rounded-xl overflow-hidden border-2 text-left transition-all cursor-pointer ${
                      isSelected ? 'border-[#BD5338] ring-2 ring-[#BD5338]/30' : 'border-[#E8E2D9] hover:border-[#BD5338]/50'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      referrerPolicy="no-referrer"
                      className="w-full h-16 object-cover"
                    />
                    <div className="p-1 bg-white text-[10px] font-medium text-[#4A423D] truncate">
                      {preset.label}
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#BD5338] text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E8E2D9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#DCD5C9] bg-white text-xs font-medium text-[#786F68] hover:bg-[#F7F3EC] transition-colors cursor-pointer"
            >
              {t.library.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#BD5338] hover:bg-[#A9452C] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              {t.library.saveDish}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
